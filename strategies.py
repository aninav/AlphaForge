"""
strategies.py
-------------
Each strategy function accepts a prepared DataFrame (with indicators already
added) and returns it with a 'Signal' column: 1 = long, 0 = flat, -1 = short.

CONTRACT
--------
  • Signal is the DESIRED position on day T, derived from day-T data.
  • backtest.py shifts Signal by 1 to get Position (executed on T+1).
  • Do NOT shift inside this file.
  • Values must be in {0, 1} for long-only, or {-1, 0, 1} if shorts allowed.
"""

import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# Momentum Strategy
# ---------------------------------------------------------------------------

def momentum_signal(df: pd.DataFrame, fast: int = 20, slow: int = 50) -> pd.DataFrame:
    """
    Long (1) when fast SMA > slow SMA, flat (0) otherwise.
    Requires SMA_{fast} and SMA_{slow} columns (add via indicators.add_sma).
    """
    fast_col = f"SMA_{fast}"
    slow_col = f"SMA_{slow}"

    if fast_col not in df.columns or slow_col not in df.columns:
        raise ValueError(
            f"Missing columns: {fast_col} or {slow_col}. "
            "Run indicators.add_sma() before calling this strategy."
        )

    df["Signal"] = np.where(df[fast_col] > df[slow_col], 1, 0)
    # NaNs in SMA columns → signal should be 0 (no position), not NaN
    df["Signal"] = df["Signal"].where(df[fast_col].notna() & df[slow_col].notna(), 0)
    return df


# ---------------------------------------------------------------------------
# Mean Reversion Strategy — State Machine
# ---------------------------------------------------------------------------

def mean_reversion_signal(
    df: pd.DataFrame,
    window: int = 20,
    k: float = 2.0,
    allow_short: bool = False,
) -> pd.DataFrame:
    """
    State-machine mean reversion using Bollinger Bands.

    Rules (long-only, allow_short=False):
      • Enter LONG  when Close crosses BELOW the lower band  (oversold)
      • Exit  LONG  when Close crosses ABOVE the middle band (mean reversion complete)
      • Otherwise   hold current state

    Rules (with allow_short=True, adds short leg):
      • Enter SHORT when Close crosses ABOVE the upper band  (overbought)
      • Exit  SHORT when Close crosses BELOW the middle band

    This produces a persistent POSITION series (1 / 0 / -1), not impulse spikes.
    Requires BB_UPPER_{window}, BB_MID_{window}, BB_LOWER_{window} columns.
    """
    upper  = f"BB_UPPER_{window}"
    mid    = f"BB_MID_{window}"
    lower  = f"BB_LOWER_{window}"

    for col in [upper, mid, lower]:
        if col not in df.columns:
            raise ValueError(
                f"Missing column '{col}'. "
                "Run indicators.add_bollinger_bands() before calling this strategy."
            )

    close = df["Close"].values
    up    = df[upper].values
    mid_  = df[mid].values
    lo    = df[lower].values
    n     = len(df)

    signal = np.zeros(n, dtype=int)
    state  = 0  # current desired position: 0=flat, 1=long, -1=short

    for i in range(n):
        # Skip rows where indicator is NaN (warm-up period)
        if np.isnan(lo[i]) or np.isnan(up[i]) or np.isnan(mid_[i]):
            signal[i] = 0
            state = 0
            continue

        if state == 0:
            if close[i] < lo[i]:
                state = 1                              # oversold → go long
            elif allow_short and close[i] > up[i]:
                state = -1                             # overbought → go short

        elif state == 1:
            if close[i] > mid_[i]:                    # reverted → exit long
                state = 0

        elif state == -1:
            if close[i] < mid_[i]:                    # reverted → exit short
                state = 0

        signal[i] = state

    df["Signal"] = signal
    return df


# ---------------------------------------------------------------------------
# Regime-Aware Strategy Switcher
# ---------------------------------------------------------------------------

