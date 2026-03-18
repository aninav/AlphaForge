import type {
  BacktestResponse,
  HeatmapCell,
  WalkForwardResponse,
  EventsResponse,
  RotationResponse,
  SignalResponse,
  TerminalParams,
} from "@/types"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

async function get<T>(path: string, params: Record<string, string | number | boolean>): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()
  const res = await fetch(`${BASE}${path}?${qs}`, { cache: "no-store" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? "API error")
  }
  return res.json() as Promise<T>
}

// ── helpers to build common param objects ─────────────────────────────────────

function baseParams(p: TerminalParams) {
  return {
    ticker:      p.ticker,
    start:       p.start,
    end:         p.end,
    strategy:    p.strategy,
    fast:        p.fast,
    slow:        p.slow,
    bb_k:        p.bb_k,
    allow_short: p.allow_short,
    commission:  p.commission,
    slippage:    p.slippage,
    event_type:  p.event_type,
  }
}

// ── exports ───────────────────────────────────────────────────────────────────

export const api = {
  backtest(p: TerminalParams) {
    return get<BacktestResponse>("/api/backtest", baseParams(p))
  },

  heatmap(p: Pick<TerminalParams, "ticker" | "start" | "end" | "commission" | "slippage">) {
    return get<{ heatmap: HeatmapCell[] }>("/api/heatmap", {
      ticker:     p.ticker,
      start:      p.start,
      end:        p.end,
      commission: p.commission,
      slippage:   p.slippage,
    })
  },

  walkforward(
    p: Pick<TerminalParams, "ticker" | "start" | "end" | "commission" | "slippage">,
    trainDays: number,
    testDays: number,
    flatten: boolean,
  ) {
    return get<WalkForwardResponse>("/api/walkforward", {
      ticker:      p.ticker,
      start:       p.start,
      end:         p.end,
      train_days:  trainDays,
      test_days:   testDays,
      commission:  p.commission,
      slippage:    p.slippage,
      flatten,
    })
  },

  events(
    p: Pick<TerminalParams, "ticker" | "start" | "end" | "event_type">,
    fwdWindows: number[],
  ) {
    return get<EventsResponse>("/api/events", {
      ticker:      p.ticker,
      start:       p.start,
      end:         p.end,
      event_type:  p.event_type,
      fwd_windows: fwdWindows.join(","),
    })
  },

  rotation(
    tickers: string[],
    start: string,
    end: string,
    lookback: number,
    volFilter: boolean,
    safeHaven: string,
  ) {
    return get<RotationResponse>("/api/rotation", {
      tickers:    tickers.join(","),
      start,
      end,
      lookback,
      vol_filter: volFilter,
      safe_haven: safeHaven,
    })
  },

  signal(p: TerminalParams) {
    return get<SignalResponse>("/api/signal", baseParams(p))
  },
}
