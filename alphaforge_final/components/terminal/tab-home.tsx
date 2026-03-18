"use client"

import {
  C, Panel, Label, MetricCard, RegimeBadge,
  Skeleton, ErrorState, Divider,
  fmt, fmtPct, signalLabel, signalColor,
} from "./design-system"
import { EquityChart, DrawdownChart, RegimeChart } from "./charts"
import type { BacktestResponse } from "@/types"

interface Props {
  data:    BacktestResponse | null
  loading: boolean
  error:   string | null
  ticker:  string
  strategy: string
}

function MetricsRow({ metrics }: { metrics: BacktestResponse["metrics"] }) {
  const cards = [
    { label: "CAGR",         value: fmtPct(metrics.CAGR),           color: (metrics.CAGR ?? 0) >= 0 ? C.pos : C.neg },
    { label: "Sharpe",       value: fmt(metrics.Sharpe),             color: (metrics.Sharpe ?? 0) >= 1 ? C.pos : C.text },
    { label: "Sortino",      value: fmt(metrics.Sortino),            color: (metrics.Sortino ?? 0) >= 1 ? C.pos : C.text },
    { label: "Max Drawdown", value: fmtPct(metrics["Max Drawdown"]), color: C.neg },
    { label: "Total Return", value: fmtPct(metrics["Total Return"]), color: (metrics["Total Return"] ?? 0) >= 0 ? C.pos : C.neg },
    { label: "Turnover",     value: fmtPct(metrics["Turnover (avg)"]), color: C.text },
  ]
  return (
    <div className="grid grid-cols-6 gap-2 mb-4">
      {cards.map(c => (
        <MetricCard key={c.label} label={c.label} value={c.value} color={c.color} />
      ))}
    </div>
  )
}

function LoadingMetrics() {
  return (
    <div className="grid grid-cols-6 gap-2 mb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-3 border" style={{ background: C.surface, borderColor: C.border }}>
          <Skeleton className="h-2 w-12 mb-3" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export function TabHome({ data, loading, error, ticker, strategy }: Props) {
  if (error) return <ErrorState message={error} />

  return (
    <div className="flex-1 overflow-y-auto p-5">

      {/* Title row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-mono text-[13px] tracking-[0.08em] uppercase"
              style={{ color: C.bright }}>
            {ticker}
            <span style={{ color: C.muted }}> · {strategy.replace("_", " ")}</span>
          </h2>
          {data && (
            <p className="font-mono text-[9px] tracking-[0.2em] mt-1" style={{ color: C.subtle }}>
              {data.date_range.start} — {data.date_range.end} · {data.date_range.bars.toLocaleString()} bars
            </p>
          )}
        </div>

        {/* Signal + regime */}
        {data && (
          <div className="flex items-center gap-3">
            <RegimeBadge regime={data.regime.current_regime} />
            <span
              className="font-mono text-[11px] font-medium tracking-[0.12em]"
              style={{ color: signalColor(data.signal_now) }}
            >
              {signalLabel(data.signal_now)}
            </span>
          </div>
        )}
      </div>

      {/* Metrics */}
      {loading ? <LoadingMetrics /> : data ? <MetricsRow metrics={data.metrics} /> : null}

      {/* Equity curve */}
      <Panel className="mb-3">
        <Label>Equity curve — {data ? "backtest" : "—"}</Label>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : data ? (
          <EquityChart data={data.chart} />
        ) : null}
      </Panel>

      {/* Drawdown */}
      <Panel className="mb-3">
        <Label>Drawdown</Label>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : data ? (
          <DrawdownChart data={data.chart} />
        ) : null}
      </Panel>

      {/* Bottom row: regime dist + live signal detail */}
      <div className="grid grid-cols-2 gap-3">
        <Panel>
          <Label>Regime distribution</Label>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : data ? (
            <RegimeChart distribution={data.regime.distribution} />
          ) : null}
        </Panel>

        <Panel>
          <Label>Signal detail</Label>
          {data ? (
            <div className="space-y-2">
              {[
                ["Vol percentile", data.regime.current_vol_pct != null ? `${data.regime.current_vol_pct}%` : "—"],
                ["SMA slope",      data.regime.current_slope   != null ? `${data.regime.current_slope}%`  : "—"],
                ["Win rate",       fmtPct(data.metrics["Win Rate"])],
                ["Avg win",        fmtPct(data.metrics["Avg Win"])],
                ["Avg loss",       fmtPct(data.metrics["Avg Loss"])],
                ["Trades",         String(data.metrics["Num Trades"] ?? "—")],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase"
                        style={{ color: C.muted }}>
                    {label}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: C.text }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-2 w-16" />
                  <Skeleton className="h-2 w-10" />
                </div>
              ))}
            </div>
          ) : null}
        </Panel>
      </div>

    </div>
  )
}
