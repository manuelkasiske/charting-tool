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

-- What the user says they actually hold. Only the fact of holding matters
-- for the sell notices; price and stake are optional and only make the entry
-- readable later. Deliberately no history of past trades: this is a reminder,
-- not a portfolio ledger.
CREATE TABLE IF NOT EXISTS positions (
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol    TEXT    NOT NULL,
    bought_at INTEGER NOT NULL,
    price     REAL,
    stake     REAL,
    PRIMARY KEY (user_id, symbol)
);

-- The published trades of the trader followed in the Portfolio Tracker tab.
-- Unlike "positions" above this IS a ledger: every buy and sell with date,
-- so that open lots, average costs and realized results can be derived (see
-- portfolio.py). shares NULL on a sell means "the whole position"; price NULL
-- means it was not posted -- the close of that day stands in for it.
CREATE TABLE IF NOT EXISTS portfolio_trades (
    id         INTEGER PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol     TEXT    NOT NULL,
    side       TEXT    NOT NULL CHECK (side IN ('buy', 'sell')),
    trade_date TEXT    NOT NULL,
    shares     REAL,
    price      REAL,
    note       TEXT,
    created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_portfolio_trades_user ON portfolio_trades(user_id, symbol);

-- Group memberships, which decide what a user may see (see auth.PERMISSIONS).
-- A user without any group cannot sign in.
CREATE TABLE IF NOT EXISTS user_groups (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grp     TEXT    NOT NULL CHECK (grp IN ('admin', 'portfolio', 'general')),
    PRIMARY KEY (user_id, grp)
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

    # Groups arrived on 2026-10-16. Until then everybody signed in could see
    # everything; so that nobody is locked out by the update, every existing
    # user starts in "general", and the oldest account -- normally the one
    # that set the installation up -- in "admin" as well. Only when nobody
    # has a group yet: later changes in the user management must survive a
    # restart. On a fresh installation there are no users yet; there the
    # first "cli adduser" makes the admin (auth.default_groups).
    with cursor() as conn:
        columns = {r["name"] for r in conn.execute("PRAGMA table_info(users)")}
        if "last_login" not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN last_login INTEGER")
        if not conn.execute("SELECT 1 FROM user_groups LIMIT 1").fetchone():
            conn.execute("INSERT INTO user_groups (user_id, grp) SELECT id, 'general' FROM users")
            conn.execute("INSERT INTO user_groups (user_id, grp) "
                         "SELECT id, 'admin' FROM users ORDER BY id LIMIT 1")


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
        # Kept: the symbol search and the fundamentals (fundamentals.py).
        conn.execute("DELETE FROM quote_cache WHERE key NOT LIKE 'search|%' "
                     "AND key NOT LIKE 'fund|%'")
        conn.execute(
            "DELETE FROM quote_cache WHERE fetched_at < ?", (now - 7 * 86400,)
        )