def regime_aware_signal(
    df: pd.DataFrame,
    fast: int = 20,
    slow: int = 50,
    bb_window: int = 20,
    bb_k: float = 2.0,
    allow_short: bool = False,
) -> pd.DataFrame:
    """
    Selects strategy by regime:
      Trending  → momentum_signal
      Choppy    → mean_reversion_signal
      HighVol   → flat (0)  — capital preservation

    Requires 'Regime' column from regime.classify_regime().
    """
    if "Regime" not in df.columns:
        raise ValueError("Missing 'Regime' column. Run regime.classify_regime() first.")

    df = df.copy()
    df_mom = momentum_signal(df.copy(), fast, slow)
    df_rev = mean_reversion_signal(df.copy(), bb_window, bb_k, allow_short=allow_short)

    df["Signal"] = 0
    trending_mask = df["Regime"] == "Trending"
    choppy_mask   = df["Regime"] == "Choppy"

    df.loc[trending_mask, "Signal"] = df_mom.loc[trending_mask, "Signal"]
    df.loc[choppy_mask,   "Signal"] = df_rev.loc[choppy_mask,   "Signal"]

    return df


# ---------------------------------------------------------------------------
# Rotation Strategy  (used by Portfolio tab)
# ---------------------------------------------------------------------------

def rotation_signal(
    prices: pd.DataFrame,
    lookback: int = 20,
    vol_filter: bool = True,
    safe_haven: str = "TLT",
) -> pd.Series:
    """
    Given a wide DataFrame of prices (columns = tickers), return a Series
    mapping date → selected ticker (highest momentum score).
    Momentum = % return over lookback days.
    Falls back to safe_haven when best momentum is negative and vol_filter=True.
    """
    momentum = prices.pct_change(lookback)
    selected = pd.Series(index=prices.index, dtype=object)

    for date in prices.index:
        row = momentum.loc[date].dropna()
        if row.empty:
            selected[date] = None
            continue
        best = row.idxmax()
        if vol_filter and row[best] < 0 and safe_haven in prices.columns:
            selected[date] = safe_haven
        else:
            selected[date] = best

    return selected


# ---------------------------------------------------------------------------
# Trend Following Strategy
# ---------------------------------------------------------------------------

def trend_following_signal(
    df: pd.DataFrame,
    fast: int = 20,
    slow: int = 100,
    allow_short: bool = False,
) -> pd.DataFrame:
    """
    Long when price is above slow SMA and fast SMA > slow SMA (confirmed uptrend).
    Short (if allowed) when price is below slow SMA and fast SMA < slow SMA.
    Flat otherwise.

    Requires SMA_{fast} and SMA_{slow} columns.
    """
    fast_col = f"SMA_{fast}"
    slow_col = f"SMA_{slow}"

    for col in [fast_col, slow_col]:
        if col not in df.columns:
            raise ValueError(
                f"Missing column '{col}'. Run indicators.add_sma() first."
            )

    close = df["Close"]
    fast_sma = df[fast_col]
    slow_sma = df[slow_col]

    long_cond  = (close > slow_sma) & (fast_sma > slow_sma)
    short_cond = (close < slow_sma) & (fast_sma < slow_sma)

    df["Signal"] = np.where(
        long_cond, 1,
        np.where(short_cond & allow_short, -1, 0)
    )
    df["Signal"] = df["Signal"].where(fast_sma.notna() & slow_sma.notna(), 0)
    return df


# ---------------------------------------------------------------------------
# Breakout Strategy
# ---------------------------------------------------------------------------

