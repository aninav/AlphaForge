"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import {
  C, Panel, Label, MetricCard, Skeleton, ErrorState,
  GhostButton, ForgeSlider,
} from "./design-system"
import { RotationChart } from "./charts"
import type { TerminalParams, RotationResponse } from "@/types"

interface Props {
  params: TerminalParams
}

const TICKER_OPTIONS = ["QQQ", "SPY", "IWM", "TLT", "GLD", "XLK", "XLE"]

export function TabPortfolio({ params }: Props) {
  const [data,       setData]       = useState<RotationResponse | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [tickers,    setTickers]    = useState(["QQQ", "SPY", "IWM", "TLT"])
  const [lookback,   setLookback]   = useState(20)
  const [volFilter,  setVolFilter]  = useState(true)
  const [safeHaven,  setSafeHaven]  = useState("TLT")

  const toggleTicker = (t: string) => {
    setTickers(prev =>
      prev.includes(t)
        ? prev.filter(x => x !== t)
        : [...prev, t]
    )
  }

  const run = async () => {
    if (tickers.length < 2) return
    setLoading(true); setError(null)
    try {
      const res = await api.rotation(tickers, params.start, params.end, lookback, volFilter, safeHaven)
      setData(res)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[13px] tracking-[0.08em] uppercase" style={{ color: C.bright }}>
            Rotation Portfolio
          </p>
          <p className="font-mono text-[9px] tracking-[0.2em] mt-1" style={{ color: C.subtle }}>
            momentum-based asset rotation
          </p>
        </div>
        <GhostButton onClick={run} disabled={loading || tickers.length < 2}>
          {loading ? "Running..." : "Run rotation"}
        </GhostButton>
      </div>

      {/* Controls */}
      <Panel className="mb-5">
        <Label>Universe</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {TICKER_OPTIONS.map(t => (
            <button
              key={t}
              onClick={() => toggleTicker(t)}
              className="font-mono text-[9px] tracking-[0.15em] border px-2.5 py-1 transition-colors"
              style={{
                borderColor: tickers.includes(t) ? C.text    : C.dim,
                color:       tickers.includes(t) ? C.bg      : C.subtle,
                background:  tickers.includes(t) ? C.text    : "transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ForgeSlider
            label="Momentum lookback (days)"
            min={5} max={60} step={1}
            value={lookback}
            onChange={setLookback}
          />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: C.muted }}>
                Vol filter
              </span>
              <button
                onClick={() => setVolFilter(!volFilter)}
                className="font-mono text-[8px] tracking-[0.15em] border px-2 py-0.5"
                style={{
                  borderColor: volFilter ? C.pos    : C.dim,
                  color:       volFilter ? C.pos    : C.subtle,
                  background:  volFilter ? C.posDim : "transparent",
                }}
              >
                {volFilter ? "ON" : "OFF"}
              </button>
            </div>
            {volFilter && (
              <div>
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-1"
                   style={{ color: C.muted }}>Safe haven</p>
                <select
                  value={safeHaven}
                  onChange={e => setSafeHaven(e.target.value)}
                  className="w-full font-mono text-[10px] border px-2 py-1.5"
                  style={{ background: C.bg, color: C.text, borderColor: C.dim, outline: "none" }}
                >
                  {tickers.map(t => (
                    <option key={t} value={t} style={{ background: C.surface }}>{t}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {error && <ErrorState message={error} />}

      {loading && <Skeleton className="h-64 w-full mb-4" />}

      {data && !loading && (
        <>
          {/* Current allocation + summary */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <MetricCard
              label="Current allocation"
              value={data.current ?? "—"}
              color={C.text}
            />
            {Object.entries(data.allocation)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([t, days]) => (
                <MetricCard
                  key={t}
                  label={t}
                  value={`${days}d`}
                  color={C.mid}
                  sub={`${((days / Object.values(data.allocation).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`}
                />
              ))}
          </div>

          {/* Rotation equity chart */}
          <Panel className="mb-4">
            <Label>Rotation vs buy &amp; hold</Label>
            <RotationChart data={data.chart} tickers={data.tickers} />
          </Panel>

          {/* Allocation bar */}
          <Panel>
            <Label>Historical allocation (days)</Label>
            <div className="space-y-2 mt-1">
              {Object.entries(data.allocation)
                .sort((a, b) => b[1] - a[1])
                .map(([t, days]) => {
                  const total = Object.values(data.allocation).reduce((a, b) => a + b, 0)
                  const pct   = (days / total) * 100
                  return (
                    <div key={t} className="flex items-center gap-3">
                      <span className="font-mono text-[9px] w-8 text-right" style={{ color: C.mid }}>{t}</span>
                      <div className="flex-1 h-1.5" style={{ background: C.dim }}>
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, background: C.text }}
                        />
                      </div>
                      <span className="font-mono text-[9px] w-8" style={{ color: C.text }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  )
                })}
            </div>
          </Panel>
        </>
      )}

      {!data && !loading && !error && (
        <div className="text-center py-16">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: C.muted }}>
            Select tickers and run rotation backtest
          </p>
        </div>
      )}

    </div>
  )
}
