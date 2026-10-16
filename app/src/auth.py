"""Sign-in: Argon2id passwords, server-side sessions, lockout after failures."""

import hmac
import logging
import re
import secrets
import time

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from . import config, db

log = logging.getLogger("chart.auth")

# Argon2id with deliberately higher values than the library default. With a
# single user and one sign-in a day this costs us nothing, but it makes
# working through stolen hashes considerably more expensive.
_hasher = PasswordHasher(time_cost=3, memory_cost=64 * 1024, parallelism=2)

SESSION_COOKIE = "chart_session"

# Groups and what each one may do. "admin" implies everything; a user may be
# in several groups, the permissions add up.
GROUPS = ("admin", "portfolio", "general")
PERMISSIONS = {
    "app": {"admin", "portfolio", "general"},   # charts, favorites, notices
    "portfolio_view": {"admin", "portfolio"},     # the Portfolio Tracker tab
    "portfolio_edit": {"admin"},                # entering and deleting its trades
    "admin": {"admin"},                       # the user management
}

USERNAME_RE = re.compile(r"^[a-z0-9._-]{2,32}$")
MIN_PASSWORD = 12
MAX_PASSWORD = 200


def groups_of(user_id: int) -> list[str]:
    with db.cursor() as conn:
        rows = conn.execute("SELECT grp FROM user_groups WHERE user_id = ?", (user_id,)).fetchall()
    return sorted((r["grp"] for r in rows), key=GROUPS.index)


def can(user: dict | None, permission: str) -> bool:
    return bool(user) and bool(set(user.get("groups") or ()) & PERMISSIONS[permission])


def set_groups(user_id: int, groups) -> None:
    wanted = [g for g in GROUPS if g in set(groups)]
    with db.cursor() as conn:
        conn.execute("DELETE FROM user_groups WHERE user_id = ?", (user_id,))
        conn.executemany("INSERT INTO user_groups (user_id, grp) VALUES (?, ?)",
                         [(user_id, g) for g in wanted])


def default_groups() -> list[str]:
    """Groups for a user created without naming any (cli adduser).

    The very first admin has to come from somewhere: as long as nobody holds
    the admin group, a new user gets it. After that a new user starts in
    "general" only.
    """
    with db.cursor() as conn:
        has_admin = conn.execute("SELECT 1 FROM user_groups WHERE grp = 'admin' LIMIT 1").fetchone()
    return ["general"] if has_admin else ["admin", "general"]


def end_sessions_of(user_id: int) -> int:
    with db.cursor() as conn:
        return conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,)).rowcount


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def create_user(username: str, password: str) -> None:
    """Creates a user or resets their password.

    On a password change ALL sessions of that user are ended. Without this the
    one emergency measure there is had no effect: whoever notices a device is
    gone changes the password -- and whoever already had the cookie did not
    need the password any more. With "stay signed in" the thief would have
    kept access for 30 days (demonstrated on 2026-09-05: access still HTTP 200
    after the change).

    On adduser this has no consequence, there is no session yet. The price on
    passwd is a fresh sign-in on every device -- which is exactly what one
    wants at that moment.
    """
    with db.cursor() as conn:
        conn.execute(
            "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?) "
            "ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash",
            (username, hash_password(password), int(time.time())),
        )
        conn.execute(
            "DELETE FROM sessions WHERE user_id = "
            "(SELECT id FROM users WHERE username = ?)",
            (username,),
        )


def _recent_failures(ip: str) -> int:
    """Failed attempts from this address within the last LOCKOUT_MINUTES.

    Deliberately by address ONLY, not by username. If the lockout counted the
    name as well, anybody who knows a name could send five wrong passwords
    every few minutes from arbitrary addresses and thereby lock the legitimate
    user out for good. The user themselves would no longer get through, since
    the count is only cleared after a successful sign-in. With several users
    it gets worse rather than better: a single known name suffices to lock
    everyone out.

    Against working through passwords from many addresses, Argon2id and the
    quarter second per attempt still protect; the name goes into every log
    entry regardless, so that fail2ban can act on it.
    """
    since = int(time.time()) - config.LOCKOUT_MINUTES * 60
    with db.cursor() as conn:
        row = conn.execute(
            "SELECT COUNT(*) AS n FROM login_attempts WHERE ts > ? AND ip = ?",
            (since, ip),
        ).fetchone()
    return row["n"]


def is_locked(ip: str) -> bool:
    return _recent_failures(ip) >= config.MAX_ATTEMPTS


def _record_failure(username: str, ip: str) -> None:
    with db.cursor() as conn:
        conn.execute(
            "INSERT INTO login_attempts (username, ip, ts) VALUES (?, ?, ?)",
            (username, ip, int(time.time())),
        )
    # Deliberately still in German while the rest of the code is English: this
    # is the line fail2ban is documented to look for in the container log
    # (see DOKUMENTATION-TECHNIK.md). Rewording it here would silently change
    # what an operator outside this project greps for.
    log.warning("Fehlgeschlagene Anmeldung fuer '%s' von %s", username, ip)


def verify(username: str, password: str, ip: str) -> int | None:
    """Checks the credentials and returns the user id, or None."""
    with db.cursor() as conn:
        row = conn.execute(
            "SELECT id, password_hash FROM users WHERE username = ?", (username,)
        ).fetchone()

    if row is None:
        # Hash once even without a matching user, so that the response time
        # does not reveal which usernames exist.
        _hasher.hash(password)
        _record_failure(username, ip)
        return None

    try:
        _hasher.verify(row["password_hash"], password)
    except (VerifyMismatchError, InvalidHashError):
        _record_failure(username, ip)
        return None

    # If the Argon2 parameters have changed, quietly move to the new ones on
    # the next successful sign-in.
    if _hasher.check_needs_rehash(row["password_hash"]):
        with db.cursor() as conn:
            conn.execute(
                "UPDATE users SET password_hash = ? WHERE id = ?",
                (hash_password(password), row["id"]),
            )

    with db.cursor() as conn:
        conn.execute(
            "DELETE FROM login_attempts WHERE username = ? OR ip = ?", (username, ip)
        )
        conn.execute("UPDATE users SET last_login = ? WHERE id = ?",
                     (int(time.time()), row["id"]))
    return row["id"]


def start_session(user_id: int, remember: bool, ip: str, user_agent: str) -> tuple[str, int]:
    token = secrets.token_urlsafe(48)
    ttl = (
        config.SESSION_REMEMBER_DAYS * 86400 if remember else config.SESSION_HOURS * 3600
    )
    now = int(time.time())
    with db.cursor() as conn:
        conn.execute(
            "INSERT INTO sessions (token, user_id, created_at, expires_at, user_agent, ip) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (token, user_id, now, now + ttl, user_agent[:200], ip),
        )
    return token, ttl


def lookup_session(token: str | None):
    """Returns the username belonging to the session, or None."""
    if not token:
        return None
    with db.cursor() as conn:
        row = conn.execute(
            "SELECT s.token, s.expires_at, u.id AS user_id, u.username "
            "FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?",
            (token,),
        ).fetchone()
    if row is None:
        return None
    # Constant-time comparison, even though SQLite already searched for an
    # exact match -- it costs nothing and rules out timing differences.
    if not hmac.compare_digest(row["token"], token):
        return None
    if row["expires_at"] < time.time():
        end_session(token)
        return None
    return {"user_id": row["user_id"], "username": row["username"],
            "groups": groups_of(row["user_id"])}


def end_session(token: str | None) -> None:
    if token:
        with db.cursor() as conn:
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


def new_csrf_token() -> str:
    return secrets.token_urlsafe(32)