def breakout_signal(
    df: pd.DataFrame,
    window: int = 20,
    allow_short: bool = False,
) -> pd.DataFrame:
    """
    Donchian channel breakout.
      • Long  when Close breaks ABOVE the highest high of the last `window` bars.
      • Short when Close breaks BELOW the lowest  low  of the last `window` bars.
      • Flat  otherwise.

    Requires High and Low columns in df.
    """
    if "High" not in df.columns or "Low" not in df.columns:
        raise ValueError("Missing 'High' or 'Low' columns for breakout strategy.")

    upper_channel = df["High"].shift(1).rolling(window).max()
    lower_channel = df["Low"].shift(1).rolling(window).min()

    long_cond  = df["Close"] > upper_channel
    short_cond = df["Close"] < lower_channel

    df["Signal"] = np.where(
        long_cond, 1,
        np.where(short_cond & allow_short, -1, 0)
    )
    df["Signal"] = df["Signal"].where(upper_channel.notna(), 0)
    return df


# ---------------------------------------------------------------------------
# RSI Mean Reversion Strategy
# ---------------------------------------------------------------------------

def rsi_mean_reversion_signal(
    df: pd.DataFrame,
    oversold: float = 30.0,
    overbought: float = 70.0,
    allow_short: bool = False,
) -> pd.DataFrame:
    """
    State-machine RSI mean reversion.
      • Enter LONG  when RSI crosses below `oversold`  (e.g. 30)
      • Exit  LONG  when RSI crosses above 50
      • Enter SHORT when RSI crosses above `overbought` (e.g. 70), if allowed
      • Exit  SHORT when RSI crosses below 50

    Requires 'RSI' column (add via indicators.add_rsi).
    """
    if "RSI" not in df.columns:
        raise ValueError("Missing 'RSI' column. Run indicators.add_rsi() first.")

    rsi    = df["RSI"].values
    n      = len(df)
    signal = np.zeros(n, dtype=int)
    state  = 0

    for i in range(n):
        if np.isnan(rsi[i]):
            signal[i] = 0
            state = 0
            continue

        if state == 0:
            if rsi[i] < oversold:
                state = 1
            elif allow_short and rsi[i] > overbought:
                state = -1

        elif state == 1:
            if rsi[i] > 50:
                state = 0

        elif state == -1:
            if rsi[i] < 50:
                state = 0

        signal[i] = state

    df["Signal"] = signal
    return df


# ---------------------------------------------------------------------------
# Dual Momentum Strategy  (absolute + relative momentum)
# ---------------------------------------------------------------------------

def dual_momentum_signal(
    df: pd.DataFrame,
    lookback: int = 252,
    safe_haven_col: str = "SHY_Close",
    benchmark_col: str = "BND_Close",
) -> pd.DataFrame:
    """
    Gary Antonacci's Dual Momentum (single-asset version applied to df["Close"]):

    1. Absolute momentum: if asset 12-month return < risk-free proxy → go to safe haven (0)
    2. Relative momentum: if asset return > benchmark return → long (1), else flat (0)

    For a single-ticker backtest without SHY/BND data, falls back to:
      • Long  when 12-month return > 0 (absolute momentum positive)
      • Flat  otherwise

    Requires Close column. Optionally uses SHY_Close and BND_Close if present.
    """
    close = df["Close"]
    ret_12m = close.pct_change(lookback)

    if benchmark_col in df.columns and safe_haven_col in df.columns:
        bench_ret = df[benchmark_col].pct_change(lookback)
        signal = np.where(
            ret_12m.isna(), 0,
            np.where(ret_12m < 0, 0,           # absolute momentum filter
            np.where(ret_12m > bench_ret, 1,    # relative momentum: beat benchmark
            0))
        )
    else:
        # Fallback: absolute momentum only
        signal = np.where(ret_12m.isna(), 0, np.where(ret_12m > 0, 1, 0))

    df["Signal"] = signal.astype(int)
    return df


# ---------------------------------------------------------------------------
# Volatility Targeting Strategy
# ---------------------------------------------------------------------------

