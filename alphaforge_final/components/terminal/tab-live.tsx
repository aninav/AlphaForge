"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { C, ErrorState, Label, Panel, RegimeBadge, Skeleton, displayDateTime, signalColor, signalLabel } from "./design-system"
import type { SignalResponse, TerminalParams } from "@/types"

interface Props {
  params: TerminalParams
}

export function TabLive({ params }: Props) {
  const [data, setData] = useState<SignalResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await api.signal(params)
        if (active) setData(res)
      } catch (e) {
        if (active) setError((e as Error).message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [params.ticker, params.strategy, params.fast, params.slow, params.bb_k, params.allow_short])

  if (error) return <div className="p-5"><ErrorState message={error} /></div>

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="mb-6">
        <p className="font-mono text-[13px] uppercase tracking-[0.08em]" style={{ color: C.bright }}>
          Live Signal
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.subtle }}>
          {params.ticker} · latest bar only · no backtest running
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : data ? (
        <>
          <Panel className="mb-5 py-8 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: C.muted }}>
              Current signal
            </p>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: C.body }}>
              As of {displayDateTime(data.as_of)}
            </p>
            <p className="mb-4 font-mono text-5xl font-medium tracking-[0.1em]" style={{ color: signalColor(data.signal) }}>
              {signalLabel(data.signal)}
            </p>
            <div className="flex justify-center">
              <RegimeBadge regime={data.regime.current_regime} />
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-4">
            <Panel>
              <Label>Latest indicators</Label>
              <div className="space-y-2.5">
                {[
                  ["Close", data.indicators.close, ""],
                  [`SMA ${params.fast}`, data.indicators.sma_fast, ""],
                  [`SMA ${params.slow}`, data.indicators.sma_slow, ""],
                  ["BB Lower", data.indicators.bb_lower, ""],
                  ["BB Mid", data.indicators.bb_mid, ""],
                  ["BB Upper", data.indicators.bb_upper, ""],
                  ["Vol (ann.)", data.indicators.vol_ann !== null ? data.indicators.vol_ann * 100 : null, "%"],
                  ["RSI 14", data.indicators.rsi, ""],
                ].map(([label, val, suffix]) => (
                  <div key={String(label)} className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: C.muted }}>
                      {label}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: C.text }}>
                      {val !== null && val !== undefined ? `${Number(val).toFixed(2)}${suffix}` : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <Label>Regime detail</Label>
              <div className="mb-5 space-y-2.5">
                {[
                  ["Regime", data.regime.current_regime],
                  ["Vol pct", data.regime.current_vol_pct !== null ? `${data.regime.current_vol_pct}%` : "-"],
                  ["SMA slope", data.regime.current_slope !== null ? `${data.regime.current_slope}%` : "-"],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: C.muted }}>
                      {label}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: C.text }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <Label>Regime distribution</Label>
              <div className="space-y-2">
                {Object.entries(data.regime.distribution).map(([regime, pct]) => (
                  <div key={regime} className="flex items-center gap-2">
                    <span className="w-16 font-mono text-[8px]" style={{ color: C.body }}>
                      {regime}
                    </span>
                    <div className="h-1 flex-1" style={{ background: C.dim }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          background: regime === "Trending" ? C.pos : regime === "HighVol" ? C.neg : C.warn,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[8px]" style={{ color: C.text }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  )
}
