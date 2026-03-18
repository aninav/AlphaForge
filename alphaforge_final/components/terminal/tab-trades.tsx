"use client"

import { useState, useMemo } from "react"
import { C, Panel, Label, MetricCard, Skeleton, ErrorState, fmt, fmtPct } from "./design-system"
import type { BacktestResponse, TradeRow } from "@/types"

interface Props {
  data:    BacktestResponse | null
  loading: boolean
  error:   string | null
}

export function TabTrades({ data, loading, error }: Props) {
  const [sideFilter, setSideFilter]       = useState<"All" | "Long" | "Short">("All")
  const [minReturn,  setMinReturn]        = useState(-50)
  const [maxReturn,  setMaxReturn]        = useState(100)
  const [minBars,    setMinBars]          = useState(0)

  const trades: TradeRow[] = data?.trades ?? []

  const filtered = useMemo(() => {
    return trades.filter(t =>
      (sideFilter === "All" || t.Side === sideFilter) &&
      t.Return_pct >= minReturn &&
      t.Return_pct <= maxReturn &&
      (t.Bars_Held === undefined || t.Bars_Held >= minBars)
    )
  }, [trades, sideFilter, minReturn, maxReturn, minBars])

  const wins   = filtered.filter(t => t.Return_pct > 0)
  const losses = filtered.filter(t => t.Return_pct < 0)
  const avgWin  = wins.length   ? wins.reduce((s, t)   => s + t.Return_pct, 0) / wins.length   : null
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.Return_pct, 0) / losses.length : null
  const winRate = filtered.length ? (wins.length / filtered.length) * 100 : null

  if (error)   return <div className="p-5"><ErrorState message={error} /></div>

  return (
    <div className="flex-1 overflow-y-auto p-5">

      <div className="mb-5">
        <p className="font-mono text-[13px] tracking-[0.08em] uppercase" style={{ color: C.bright }}>
          Trade Log
        </p>
        <p className="font-mono text-[9px] tracking-[0.2em] mt-1" style={{ color: C.subtle }}>
          {filtered.length} of {trades.length} trades shown
        </p>
      </div>

      {/* Summary cards */}
      {!loading && data && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          <MetricCard label="Total trades" value={String(filtered.length)} color={C.text} />
          <MetricCard label="Win rate"     value={fmtPct(winRate)}         color={C.pos} />
          <MetricCard label="Avg win"      value={fmtPct(avgWin)}          color={C.pos} />
          <MetricCard label="Avg loss"     value={fmtPct(avgLoss)}         color={C.neg} />
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 border" style={{ background: C.surface, borderColor: C.border }}>
              <Skeleton className="h-2 w-12 mb-3" /><Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <Panel className="mb-4">
        <Label>Filters</Label>
        <div className="flex flex-wrap gap-4 items-end">

          {/* Side filter */}
          <div>
            <p className="font-mono text-[8px] tracking-[0.15em] uppercase mb-1.5"
               style={{ color: C.muted }}>Side</p>
            <div className="flex gap-1">
              {(["All", "Long", "Short"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSideFilter(s)}
                  className="font-mono text-[8px] tracking-[0.12em] border px-2.5 py-1 transition-colors"
                  style={{
                    borderColor: sideFilter === s ? C.text    : C.dim,
                    color:       sideFilter === s ? C.bg      : C.subtle,
                    background:  sideFilter === s ? C.text    : "transparent",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Return range */}
          <div>
            <p className="font-mono text-[8px] tracking-[0.15em] uppercase mb-1.5"
               style={{ color: C.muted }}>Min return %</p>
            <input
              type="number"
              value={minReturn}
              onChange={e => setMinReturn(Number(e.target.value))}
              className="font-mono text-[10px] border px-2 py-1 w-20"
              style={{ background: C.bg, color: C.text, borderColor: C.dim, outline: "none" }}
            />
          </div>
          <div>
            <p className="font-mono text-[8px] tracking-[0.15em] uppercase mb-1.5"
               style={{ color: C.muted }}>Max return %</p>
            <input
              type="number"
              value={maxReturn}
              onChange={e => setMaxReturn(Number(e.target.value))}
              className="font-mono text-[10px] border px-2 py-1 w-20"
              style={{ background: C.bg, color: C.text, borderColor: C.dim, outline: "none" }}
            />
          </div>

          {/* Min bars */}
          <div>
            <p className="font-mono text-[8px] tracking-[0.15em] uppercase mb-1.5"
               style={{ color: C.muted }}>Min bars held</p>
            <input
              type="number"
              value={minBars}
              onChange={e => setMinBars(Number(e.target.value))}
              className="font-mono text-[10px] border px-2 py-1 w-20"
              style={{ background: C.bg, color: C.text, borderColor: C.dim, outline: "none" }}
            />
          </div>
        </div>
      </Panel>

      {/* Trade table */}
      <Panel>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : filtered.length === 0 ? (
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-center py-10"
             style={{ color: C.muted }}>
            No trades match the filters
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Entry date", "Exit date", "Entry $", "Exit $", "Return %", "Side", "Bars"].map(h => (
                    <th key={h}
                        className="font-mono text-[8px] tracking-[0.12em] uppercase text-left p-2"
                        style={{ color: C.muted, borderBottom: `1px solid ${C.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="font-mono text-[9px] p-2" style={{ color: C.mid }}>{t.Entry_Date}</td>
                    <td className="font-mono text-[9px] p-2" style={{ color: C.mid }}>{t.Exit_Date}</td>
                    <td className="font-mono text-[9px] p-2" style={{ color: C.text }}>${t.Entry_Price.toFixed(2)}</td>
                    <td className="font-mono text-[9px] p-2" style={{ color: C.text }}>${t.Exit_Price.toFixed(2)}</td>
                    <td className="font-mono text-[9px] p-2 font-medium"
                        style={{ color: t.Return_pct > 0 ? C.pos : t.Return_pct < 0 ? C.neg : C.mid }}>
                      {t.Return_pct > 0 ? "+" : ""}{t.Return_pct.toFixed(2)}%
                    </td>
                    <td className="font-mono text-[9px] p-2" style={{ color: C.subtle }}>{t.Side}</td>
                    <td className="font-mono text-[9px] p-2" style={{ color: C.subtle }}>
                      {t.Bars_Held ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
