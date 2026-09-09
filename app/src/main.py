"""A self-hosted charting tool -- price charts with indicators, behind a sign-in.

Started in the container via uvicorn (see Dockerfile). Create a user with:

    docker compose exec chart python -m src.cli adduser robert

The code is English throughout; the interface is German by default and can be
switched to English (see i18n.py and /lang below). Everything a visitor gets
to read comes from there, nothing is written inline.
"""

import datetime
import hmac
import json
import logging
import os
import sys
import threading
import time
from urllib.parse import urlsplit

from fastapi import Body, Depends, FastAPI, Form, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from . import audit, auth, config, db, i18n, series, yahoo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger("chart")

if not config.SECRET_KEY or len(config.SECRET_KEY) < 32:
    raise SystemExit(
        "SECRET_KEY is missing or too short. Set it in .env:\n"
        '  SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")'
    )

app = FastAPI(title=config.BRAND, docs_url=None, redoc_url=None, openapi_url=None)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


def brand_parts() -> tuple[str, str]:
    """config.BRAND split for the two weights the template renders it in.

    Up to the first dot goes into the strong part, the dot and everything
    after it into the muted one. A name without a dot stays in one piece.
    """
    head, dot, tail = config.BRAND.partition(".")
    return head, dot + tail


def _asset_version() -> str:
    """Identifier for the static files, from their modification time.

    Without it the browser keeps serving its cached app.js after a rebuild --
    the page itself is dynamic and therefore always fresh. Old and new then no
    longer fit together: an element the new template no longer contains makes
    the old script break off with "Cannot read properties of null", and it
    does so before the first API call. That shows up as an empty page without
    favorites and without a chart. Exactly that happened on 2026-09-05, when
    the "Anzeigen" button was dropped.
    """
    newest = 0.0
    for name in ("static/app.js", "static/style.css", "static/favicon.png",
                 "static/favicon.ico", "static/apple-touch-icon.png"):
        try:
            newest = max(newest, os.path.getmtime(name))
        except OSError:
            pass
    return str(int(newest))


ASSET_VERSION = _asset_version()

db.init()
db.migrate()
db.cleanup()
audit.init()


def _cleanup_loop() -> None:
    """Clears expired sessions and old failed attempts every hour.

    db.cleanup() used to run only at startup. Between two rebuilds
    login_attempts therefore grew without bound -- with no effect on the
    lockout, which filters by timestamp, but the table never got smaller
    again.

    A thread of its own suffices: db.cursor() opens its own SQLite connection
    per call, so there is nothing to share. daemon=True, so that it does not
    hold up shutting the container down.
    """
    while True:
        time.sleep(3600)
        try:
            db.cleanup()
        except Exception:
            log.exception("Periodic clean-up failed")


threading.Thread(target=_cleanup_loop, daemon=True, name="cleanup").start()

# Everything is served locally, so the policy gets by without 'unsafe-*' and
# without foreign sources.
CSP = (
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
    "connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; "
    "form-action 'self'; frame-ancestors 'none'"
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = CSP
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "same-origin"
    response.headers["X-Frame-Options"] = "DENY"
    return response


def client_ip(request: Request) -> str:
    """The visitor's real address.

    Deliberately X-Real-IP ONLY, which the vhost writes with
    "RequestHeader set" -- "set" replaces a value sent along, so the client
    cannot get past it.

    X-Forwarded-For is expressly NOT evaluated any more: mod_proxy appends the
    real address to an existing header instead of replacing it. Whoever sends
    "X-Forwarded-For: 1.2.3.4" themselves therefore stands in first place. The
    first entry read here previously was thus freely choosable -- and with it
    the key auth.is_locked() counts against. The lockout after five failed
    attempts could be bypassed entirely with a different header per request
    (verified on 2026-09-05).

    If the header is missing, the request is not going through the vhost --
    then the address of the connection itself will do.
    """
    real = request.headers.get("x-real-ip", "").strip()
    if real:
        return real
    return request.client.host if request.client else "?"


def current_user(request: Request):
    return auth.lookup_session(request.cookies.get(auth.SESSION_COOKIE))


def require_user(request: Request):
    user = current_user(request)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail=i18n.translate(i18n.from_request(request), "error.not_signed_in"),
        )
    return user


# --- Language -------------------------------------------------------------

@app.get("/lang/{code}")
def set_language(code: str, request: Request):
    """Switches the interface language and returns to the page it came from.

    A cookie rather than a setting per user: the choice concerns the browser
    in front of you, and the sign-in page needs it before there is a user at
    all. Everything else follows from it -- the templates render in this
    language, and app.js reads it back from <html lang>.
    """
    language = i18n.normalize(code)
    response = RedirectResponse(_safe_back(request), status_code=303)
    response.set_cookie(
        i18n.COOKIE, language, max_age=i18n.COOKIE_MAX_AGE, httponly=False,
        secure=config.COOKIE_SECURE, samesite="lax", path="/",
    )
    return response


