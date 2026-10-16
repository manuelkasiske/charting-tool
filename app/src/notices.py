"""Where each favorite stands today against the RSI thresholds 30/70.

The source of the notices card. What was left of the backtest once its tab
was removed (2026-10-12): the backtest offered thresholds derived from the
instrument itself, the notices now use the fixed textbook pair.
"""

from . import indicators, series, store

LOW = 30.0
HIGH = 70.0

# The RSI has to have settled; below this many bars it says more about the
# start of the series than about the instrument.
MIN_BARS = 60


def current_signal(symbol: str, holding: bool = False) -> dict | None:
    """Today's RSI of the instrument and what it suggests.

    The RSI is computed over the whole loaded history before the window is
    cut -- otherwise the first weeks would carry a half-warmed indicator.
    """
    window_start, window_end, start_ts = series._window_bounds("2y", None, None)
    result = store.load(symbol, "1d", start_ts)
    frame = result.frame
    if frame.empty:
        return None
    rsi_full = indicators.rsi(frame["Close"]).dropna()
    cut = series._cut(frame, window_start, window_end)
    rsi = rsi_full.reindex(cut.index).dropna()
    if len(rsi) < MIN_BARS:
        return None
    close = cut["Close"].reindex(rsi.index)

    value = float(rsi.iloc[-1])
    state = "neutral"
    if value <= LOW:
        state = "sell_wait_buy" if holding else "buy"
    elif value >= HIGH:
        state = "sell" if holding else "overbought"

    return {
        "symbol": symbol.upper(),
        "rsi": round(value, 2),
        "date": close.index[-1].strftime("%Y-%m-%d"),
        "price": round(float(close.iloc[-1]), 4),
        "currency": (result.meta or {}).get("currency", ""),
        "low": LOW,
        "high": HIGH,
        "state": state,
        "holding": holding,
    }
