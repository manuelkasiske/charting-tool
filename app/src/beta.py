"""Beta of an instrument against the S&P 500.

Calculated here rather than fetched: Yahoo's chart endpoint carries no beta,
and the endpoints that do (quoteSummary, v7 quote) want a cookie and crumb
since 2023 -- one more thing that breaks without warning. The figure follows
Yahoo's own definition, so the two can be compared: five years of monthly
returns against ^GSPC, completed months only.

For a younger listing (fewer than 24 completed months) the weekly returns of
up to two years stand in, if there are at least 52 of them. That is kept on
purpose even where one week dominates: a young listing that multiplied in a
single week gets a beta in the twenties from it, while its few months would
give a figure near 1.5 and Yahoo's provider yet another. The figure is left
as it falls out rather than smoothed. Below 36 months app.js flags it as
uncertain.
"""

import datetime
import logging

import pandas as pd

from . import store, yahoo

log = logging.getLogger("chart.beta")

BENCHMARK = "^GSPC"
MONTHS = 60
MIN_MONTHS = 24
WEEKS = 104
MIN_WEEKS = 52

# symbol -> (day computed, result). A beta from completed periods does not
# change during the day; the process restarts often enough to stay small.
_cache: dict[str, tuple[str, dict | None]] = {}


def _returns(symbol: str, interval: str, since: pd.Timestamp, before: pd.Timestamp) -> pd.Series:
    frame = store.load(symbol, interval, int(since.timestamp())).frame
    closes = frame["Close"].dropna()
    # Only completed periods: the running month or week would mix a partial
    # return into a series of whole ones.
    closes = closes[closes.index < before]
    return closes.pct_change().dropna()


def _beta(symbol: str, interval: str, count: int, minimum: int,
          since: pd.Timestamp, before: pd.Timestamp) -> dict | None:
    own = _returns(symbol, interval, since, before)
    bench = _returns(BENCHMARK, interval, since, before)
    joined = pd.concat([own, bench], axis=1, join="inner").tail(count)
    if len(joined) < minimum:
        return None
    variance = joined.iloc[:, 1].var()
    if not variance:
        return None
    value = joined.iloc[:, 0].cov(joined.iloc[:, 1]) / variance
    return {"value": round(float(value), 2), "basis": interval, "periods": len(joined)}


def get(symbol: str) -> dict | None:
    """{"value": 1.85, "basis": "1mo" | "1wk", "periods": 60} or None."""
    symbol = symbol.upper()
    today = datetime.date.today().isoformat()
    cached = _cache.get(symbol)
    if cached and cached[0] == today:
        return cached[1]

    now = pd.Timestamp.now(tz="UTC")
    month_start = now.normalize().replace(day=1)
    week_start = now.normalize() - pd.Timedelta(days=now.weekday())
    try:
        result = _beta(symbol, "1mo", MONTHS, MIN_MONTHS,
                       month_start - pd.DateOffset(months=MONTHS + 1), month_start)
        if result is None:
            result = _beta(symbol, "1wk", WEEKS, MIN_WEEKS,
                           week_start - pd.Timedelta(weeks=WEEKS + 1), week_start)
    except yahoo.YahooError as exc:
        log.warning("No beta for %s: %s", symbol, exc)
        return None
    _cache[symbol] = (today, result)
    return result