def _safe_back(request: Request) -> str:
    """The page to return to after switching, taken from the Referer.

    Only our own pages, and only path plus query -- a Referer is freely
    chooseable by the client, and forwarding it unchecked would turn this into
    an open redirect. Anything else lands on the start page.
    """
    referer = request.headers.get("referer", "")
    if not referer:
        return "/"
    parts = urlsplit(referer)
    if parts.netloc and parts.netloc != request.url.netloc:
        return "/"
    if not parts.path.startswith("/") or parts.path.startswith("//"):
        return "/"
    if parts.path.startswith("/lang/"):
        # Do not bounce back into the switch itself.
        return "/"
    return parts.path + (f"?{parts.query}" if parts.query else "")


# --- Sign-in --------------------------------------------------------------

@app.get("/login", response_class=HTMLResponse)
def login_form(request: Request):
    if current_user(request):
        return RedirectResponse("/", status_code=303)
    language = i18n.from_request(request)
    csrf = auth.new_csrf_token()
    response = templates.TemplateResponse(
        request, "login.html",
        {"csrf": csrf, "error": None, "asset_version": ASSET_VERSION,
         "lang": language, "t": i18n.translator(language),
         "brand": brand_parts()}
    )
    # Double submit cookie: the form carries the same value as a hidden field,
    # a foreign form could not get at the cookie.
    #
    # httponly=True, even though the procedure is called plain "double
    # submit": the value is written into the form server-side by the template
    # (login.html), no script reads the cookie -- "chart_csrf" does not appear
    # in app.js. Being readable without need therefore buys nothing here.
    response.set_cookie(
        "chart_csrf", csrf, max_age=3600, httponly=True,
        secure=config.COOKIE_SECURE, samesite="strict", path="/",
    )
    return response


@app.post("/login", response_class=HTMLResponse)
def login_submit(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    csrf: str = Form(""),
    remember: str = Form(""),
):
    ip = client_ip(request)
    language = i18n.from_request(request)
    t = i18n.translator(language)

    def fail(message: str, status: int = 401):
        token = auth.new_csrf_token()
        resp = templates.TemplateResponse(
            request, "login.html",
            {"csrf": token, "error": message, "asset_version": ASSET_VERSION,
             "lang": language, "t": t, "brand": brand_parts()},
            status_code=status
        )
        resp.set_cookie(
            "chart_csrf", token, max_age=3600, httponly=True,
            secure=config.COOKIE_SECURE, samesite="strict", path="/",
        )
        return resp

    # Constant-time comparison -- as for the session in auth.lookup_session.
    # With a random token practically uncritical, but there is no reason to do
    # it right in one place and differently in the other.
    cookie_csrf = request.cookies.get("chart_csrf", "")
    if not csrf or not cookie_csrf or not hmac.compare_digest(csrf, cookie_csrf):
        return fail(t("error.session_expired"), 400)

    if auth.is_locked(ip):
        log.warning("Locked sign-in attempt for '%s' from %s", username, ip)
        audit.event("LOCKED", username, ip, "too many failed attempts")
        return fail(t("error.too_many_attempts", minutes=config.LOCKOUT_MINUTES), 429)

    # Every attempt costs a quarter second -- imperceptible when signing in,
    # but expensive for someone working through passwords.
    time.sleep(0.25)

    user_id = auth.verify(username, password, ip)
    if user_id is None:
        audit.event("FAILED", username, ip, "wrong name or password")
        return fail(t("error.bad_credentials"))

    token, ttl = auth.start_session(
        user_id, remember == "on", ip, request.headers.get("user-agent", "")
    )
    log.info("Successful sign-in for '%s' from %s", username, ip)
    duration = (
        f"{config.SESSION_REMEMBER_DAYS} days (stay signed in)"
        if remember == "on"
        else f"{config.SESSION_HOURS} hours"
    )
    audit.event(
        "LOGIN", username, ip,
        f"session {duration}, {request.headers.get('user-agent', '?')[:60]}",
    )

    response = RedirectResponse("/", status_code=303)
    response.set_cookie(
        auth.SESSION_COOKIE, token, max_age=ttl, httponly=True,
        secure=config.COOKIE_SECURE, samesite="strict", path="/",
    )
    response.delete_cookie("chart_csrf", path="/")
    return response


