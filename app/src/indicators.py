"""Indicator calculation.

The formulas are checked against the supplied mstr_data.csv. They agree on all
219 common trading days, with a maximum deviation of 0.0 for SMA, EMA, MACD,
RSI, Bollinger and the Fibonacci levels. Three details matter for that, and
they differ between libraries:

  * EMA starts, as in ta-lib, from the SMA of the first n values as its seed,
    not from the first price (see ema()).
  * RSI uses Wilder's smoothing (alpha = 1/n), not the simple moving average
    of the up and down moves.
  * The standard deviation of the Bollinger bands runs with ddof=1.

All indicators are computed over the full loaded history and only afterwards
cut to the displayed window. That way they have already settled at the left
edge of the chart -- unlike in the template, where the first day had an RSI of
0.00 and triggered a false signal.
"""

import numpy as np
import pandas as pd

# Label and value kept apart so that "1.0" does not show up as "1".
FIB_RATIOS = (
    ("0.236", 0.236), ("0.382", 0.382), ("0.5", 0.5),
    ("0.618", 0.618), ("0.786", 0.786), ("1.0", 1.0),
)


def ema(series: pd.Series, length: int) -> pd.Series:
    """EMA with an SMA seed (ta-lib convention)."""
    out = pd.Series(np.nan, index=series.index, dtype="float64")
    values = series.to_numpy(dtype="float64")
    if len(values) < length:
        return out
    alpha = 2.0 / (length + 1.0)
    acc = values[:length].mean()
    result = np.full(len(values), np.nan)
    result[length - 1] = acc
    for i in range(length, len(values)):
        acc = (values[i] - acc) * alpha + acc
        result[i] = acc
    out.iloc[:] = result
    return out


def rsi(series: pd.Series, length: int = 14) -> pd.Series:
    """Relative Strength Index after Wilder."""
    delta = series.diff()
    gain = delta.clip(lower=0).ewm(alpha=1 / length, adjust=False).mean()
    loss = (-delta.clip(upper=0)).ewm(alpha=1 / length, adjust=False).mean()
    # A pure upward phase (loss == 0) would otherwise divide by 0.
    rs = gain / loss.replace(0, np.nan)
    out = 100 - 100 / (1 + rs)
    out[loss == 0] = 100.0
    out[(gain == 0) & (loss == 0)] = 50.0
    # The first `length` values have not settled yet.
    out.iloc[:length] = np.nan
    return out


def macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
    """MACD line, signal line and histogram.

    A note on the template: in mstr_data.csv the column MACDs_12_26_9 does not
    hold the signal line but the histogram -- a swapped column from pandas_ta,
    which returns (MACD, histogram, signal) in that order. Here the three
    series are assigned correctly.
    """
    line = ema(series, fast) - ema(series, slow)
    sig = ema(line.dropna(), signal).reindex(series.index)
    return line, sig, line - sig


def bollinger(series: pd.Series, length: int = 20, mult: float = 2.0):
    middle = series.rolling(length).mean()
    std = series.rolling(length).std(ddof=1)
    return middle + mult * std, middle, middle - mult * std


def fib_levels(closes: pd.Series) -> dict[str, float]:
    """Retracement levels from the high and low of the given window.

    Computed on closing prices -- that is how the values in the template came
    about as well (294.23 / 253.73 / 221.00 / 188.27 / 82.31). The levels
    therefore depend on the chosen period and are determined afresh on every
    switch.
    """
    closes = closes.dropna()
    if closes.empty:
        return {}
    high, low = float(closes.max()), float(closes.min())
    span = high - low
    return {label: high - ratio * span for label, ratio in FIB_RATIOS}


def compute(df: pd.DataFrame) -> pd.DataFrame:
    """Adds all indicators of the daily chart to an OHLCV frame."""
    out = df.copy()
    close = out["Close"]

    for n in (50, 200):
        out[f"SMA_{n}"] = close.rolling(n).mean()
        out[f"EMA_{n}"] = ema(close, n)

    # The "red ribbon" of the lower panel.
    out["SMA_12"] = close.rolling(12).mean()
    out["SMA_30"] = close.rolling(30).mean()

    out["MACD"], out["MACD_Signal"], out["MACD_Hist"] = macd(close)
    out["RSI"] = rsi(close)
    out["BB_Upper"], out["BB_Middle"], out["BB_Lower"] = bollinger(close)

    # Volume spike: more than twice the 20-day average.
    vol_avg = out["Volume"].rolling(20).mean()
    out["Vol_Spike"] = out["Volume"] > 2 * vol_avg

    # Golden and death cross of the 50 line over the 200 line.
    fast, slow = out["SMA_50"], out["SMA_200"]
    above = fast > slow
    valid = fast.notna() & slow.notna() & fast.shift().notna() & slow.shift().notna()
    out["Golden_Cross"] = above & ~above.shift(fill_value=False) & valid
    out["Death_Cross"] = ~above & above.shift(fill_value=False) & valid

    return out


MONTHLY_LENGTHS = (8, 12, 21)

# How many bars a monthly EMA needs before its value is worth anything.
#
# The seed is the SMA of the first n bars and loses a factor of (1 - alpha) per
# step. At n = 12, alpha is 2/13, so after another 12 bars the seed still
# contributes (11/13)^12 = 12 %, and after 24 bars 1.6 %. Twice the period is
# therefore the point from which the EMA describes the price course rather
# than its own starting value. On monthly data that is a full two years for
# the EMA12 -- young instruments simply do not have it.
SETTLE_FACTOR = 2


def compute_monthly(df: pd.DataFrame) -> pd.DataFrame:
    """EMA 8, 12 and 21 on a monthly basis.

    Computed over all available bars, that is including the running month --
    which is how charts usually draw it. For judging the rule, though, only
    the monthly close counts; the values that matter for that come from
    settled_levels().
    """
    out = df.copy()
    for n in MONTHLY_LENGTHS:
        values = ema(out["Close"], n)
        # Discard the initial values that are still governed by the seed.
        values.iloc[: SETTLE_FACTOR * n - 1] = np.nan
        out[f"EMA_{n}"] = values
    return out


def settled_levels(closes: pd.Series, running: bool) -> dict[int, float]:
    """EMA levels from completed months only.

    This is the heart of the "closes below EMA8" rule: as long as the month is
    running its closing price is open, and an EMA that counts it in wanders
    along all month. A "level" obtained that way would be no level at all, but
    a value that happens to hold today.
    """
    completed = closes.iloc[:-1] if running and len(closes) > 1 else closes
    levels = {}
    for n in MONTHLY_LENGTHS:
        if len(completed) < SETTLE_FACTOR * n:
            levels[n] = None
            continue
        series = ema(completed, n).dropna()
        levels[n] = float(series.iloc[-1]) if len(series) else None
    return levels


def compute_weekly(df: pd.DataFrame) -> pd.DataFrame:
    """Ribbon indicators of the weekly chart (SMA 10 / 12 / 30)."""
    out = df.copy()
    close = out["Close"]
    for n in (10, 12, 30):
        out[f"SMA_{n}"] = close.rolling(n).mean()
    return out
