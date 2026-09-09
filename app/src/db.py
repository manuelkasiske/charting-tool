"""SQLite access: users, sessions, failed attempts, watchlist, price cache.

One file, WAL mode, no ORM layer. The volumes are small (one user, a few
hundred cache entries), and the price cache is the only table that grows
appreciably.
"""

import json
import sqlite3
import time
from contextlib import contextmanager

from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    user_agent TEXT,
    ip         TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Every failed sign-in attempt, for the lockout and for fail2ban.
CREATE TABLE IF NOT EXISTS login_attempts (
    id       INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    ip       TEXT NOT NULL,
    ts       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_ts ON login_attempts(ts);

CREATE TABLE IF NOT EXISTS watchlist (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol  TEXT NOT NULL,
    label   TEXT,
    sort    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, symbol)
);

-- Personal settings, one record per user and key. The value is JSON; so far
-- there is only "panels" (order and visibility of the panels in the daily
-- chart), but the shape carries later settings as well.
CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key     TEXT    NOT NULL,
    value   TEXT    NOT NULL,
    PRIMARY KEY (user_id, key)
);

-- Only for the symbol search now. The price data lives in bars/coverage.
CREATE TABLE IF NOT EXISTS quote_cache (
    key        TEXT PRIMARY KEY,
    payload    TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
);

-- One record per symbol, resolution and bar. A trading day that has closed
-- does not change any more and is therefore never loaded again.
CREATE TABLE IF NOT EXISTS bars (
    symbol   TEXT    NOT NULL,
    interval TEXT    NOT NULL,
    ts       INTEGER NOT NULL,
    open     REAL,
    high     REAL,
    low      REAL,
    close    REAL,
    volume   REAL,
    PRIMARY KEY (symbol, interval, ts)
) WITHOUT ROWID;

-- What of a symbol is already in store.
--   asked_first  earliest time ever asked for. Keeps us from requesting
--                periods before the first trading day on every call.
--   first_ts     first bar actually present
--   last_ts      last bar present
--   market_open  was the exchange open at the last fetch? Determines how long
--                the last bar counts as current enough.
CREATE TABLE IF NOT EXISTS coverage (
    symbol      TEXT    NOT NULL,
    interval    TEXT    NOT NULL,
    asked_first INTEGER NOT NULL,
    first_ts    INTEGER,
    last_ts     INTEGER,
    fetched_at  INTEGER NOT NULL,
    market_open INTEGER NOT NULL DEFAULT 0,
    meta        TEXT,
    PRIMARY KEY (symbol, interval)
);
"""


def connect() -> sqlite3.Connection:
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(config.APP_DB, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def cursor():
    conn = connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init() -> None:
    with cursor() as conn:
        conn.executescript(SCHEMA)


# --- Price cache ----------------------------------------------------------

def cache_get(key: str, max_age: int):
    """Returns the cache entry if it is younger than max_age seconds."""
    with cursor() as conn:
        row = conn.execute(
            "SELECT payload, fetched_at FROM quote_cache WHERE key = ?", (key,)
        ).fetchone()
    if row is None or time.time() - row["fetched_at"] > max_age:
        return None
    return json.loads(row["payload"])


def cache_put(key: str, payload) -> None:
    with cursor() as conn:
        conn.execute(
            "INSERT INTO quote_cache (key, payload, fetched_at) VALUES (?, ?, ?) "
            "ON CONFLICT(key) DO UPDATE SET payload = excluded.payload, "
            "fetched_at = excluded.fetched_at",
            (key, json.dumps(payload, separators=(",", ":")), int(time.time())),
        )


def migrate() -> None:
    """One-off clean-ups after changes to the data format.

    Weekly bars sat on the Sunday instead of the Monday for a while (see
    store._normalize_ts). After the fix, old and new timestamps would sit next
    to each other and every week would appear twice. They are therefore
    discarded -- one fetch per symbol brings them back.
    """
    with cursor() as conn:
        misaligned = conn.execute(
            "SELECT COUNT(*) AS n FROM bars WHERE interval = '1wk' "
            # 4 * 86400 = the first Monday after 1970-01-01
            "AND (ts - 345600) % 604800 != 0"
        ).fetchone()["n"]
        if misaligned:
            conn.execute("DELETE FROM bars WHERE interval = '1wk'")
            conn.execute("DELETE FROM coverage WHERE interval = '1wk'")
    if misaligned:
        print(f"Weekly bars moved onto the Monday grid: {misaligned} discarded")


def cleanup() -> None:
    """Remove expired sessions, old failed attempts and search results.

    The price bars are deliberately not cleaned up -- they are the store that
    we specifically do not want to keep loading again.
    """
    now = int(time.time())
    with cursor() as conn:
        conn.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
        conn.execute("DELETE FROM login_attempts WHERE ts < ?", (now - 86400,))
        # Old entries from the time when whole Yahoo responses lived here.
        conn.execute("DELETE FROM quote_cache WHERE key NOT LIKE 'search|%'")
        conn.execute(
            "DELETE FROM quote_cache WHERE fetched_at < ?", (now - 7 * 86400,)
        )