@app.post("/logout")
def logout(request: Request):
    # Look up who is leaving before ending it -- afterwards the session no
    # longer yields the name.
    user = current_user(request)
    if user:
        audit.event("LOGOUT", user["username"], client_ip(request))
    auth.end_session(request.cookies.get(auth.SESSION_COOKIE))
    response = RedirectResponse("/login", status_code=303)
    response.delete_cookie(auth.SESSION_COOKIE, path="/")
    return response


# --- Interface ------------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    user = current_user(request)
    if user is None:
        return RedirectResponse("/login", status_code=303)
    language = i18n.from_request(request)
    return templates.TemplateResponse(
        request, "index.html",
        {"username": user["username"], "asset_version": ASSET_VERSION,
         "lang": language, "t": i18n.translator(language),
         "brand": brand_parts()})


# --- API ------------------------------------------------------------------

def _parse_date(value: str | None, field: str, t):
    """ISO date from the address, or None."""
    if not value:
        return None
    try:
        return datetime.date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=t("error.invalid_date", field=t("field." + field), value=repr(value)),
        ) from exc


@app.get("/api/chart")
def api_chart(
    request: Request,
    symbol: str = Query(..., min_length=1, max_length=20),
    range: str = Query("1y"),
    # Freely chosen period. If they are set, they take precedence over range.
    start: str | None = Query(None, max_length=10),
    end: str | None = Query(None, max_length=10),
    user=Depends(require_user),
):
    language = i18n.from_request(request)
    t = i18n.translator(language)

    symbol = symbol.strip().upper()
    if not yahoo.valid_symbol(symbol):
        raise HTTPException(status_code=400, detail=t("error.invalid_symbol"))

    start_date = _parse_date(start, "start", t)
    end_date = _parse_date(end, "end", t)
    if start_date and end_date and end_date < start_date:
        raise HTTPException(status_code=400, detail=t("error.start_after_end"))
    if start_date and start_date > datetime.date.today():
        raise HTTPException(status_code=400, detail=t("error.start_in_future"))

    # What goes into the log as the period: the free selection if there is
    # one, otherwise the button (1y, 5y, ...).
    period = f"{start_date}..{end_date}" if (start_date or end_date) else range

    try:
        data = series.build(symbol, range, start_date, end_date, language)
    except yahoo.YahooError as exc:
        audit.event(
            "CHART", user["username"], client_ip(request),
            f"{symbol}  {period}  ERROR: {exc}",
        )
        # An empty period is an input by the visitor, not an outage at Yahoo
        # -- hence 400 instead of 502. Told apart by the exception class, not
        # by searching the message for a word (see yahoo.EmptyRange).
        code = 400 if isinstance(exc, yahoo.EmptyRange) else 502
        detail = t(exc.key, **exc.params) if exc.key else str(exc)
        raise HTTPException(status_code=code, detail=detail) from exc

    # The number of fetches goes into the log as well: it shows whether the
    # request came from our own store (0) or whether Yahoo had to be asked.
    fetch = data.get("fetch", {})
    audit.event(
        "CHART", user["username"], client_ip(request),
        f"{symbol}  {period}  {len(data['daily']['dates'])} days, "
        f"{fetch.get('requests', 0)} Yahoo request(s)",
    )
    return data


@app.get("/api/search")
def api_search(q: str = Query("", max_length=40), user=Depends(require_user)):
    return {"results": yahoo.search(q)}


# Panels of the daily chart. The titles live in the frontend; all that counts
# here is that the key is known -- that way nobody can put nonsense into the
# database. Only the set of valid keys, NO order: the default order lives with
# titles and heights in PANELS in app.js, so that everything visible sits in
# one place. An order prescribed here would silently override it.
PANEL_KEYS = ["price", "volume", "macd", "rsi", "bollinger", "vix", "ribbon"]


def _normalize_panels(wanted, t) -> list[dict]:
    """Brings a wanted panel list into a valid shape.

    Unknown keys drop out, duplicates are removed, and panels missing from the
    stored list move to the end as visible. That way a panel added later shows
    up by itself in existing settings instead of staying invisible.
    """
    out, seen = [], set()
    for entry in wanted or []:
        if not isinstance(entry, dict):
            continue
        key = entry.get("key")
        if key not in PANEL_KEYS or key in seen:
            continue
        seen.add(key)
        out.append({"key": key, "visible": bool(entry.get("visible", True))})

    for key in PANEL_KEYS:
        if key not in seen:
            out.append({"key": key, "visible": True})

    if not any(p["visible"] for p in out):
        raise HTTPException(status_code=400, detail=t("error.panel_min_one"))
    return out


