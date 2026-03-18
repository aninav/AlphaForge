// ── Chart / data types ───────────────────────────────────────────────────────

export interface ChartPoint {
  Date: string
  Close?: number
  Equity?: number
  Drawdown?: number
  Signal?: number
  Position?: number
  Regime?: string
}

export interface TradeRow {
  Entry_Date: string
  Exit_Date: string
  Entry_Price: number
  Exit_Price: number
  Return_pct: number
  Side: "Long" | "Short"
  Bars_Held?: number
}

// ── Metrics ──────────────────────────────────────────────────────────────────

export interface Metrics {
  CAGR?: number | null
  Sharpe?: number | null
  Sortino?: number | null
  "Max Drawdown"?: number | null
  "Total Return"?: number | null
  "Turnover (avg)"?: number | null
  "Win Rate"?: number | null
  "Avg Win"?: number | null
  "Avg Loss"?: number | null
  "Num Trades"?: number | null
}

// ── Regime ───────────────────────────────────────────────────────────────────

export interface RegimeInfo {
  current_regime: "Trending" | "Choppy" | "HighVol"
  distribution: Record<string, number>
  current_vol_pct: number | null
  current_slope: number | null
}

// ── Backtest response ─────────────────────────────────────────────────────────

export interface BacktestResponse {
  ticker: string
  strategy: string
  metrics: Metrics
  regime: RegimeInfo
  chart: ChartPoint[]
  trades: TradeRow[]
  signal_now: number
  date_range: { start: string; end: string; bars: number }
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

export interface HeatmapCell {
  fast: number
  slow: number
  sharpe: number | null
}

// ── Walk-forward ──────────────────────────────────────────────────────────────

export interface FoldRow {
  Fold: number
  Train_Start: string
  Train_End: string
  Test_Start: string
  Test_End: string
  Best_Fast: number
  Best_Slow: number
  OOS_Sharpe: number | null
}

export interface WalkForwardResponse {
  folds: FoldRow[]
  chart: ChartPoint[]
  metrics: Metrics
}

// ── Events ────────────────────────────────────────────────────────────────────

export interface EventsResponse {
  event_type: string
  available_events: string[]
  impact_table: Record<string, number | string>[]
  ev_returns: number[]
  non_ev_returns: number[]
  price_chart: Array<{ Date: string; Close: number; IsEvent: boolean }>
}

// ── Rotation ─────────────────────────────────────────────────────────────────

export interface RotationResponse {
  tickers: string[]
  current: string | null
  allocation: Record<string, number>
  chart: Array<Record<string, number | string | null>>
}

// ── Signal ────────────────────────────────────────────────────────────────────

export interface SignalResponse {
  signal: number
  regime: RegimeInfo
  indicators: Record<string, number | null>
  as_of: string
}

// ── Sidebar params ────────────────────────────────────────────────────────────

export interface TerminalParams {
  ticker: string
  start: string
  end: string
  strategy: "momentum" | "mean_reversion" | "regime_aware"
  fast: number
  slow: number
  bb_k: number
  allow_short: boolean
  commission: number
  slippage: number
  event_type: string
  mode: "backtest" | "walkforward" | "live"
}
