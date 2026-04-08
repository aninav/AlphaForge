"""
api.py
------
FastAPI backend for AlphaForge.
Wraps all existing strategy modules and exposes them as JSON endpoints.

Run with:
    python -m uvicorn api:app --reload --port 8000
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import traceback
from typing import Optional

# ── existing modules ──────────────────────────────────────────────────────────
from data import fetch_data, fetch_basket, align_basket
from indicators import add_all, add_sma, add_bollinger_bands
from strategies import momentum_signal, mean_reversion_signal, regime_aware_signal, rotation_signal
from regime import classify_regime, regime_summary
from events import flag_events, compute_event_impact, event_return_distribution, PLACEHOLDER_EVENTS
from backtest import run_backtest, build_trade_log
from metrics import compute_all
from walkforward import walk_forward

app = FastAPI(title="AlphaForge API", version="2.0.0")

# ── CORS — allow Next.js dev server ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://alphaforgeterminal.vercel.app",   
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ── helpers ───────────────────────────────────────────────────────────────────

def df_to_records(df: pd.DataFrame) -> list[dict]:
    """Convert DataFrame to JSON-serialisable list of records, scrubbing nan/inf."""
    df = df.copy()
    if isinstance(df.index, pd.DatetimeIndex):
        df.index = df.index.strftime("%Y-%m-%d")
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.where(pd.notnull(df), None)
    records = df.reset_index().to_dict(orient="records")
    cleaned = []
    for row in records:
        clean_row = {}
        for k, v in row.items():
            if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
                clean_row[k] = None
            else:
                clean_row[k] = v
        cleaned.append(clean_row)
    return cleaned

def safe_float(val):
    """Return float or None — never NaN/Inf which breaks JSON."""
    try:
        v = float(val)
        if np.isnan(v) or np.isinf(v):
            return None
        return round(v, 4)
    except (TypeError, ValueError):
        return None


def build_enriched_df(
    ticker: str,
    start: str,
    end: str,
    strategy: str,
    fast: int,
    slow: int,
    bb_k: float,
    allow_short: bool,
    event_type: str,
) -> pd.DataFrame:
    """Fetch data and apply all indicators + signal. Shared by multiple endpoints."""
    df = fetch_data(ticker, start, end)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No data for {ticker} between {start} and {end}")

    df = add_all(df)
    df = add_sma(df, fast)
    df = add_sma(df, slow)
    df = add_bollinger_bands(df, 20, bb_k)
    df = classify_regime(df)
    df = flag_events(df, event_type=event_type)

    if strategy == "momentum":
        df = momentum_signal(df, fast, slow)
    elif strategy == "mean_reversion":
        df = mean_reversion_signal(df, 20, bb_k, allow_short=allow_short)
    else:
        df = regime_aware_signal(df, fast, slow, 20, bb_k, allow_short=allow_short)

    return df


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}


# ═══════════════════════════════════════════════════════════════════════════════
# BACKTEST  — main endpoint powering the Home Terminal
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/backtest")
def backtest(
    ticker:      str   = Query("QQQ"),
    start:       str   = Query("1999-03-10"),
    end:         str   = Query("2025-01-01"),
    strategy:    str   = Query("momentum"),
    fast:        int   = Query(20),
    slow:        int   = Query(50),
    bb_k:        float = Query(2.0),
    allow_short: bool  = Query(False),
    commission:  float = Query(5.0),
    slippage:    float = Query(2.0),
    event_type:  str   = Query("FOMC"),
):
    try:
        df = build_enriched_df(ticker, start, end, strategy, fast, slow, bb_k, allow_short, event_type)

        df = run_backtest(
            df,
            commission_bps=commission,
            slippage_bps=slippage,
            allow_short=allow_short,
        )

        trade_log  = build_trade_log(df)
        metrics    = compute_all(df, trade_log)
        reg_info   = regime_summary(df)

        # Equity curve + drawdown (sampled for performance)
        chart_cols = ["Close", "Equity", "Drawdown", "Signal", "Position", "Regime"]
        chart_df   = df[[c for c in chart_cols if c in df.columns]].copy()

        # Sample to ~500 points if large
        if len(chart_df) > 500:
            step = len(chart_df) // 500
            chart_df = chart_df.iloc[::step]

        # Clean metrics
        clean_metrics = {k: safe_float(v) if not isinstance(v, int) else v
                         for k, v in metrics.items()}

        return {
            "ticker":     ticker,
            "strategy":   strategy,
            "metrics":    clean_metrics,
            "regime":     reg_info,
            "chart":      df_to_records(chart_df),
            "trades":     df_to_records(trade_log) if not trade_log.empty else [],
            "signal_now": int(df["Signal"].iloc[-1]),
            "date_range": {
                "start": str(df.index[0].date()),
                "end":   str(df.index[-1].date()),
                "bars":  len(df),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# HEATMAP  — Strategy Lab
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/heatmap")
def heatmap(
    ticker:     str   = Query("QQQ"),
    start:      str   = Query("1999-03-10"),
    end:        str   = Query("2025-01-01"),
    commission: float = Query(5.0),
    slippage:   float = Query(2.0),
):
    try:
        from metrics import sharpe_ratio
        raw = fetch_data(ticker, start, end)
        if raw.empty:
            raise HTTPException(status_code=404, detail="No data")

        fast_range = range(5, 35, 5)
        slow_range = range(20, 120, 10)
        results = []

        for f in fast_range:
            for s in slow_range:
                if f >= s:
                    results.append({"fast": f, "slow": s, "sharpe": None})
                    continue
                try:
                    tmp = raw.copy()
                    tmp = add_sma(tmp, f)
                    tmp = add_sma(tmp, s)
                    tmp = momentum_signal(tmp, f, s)
                    tmp = run_backtest(tmp, commission_bps=commission,
                                       slippage_bps=slippage, validate=False)
                    sr  = safe_float(sharpe_ratio(tmp["Net_Return"]))
                    results.append({"fast": f, "slow": s, "sharpe": sr})
                except Exception:
                    results.append({"fast": f, "slow": s, "sharpe": None})

        return {"heatmap": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# WALK-FORWARD  — Strategy Lab
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/walkforward")
def walkforward(
    ticker:      str   = Query("QQQ"),
    start:       str   = Query("1999-03-10"),
    end:         str   = Query("2025-01-01"),
    train_days:  int   = Query(252),
    test_days:   int   = Query(63),
    commission:  float = Query(5.0),
    slippage:    float = Query(2.0),
    flatten:     bool  = Query(True),
):
    try:
        raw = fetch_data(ticker, start, end)
        if raw.empty:
            raise HTTPException(status_code=404, detail="No data")

        oos_df, fold_log = walk_forward(
            raw,
            train_days=train_days,
            test_days=test_days,
            commission_bps=commission,
            slippage_bps=slippage,
            flatten_at_boundary=flatten,
        )

        if oos_df.empty:
            return {"folds": [], "chart": [], "metrics": {}}

        # Add drawdown
        rolling_peak        = oos_df["Equity"].cummax()
        oos_df["Drawdown"]  = (oos_df["Equity"] - rolling_peak) / rolling_peak

        metrics = compute_all(oos_df)
        clean_metrics = {k: safe_float(v) if not isinstance(v, int) else v
                         for k, v in metrics.items()}

        # Sample chart
        chart_df = oos_df[["Equity", "Drawdown"]].copy()
        if len(chart_df) > 500:
            step     = len(chart_df) // 500
            chart_df = chart_df.iloc[::step]

        # Clean fold log
        clean_folds = []
        for fold in fold_log:
            clean_folds.append({
                k: (str(v) if hasattr(v, "date") else safe_float(v) if isinstance(v, float) else v)
                for k, v in fold.items()
            })

        return {
            "folds":   clean_folds,
            "chart":   df_to_records(chart_df),
            "metrics": clean_metrics,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# EVENTS  — Event Impact tab
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/events")
def events(
    ticker:      str  = Query("QQQ"),
    start:       str  = Query("1999-03-10"),
    end:         str  = Query("2025-01-01"),
    event_type:  str  = Query("FOMC"),
    fwd_windows: str  = Query("1,3,5"),   # comma-separated
):
    try:
        windows = [int(w) for w in fwd_windows.split(",")]
        df = fetch_data(ticker, start, end)
        if df.empty:
            raise HTTPException(status_code=404, detail="No data")

        df = flag_events(df, event_type=event_type)
        impact = compute_event_impact(df, forward_windows=windows)
        ev_ret, non_ev_ret = event_return_distribution(df, window=windows[0])

        # Price chart with event markers
        price_df = df[["Close", "IsEvent"]].copy()
        if len(price_df) > 600:
            step     = len(price_df) // 600
            price_df = price_df.iloc[::step]

        return {
            "event_type":        event_type,
            "available_events":  list(PLACEHOLDER_EVENTS.keys()),
            "impact_table":      impact.reset_index().to_dict(orient="records"),
            "ev_returns":        [safe_float(x) for x in ev_ret.tolist()],
            "non_ev_returns":    [safe_float(x) for x in non_ev_ret.tolist()],
            "price_chart":       df_to_records(price_df),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# PORTFOLIO ROTATION  — Portfolio tab
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/rotation")
def rotation(
    tickers:    str   = Query("QQQ,SPY,IWM,TLT"),
    start:      str   = Query("1999-03-10"),
    end:        str   = Query("2025-01-01"),
    lookback:   int   = Query(20),
    vol_filter: bool  = Query(True),
    safe_haven: str   = Query("TLT"),
):
    try:
        ticker_list = [t.strip() for t in tickers.split(",")]
        basket  = fetch_basket(ticker_list, start, end)
        prices  = align_basket(basket)

        selected         = rotation_signal(prices, lookback=lookback,
                                           vol_filter=vol_filter, safe_haven=safe_haven)
        selected_shifted = selected.shift(1)

        ret_matrix  = prices.pct_change()
        rot_returns = pd.Series(index=prices.index, dtype=float)
        for date in prices.index:
            pick = selected_shifted.get(date)
            if pick and pick in ret_matrix.columns:
                rot_returns[date] = ret_matrix.loc[date, pick]

        rot_equity  = (1 + rot_returns.fillna(0)).cumprod() * 100_000

        # Build chart data
        chart_rows = []
        sample_idx = prices.index[::max(1, len(prices)//500)]
        for date in sample_idx:
            row = {"date": str(date.date()), "rotation": safe_float(rot_equity.get(date))}
            for t in ticker_list:
                bh_val = prices[t].get(date)
                bh_start = prices[t].dropna().iloc[0]
                row[t] = safe_float((bh_val / bh_start) * 100_000) if bh_val and bh_start else None
            chart_rows.append(row)

        alloc_counts = selected.dropna().value_counts().to_dict()
        last_pick    = selected.dropna().iloc[-1] if not selected.dropna().empty else None

        return {
            "tickers":       ticker_list,
            "current":       last_pick,
            "allocation":    alloc_counts,
            "chart":         chart_rows,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# SIGNAL  — Live Signal mode (no full backtest)
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/signal")
def signal(
    ticker:      str   = Query("QQQ"),
    start:       str   = Query("1999-03-10"),
    end:         str   = Query("2025-01-01"),
    strategy:    str   = Query("momentum"),
    fast:        int   = Query(20),
    slow:        int   = Query(50),
    bb_k:        float = Query(2.0),
    allow_short: bool  = Query(False),
    event_type:  str   = Query("FOMC"),
):
    try:
        df      = build_enriched_df(ticker, start, end, strategy, fast, slow, bb_k, allow_short, event_type)
        reg     = regime_summary(df)
        last    = df.iloc[-1]

        indicators = {
            "close":     safe_float(last["Close"]),
            "sma_fast":  safe_float(last.get(f"SMA_{fast}")),
            "sma_slow":  safe_float(last.get(f"SMA_{slow}")),
            "bb_lower":  safe_float(last.get("BB_LOWER_20")),
            "bb_mid":    safe_float(last.get("BB_MID_20")),
            "bb_upper":  safe_float(last.get("BB_UPPER_20")),
            "vol_ann":   safe_float(last.get("VOL_20")),
            "rsi":       safe_float(last.get("RSI_14")),
        }

        return {
            "signal":     int(df["Signal"].iloc[-1]),
            "regime":     reg,
            "indicators": indicators,
            "as_of":      str(df.index[-1].date()),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
