"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { C, Panel, Label, Skeleton, ErrorState, GhostButton } from "./design-system"
import { ReturnDistChart } from "./charts"
import type { TerminalParams, EventsResponse } from "@/types"

interface Props {
  params: TerminalParams
}

export function TabEvents({ params }: Props) {
  const [data,    setData]    = useState<EventsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [windows, setWindows] = useState([1, 3, 5])

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.events(params, windows)
      setData(res)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [params.ticker, params.start, params.end, params.event_type])

  if (error)   return <div className="p-5"><ErrorState message={error} /></div>

  return (
    <div className="flex-1 overflow-y-auto p-5">

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[13px] tracking-[0.08em] uppercase" style={{ color: C.bright }}>
            Event Impact
          </p>
          <p className="font-mono text-[9px] tracking-[0.2em] mt-1" style={{ color: C.subtle }}>
            {params.event_type} · {params.ticker}
          </p>
        </div>
        <GhostButton onClick={load} disabled={loading}>Refresh</GhostButton>
      </div>

      {/* Impact table */}
      <Panel className="mb-4">
        <Label>Mean forward returns — event vs non-event</Label>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : data ? (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {data.impact_table[0] && Object.keys(data.impact_table[0]).map(k => (
                    <th key={k}
                        className="font-mono text-[8px] tracking-[0.15em] uppercase text-left p-2"
                        style={{ color: C.muted, borderBottom: `1px solid ${C.border}` }}>
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.impact_table.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    {Object.entries(row).map(([k, v]) => {
                      const num     = typeof v === "number" ? v : null
                      const isGroup = k === "Group"
                      const color   = isGroup ? C.text
                                    : num === null ? C.mid
                                    : k.startsWith("Fwd") && num > 0 ? C.pos
                                    : k.startsWith("Fwd") && num < 0 ? C.neg
                                    : C.text
                      return (
                        <td key={k} className="font-mono text-[9px] p-2" style={{ color }}>
                          {typeof v === "number" && k.startsWith("Fwd")
                            ? `${(v * 100).toFixed(2)}%`
                            : typeof v === "number"
                            ? v.toFixed(4)
                            : String(v)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>

      {/* Distribution chart */}
      <Panel className="mb-4">
        <Label>1-day forward return distribution</Label>
        {loading ? (
          <Skeleton className="h-44 w-full" />
        ) : data ? (
          <ReturnDistChart
            evReturns={data.ev_returns}
            nonEvReturns={data.non_ev_returns}
            evLabel={params.event_type}
          />
        ) : null}
      </Panel>

      {/* Price chart with markers */}
      <Panel>
        <Label>{params.event_type} dates on price chart</Label>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : data ? (
          <div className="font-mono text-[9px] text-center py-8" style={{ color: C.subtle }}>
            {data.price_chart.filter(d => d.IsEvent).length} {params.event_type} events
            &nbsp;·&nbsp; {data.price_chart.length} total bars
          </div>
        ) : null}
      </Panel>

    </div>
  )
}