def volatility_targeting_signal(
    df: pd.DataFrame,
    target_vol: float = 0.10,
    vol_window: int = 20,
    fast: int = 20,
    slow: int = 100,
) -> pd.DataFrame:
    """
    Scales position size by targeting a fixed annualized volatility.
    Underlying direction signal: long when fast SMA > slow SMA, flat otherwise.
    Position size = target_vol / realized_vol, capped at 1 (no leverage).

    Returns fractional Signal values (0.0 to 1.0). backtest.py must support
    fractional positions, or you can round to {0, 1} — see below.

    Requires SMA_{fast}, SMA_{slow} columns.
    """
    fast_col = f"SMA_{fast}"
    slow_col = f"SMA_{slow}"

    for col in [fast_col, slow_col]:
        if col not in df.columns:
            raise ValueError(f"Missing column '{col}'. Run indicators.add_sma() first.")

    daily_returns = df["Close"].pct_change()
    realized_vol  = daily_returns.rolling(vol_window).std() * np.sqrt(252)

    direction = np.where(df[fast_col] > df[slow_col], 1, 0)
    scale     = (target_vol / realized_vol).clip(upper=1.0)

    raw_signal = direction * scale

    # Round to binary {0,1} if your backtest engine expects integers
    df["Signal"] = np.where(raw_signal > 0.5, 1, 0)
    df["Signal"] = df["Signal"].where(realized_vol.notna(), 0)
    return df


# ---------------------------------------------------------------------------
# Carry Strategy  (term structure proxy for ETFs)
# ---------------------------------------------------------------------------

def carry_signal(
    df: pd.DataFrame,
    short_window: int = 5,
    long_window: int = 60,
    allow_short: bool = False,
) -> pd.DataFrame:
    """
    Carry proxy for ETFs using implied roll yield:
      roll_yield = short-term momentum - long-term momentum

    Positive roll yield → long (asset in backwardation / upward carry)
    Negative roll yield → short or flat

    This is a simplified carry signal suitable for equity/bond ETFs.
    Requires Close column.
    """
    close = df["Close"]
    short_ret = close.pct_change(short_window)
    long_ret  = close.pct_change(long_window)
    roll_yield = short_ret - long_ret

    df["Signal"] = np.where(
        roll_yield.isna(), 0,
        np.where(roll_yield > 0, 1,
        np.where(roll_yield < 0 & allow_short, -1, 0))
    )
    return df


# ---------------------------------------------------------------------------
# Pairs / Spread Strategy
# ---------------------------------------------------------------------------

def pairs_signal(
    df: pd.DataFrame,
    spread_col: str = "Spread",
    window: int = 20,
    entry_z: float = 2.0,
    exit_z: float = 0.0,
    allow_short: bool = True,
) -> pd.DataFrame:
    """
    Statistical arbitrage on a pre-computed spread (e.g. log(A) - hedge_ratio*log(B)).

    State machine on z-score of spread:
      • z < -entry_z  → Long  spread (long A, short B)
      • z >  entry_z  → Short spread (short A, long B), if allow_short
      • |z| < exit_z  → Exit to flat

    Requires a 'Spread' column (or pass spread_col name).
    Compute spread upstream: df["Spread"] = np.log(df["A"]) - hr * np.log(df["B"])
    """
    if spread_col not in df.columns:
        raise ValueError(
            f"Missing '{spread_col}' column. "
            "Compute spread = log(A) - hedge_ratio * log(B) before calling this."
        )

    spread = df[spread_col]
    roll_mean = spread.rolling(window).mean()
    roll_std  = spread.rolling(window).std()
    z_score   = (spread - roll_mean) / roll_std

    z = z_score.values
    n = len(df)
    signal = np.zeros(n, dtype=int)
    state  = 0

    for i in range(n):
        if np.isnan(z[i]):
            signal[i] = 0
            state = 0
            continue

        if state == 0:
            if z[i] < -entry_z:
                state = 1
            elif allow_short and z[i] > entry_z:
                state = -1

        elif state == 1:
            if z[i] >= exit_z:
                state = 0

        elif state == -1:
            if z[i] <= -exit_z:
                state = 0

        signal[i] = state

    df["Signal"] = signal
    return df