@app.get("/api/settings")
def api_settings_get(request: Request, user=Depends(require_user)):
    t = i18n.translator(i18n.from_request(request))
    with db.cursor() as conn:
        rows = conn.execute(
            "SELECT key, value FROM settings WHERE user_id = ?", (user["user_id"],)
        ).fetchall()
    stored = {r["key"]: json.loads(r["value"]) for r in rows}
    if "panels" not in stored:
        # An empty list means: no choice of their own made. The frontend then
        # takes its own default order from PANELS.
        return {"panels": []}
    return {"panels": _normalize_panels(stored["panels"], t)}


@app.put("/api/settings/panels")
def api_settings_panels(
    request: Request,
    panels: list = Body(..., embed=True),
    user=Depends(require_user),
):
    t = i18n.translator(i18n.from_request(request))
    cleaned = _normalize_panels(panels, t)
    with db.cursor() as conn:
        conn.execute(
            "INSERT INTO settings (user_id, key, value) VALUES (?, 'panels', ?) "
            "ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value",
            (user["user_id"], json.dumps(cleaned, separators=(",", ":"))),
        )
    return {"panels": cleaned}


@app.delete("/api/settings/panels")
def api_settings_panels_reset(user=Depends(require_user)):
    with db.cursor() as conn:
        conn.execute(
            "DELETE FROM settings WHERE user_id = ? AND key = 'panels'",
            (user["user_id"],),
        )
    # As when reading: empty means "default from app.js".
    return {"panels": []}


@app.get("/api/watchlist")
def api_watchlist_get(user=Depends(require_user)):
    with db.cursor() as conn:
        rows = conn.execute(
            "SELECT symbol, label FROM watchlist WHERE user_id = ? ORDER BY sort, symbol",
            (user["user_id"],),
        ).fetchall()
    return {"items": [dict(r) for r in rows]}


@app.post("/api/watchlist")
def api_watchlist_add(
    request: Request,
    symbol: str = Form(...),
    label: str = Form(""),
    user=Depends(require_user),
):
    t = i18n.translator(i18n.from_request(request))
    symbol = symbol.strip().upper()
    if not yahoo.valid_symbol(symbol):
        raise HTTPException(status_code=400, detail=t("error.invalid_symbol"))

    # Only take in what really exists. The call loads the prices into the
    # store anyway, from which the watchlist reads right afterwards -- so it
    # is not wasted.
    try:
        series.quote(symbol)
    except yahoo.YahooError as exc:
        raise HTTPException(
            status_code=400, detail=t("error.symbol_not_found", symbol=symbol)
        ) from exc

    # Without a label supplied, look the name up once. Yahoo's price query
    # returns no company name, the symbol search does, and its result then
    # sits in the cache for a day.
    if not label.strip():
        for hit in yahoo.search(symbol, limit=5):
            if hit["symbol"].upper() == symbol:
                label = hit["name"]
                break

    with db.cursor() as conn:
        conn.execute(
            "INSERT INTO watchlist (user_id, symbol, label) VALUES (?, ?, ?) "
            "ON CONFLICT(user_id, symbol) DO UPDATE SET label = excluded.label",
            (user["user_id"], symbol, label[:60]),
        )
    return {"ok": True}


@app.get("/api/watchlist/quotes")
def api_watchlist_quotes(user=Depends(require_user)):
    """Favorites with their current price, daily change and history."""
    with db.cursor() as conn:
        rows = conn.execute(
            "SELECT symbol, label FROM watchlist WHERE user_id = ? ORDER BY sort, symbol",
            (user["user_id"],),
        ).fetchall()

    items = []
    for row in rows:
        entry = {"symbol": row["symbol"], "label": row["label"] or ""}
        try:
            entry.update(series.quote(row["symbol"]))
        except yahoo.YahooError as exc:
            # A single stubborn symbol must not tip over the list.
            log.warning("Favorite %s not available: %s", row["symbol"], exc)
            entry["error"] = str(exc)
        items.append(entry)
    return {"items": items}


@app.delete("/api/watchlist/{symbol}")
def api_watchlist_del(symbol: str, user=Depends(require_user)):
    with db.cursor() as conn:
        conn.execute(
            "DELETE FROM watchlist WHERE user_id = ? AND symbol = ?",
            (user["user_id"], symbol.strip().upper()),
        )
    return {"ok": True}


@app.get("/healthz")
def healthz():
    return JSONResponse({"status": "ok"})


@app.exception_handler(401)
def unauthorized(request: Request, exc: HTTPException):
    # Send page views to the sign-in, answer API calls cleanly with a 401.
    if request.url.path.startswith("/api/"):
        return JSONResponse(
            {"detail": i18n.translate(i18n.from_request(request), "error.not_signed_in")},
            status_code=401,
        )
    return RedirectResponse("/login", status_code=303)
