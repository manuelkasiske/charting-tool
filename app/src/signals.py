"""Signal detection -- the list that the template produced as mstr_data.txt.

Two deliberate departures from the template:

  1. Signals only arise where the underlying indicator has settled. That is
     why the template read "RSI Oversold (0.00) on 2025-09-04" -- on the first
     day there were no 14 predecessors yet, the RSI was 0 and triggered a
     false signal.
  2. The MACD crossover compares the MACD line against the signal line. The
     template compared against the histogram (a swapped column, see
     indicators.macd), which produced different dates.

The wording of each entry comes from i18n.py, so that the list follows the
language chosen for the interface. The `kind` stays fixed either way -- the
frontend colours and filters by it.
"""

import pandas as pd

from . import i18n

RSI_OVERSOLD = 30.0
RSI_OVERBOUGHT = 70.0

# A Fibonacci buy signal counts when the closing price comes within one
# percent of a level.
FIB_TOLERANCE = 0.01


def detect(df: pd.DataFrame, fib: dict[str, float], language: str) -> list[dict]:
    """Returns all signals of the window, ascending by date."""
    out: list[dict] = []

    def add(ts, kind, number=None, **params):
        """One entry. `number` goes into the payload, `params` into the text."""
        out.append(
            {
                "date": ts.strftime("%Y-%m-%d"),
                "kind": kind,
                "text": i18n.translate(language, "signal." + kind, **params),
                "value": None if number is None else round(float(number), 2),
            }
        )

    close = df["Close"]

    for ts, v in df["RSI"].dropna().items():
        if v <= RSI_OVERSOLD:
            add(ts, "rsi_oversold", v, value=f"{v:.2f}")
        elif v >= RSI_OVERBOUGHT:
            add(ts, "rsi_overbought", v, value=f"{v:.2f}")

    band = df[["BB_Upper", "BB_Lower"]].dropna()
    for ts in band.index:
        if close[ts] <= band.loc[ts, "BB_Lower"]:
            add(ts, "bb_lower", close[ts])
        elif close[ts] >= band.loc[ts, "BB_Upper"]:
            add(ts, "bb_upper", close[ts])

    both = df[["MACD", "MACD_Signal"]].dropna()
    if len(both) > 1:
        line, sig = both["MACD"], both["MACD_Signal"]
        up = (line > sig) & (line.shift() <= sig.shift())
        down = (line < sig) & (line.shift() >= sig.shift())
        for ts in both.index[up.fillna(False)]:
            add(ts, "macd_bull", line[ts])
        for ts in both.index[down.fillna(False)]:
            add(ts, "macd_bear", line[ts])

    for ts in df.index[df["Golden_Cross"]]:
        add(ts, "golden_cross", close[ts])
    for ts in df.index[df["Death_Cross"]]:
        add(ts, "death_cross", close[ts])

    for label, level in fib.items():
        if level <= 0:
            continue
        near = (close - level).abs() / level <= FIB_TOLERANCE
        for ts in df.index[near.fillna(False)]:
            add(ts, "fib", level, level=label)

    out.sort(key=lambda s: (s["date"], s["kind"]))
    return out
