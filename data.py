"""
data.py
-------
Responsible for fetching, cleaning, and caching market data via yfinance.
All other modules consume DataFrames produced here.
"""

import os
import time
import pandas as pd
import yfinance as yf

CACHE_DIR = "data"

# Yahoo frequently returns HTTP 429 (rate limit) to datacenter IPs, which yfinance
# surfaces as an empty DataFrame. Retry a few times with backoff before giving up.
_MAX_RETRIES = 3
_RETRY_SLEEP = 1.5  # seconds, multiplied by the attempt number


class DataUnavailableError(Exception):
    """Raised when market data could not be fetched (e.g. provider rate limit)."""


def _cache_path(ticker: str, start: str, end: str) -> str:
    return os.path.join(CACHE_DIR, f"{ticker}_{start}_{end}.csv")


def _download(ticker: str, start: str, end: str) -> pd.DataFrame:
    """Single download attempt. Returns a clean (possibly empty) DataFrame."""
    raw = yf.download(ticker, start=start, end=end, auto_adjust=True, progress=False)

    if raw is None or raw.empty:
        return pd.DataFrame()

    # Flatten MultiIndex columns if present (yfinance >= 0.2.x quirk)
    if isinstance(raw.columns, pd.MultiIndex):
        raw.columns = [col[0] for col in raw.columns]

    cols = [c for c in ["Open", "High", "Low", "Close", "Volume"] if c in raw.columns]
    if not cols:
        return pd.DataFrame()

    df = raw[cols].copy()
    df.index.name = "Date"
    df.dropna(inplace=True)
    return df


def fetch_data(ticker: str, start: str, end: str, use_cache: bool = True) -> pd.DataFrame:
    """
    Download OHLCV data for a single ticker from yfinance.
    Returns a clean DataFrame indexed by Date with columns:
    [Open, High, Low, Close, Volume]

    Parameters
    ----------
    ticker    : e.g. "QQQ"
    start     : "YYYY-MM-DD"
    end       : "YYYY-MM-DD"
    use_cache : skip download if a NON-EMPTY CSV already exists

    Raises
    ------
    DataUnavailableError : if the provider returns no data after retries
                           (usually a rate limit, not a bad date range).
    """
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_file = _cache_path(ticker, start, end)

    # Only trust a cache file that actually has rows — never a poisoned empty one.
    if use_cache and os.path.exists(cache_file) and os.path.getsize(cache_file) > 0:
        try:
            cached = pd.read_csv(cache_file, index_col="Date", parse_dates=True)
            if not cached.empty:
                return cached
        except Exception:
            pass  # corrupt cache — fall through and refetch

    last_error: Exception | None = None
    for attempt in range(_MAX_RETRIES):
        try:
            df = _download(ticker, start, end)
        except Exception as e:  # network / parsing errors from yfinance
            last_error = e
            df = pd.DataFrame()

        if not df.empty:
            df.to_csv(cache_file)  # cache ONLY successful, non-empty results
            return df

        if attempt < _MAX_RETRIES - 1:
            time.sleep(_RETRY_SLEEP * (attempt + 1))

    # Every attempt came back empty. Do not cache this — report it honestly.
    detail = (
        f"Market data for '{ticker}' is temporarily unavailable. The data provider "
        f"(Yahoo Finance) may be rate-limiting requests — please try again in a moment."
    )
    if last_error is not None:
        detail += f" ({type(last_error).__name__})"
    raise DataUnavailableError(detail)


def fetch_basket(tickers: list[str], start: str, end: str, use_cache: bool = True) -> dict[str, pd.DataFrame]:
    """
    Fetch data for a list of tickers. Returns {ticker: DataFrame}.
    Used by the portfolio rotation module.
    """
    return {t: fetch_data(t, start, end, use_cache) for t in tickers}


def align_basket(basket: dict[str, pd.DataFrame], price_col: str = "Close") -> pd.DataFrame:
    """
    Align multiple ticker price series on a common date index.
    Returns a wide DataFrame: columns = tickers, rows = dates.
    """
    frames = {ticker: df[price_col].rename(ticker) for ticker, df in basket.items()}
    aligned = pd.concat(frames, axis=1).dropna()
    return aligned
