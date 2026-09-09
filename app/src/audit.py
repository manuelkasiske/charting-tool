"""Access log: who signed in when, and which charts they requested.

A file of its own next to the database in DATA_DIR, that is on the bind mount
from docker-compose.yml. The container log is no good for this: it rotates at
10 MB and is gone for good after a "docker compose down" -- yet "who was in
here, and when" is exactly the question one still wants to answer half a year
later.

One line per event, fixed columns, so that "tail -f" and "grep CHART" stay
readable without further tooling:

    2026-09-06 15:18:03 +0200  LOGIN        robert  83.1.2.3  12 hours
    2026-09-06 15:19:11 +0200  CHART        robert  83.1.2.3  AAPL  1y  248 days, 1 request
    2026-09-06 15:31:02 +0200  FAILED       admin   45.9.8.7  wrong password

The log is English regardless of the language chosen for the interface: it is
read by an operator, not by a visitor.

The operational messages in the container log stay untouched; in particular
the line fail2ban reacts to (see auth._record_failure). This log sits beside
it, it replaces nothing.
"""

import datetime
import logging
import logging.handlers

from . import config

log = logging.getLogger("chart.access")

# Timestamps in local time rather than UTC: the log is read by a person, and
# they compare it against their own clock. The container runs on UTC, so the
# zone is stated explicitly here -- and the offset (+0200) goes into the line
# as well, so that the switch to winter time leaves no doubt.
try:
    from zoneinfo import ZoneInfo

    _ZONE = ZoneInfo(config.LOG_TIMEZONE)
except Exception:  # no tzdata in the image, unknown zone
    _ZONE = None


def init() -> None:
    """Attaches the file handler. Call once at startup (main.py).

    If creating the file fails, the application runs anyway: a log that cannot
    be written is a nuisance, but no reason to switch the charts off. The
    error then shows up in the container log.
    """
    if log.handlers:
        return
    log.setLevel(logging.INFO)
    # Do not pass on to the root log -- otherwise every line would appear
    # twice, once here and once among the operational messages.
    log.propagate = False
    try:
        config.DATA_DIR.mkdir(parents=True, exist_ok=True)
        handler = logging.handlers.RotatingFileHandler(
            config.LOG_FILE,
            maxBytes=config.LOG_MAX_MB * 1024 * 1024,
            backupCount=config.LOG_BACKUPS,
            encoding="utf-8",
        )
        # The timestamp is already part of the message, so only the text here.
        handler.setFormatter(logging.Formatter("%(message)s"))
        log.addHandler(handler)
    except OSError as exc:
        logging.getLogger("chart").error(
            "Access log %s is not writable: %s", config.LOG_FILE, exc
        )
        log.addHandler(logging.NullHandler())


def _timestamp() -> str:
    now = (
        datetime.datetime.now(_ZONE) if _ZONE else datetime.datetime.now().astimezone()
    )
    return now.strftime("%Y-%m-%d %H:%M:%S %z")


def _sanitize(value, length: int = 60) -> str:
    """Strip control characters and shorten.

    The username comes from the sign-in form and is therefore freely chosen.
    Without this line somebody could put a line break into the name and write
    lines of their own into the log -- a successful sign-in that never
    happened, for instance.
    """
    text = "".join(c for c in str(value) if c.isprintable()).strip()
    return text[:length] or "-"


def event(kind: str, user: str, ip: str, detail: str = "") -> None:
    """Write one line. Must not tip over the request under any circumstances."""
    try:
        line = "%s  %-12s %-12s %-15s %s" % (
            _timestamp(),
            kind,
            _sanitize(user, 40),
            _sanitize(ip, 45),
            _sanitize(detail, 120) if detail else "",
        )
        log.info(line.rstrip())
    except Exception:  # full disk, revoked permissions, ...
        logging.getLogger("chart").exception("Access log not written")
