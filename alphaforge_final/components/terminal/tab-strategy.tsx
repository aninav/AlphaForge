"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import {
  C, Panel, Label, MetricCard, Skeleton, ErrorState,
  GhostButton, ForgeSlider, Divider, fmtPct, fmt,
} from "./design-system"
import { EquityChart, DrawdownChart, SignalChart } from "./charts"
import type { TerminalParams, HeatmapCell, WalkForwardResponse } from "@/types"
import type { BacktestResponse } from "@/types"

interface Props {
  params: TerminalParams
  backtestData: BacktestResponse | null
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

function HeatmapGrid({ cells }: { cells: HeatmapCell[] }) {
  const fastVals = [...new Set(cells.map(c => c.fast))].sort((a, b) => a - b)
  const slowVals = [...new Set(cells.map(c => c.slow))].sort((a, b) => a - b)

  const map: Record<string, number | null> = {}
  for (const c of cells) map[`${c.fast}_${c.slow}`] = c.sharpe

  // Color scale: null=dim, negative=neg, 0-1=mid, 1-2=text, 2+=pos
  function cellColor(v: number | null): string {
    if (v === null) return C.dim
    if (v < 0)  return C.neg
    if (v < 0.5) return C.muted
    if (v < 1)  return C.mid
    if (v < 1.5) return C.text
    return C.pos
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-center w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <td className="font-mono text-[8px] p-1" style={{ color: C.subtle }}>F\S</td>
            {slowVals.map(s => (
              <td key={s} className="font-mono text-[8px] p-1" style={{ color: C.subtle }}>{s}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {fastVals.map(f => (
            <tr key={f}>
              <td className="font-mono text-[8px] p-1" style={{ color: C.subtle }}>{f}</td>
              {slowVals.map(s => {
                const v = map[`${f}_${s}`] ?? null
                return (
                  <td
                    key={s}
                    className="font-mono text-[8px] p-1.5"
                    style={{
                      color:      cellColor(v),
                      background: v !== null ? `${cellColor(v)}18` : C.surface,
                      border:     `1px solid ${C.border}`,
                    }}
                  >
                    {v !== null ? v.toFixed(2) : "—"}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Walk-Forward results ──────────────────────────────────────────────────────

function WFResults({ data }: { data: WalkForwardResponse }) {
  return (
    <div>
      {/* OOS metrics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "OOS CAGR",    value: fmtPct(data.metrics.CAGR),           color: C.pos },
          { label: "OOS Sharpe",  value: fmt(data.metrics.Sharpe),             color: C.text },
          { label: "OOS Max DD",  value: fmtPct(data.metrics["Max Drawdown"]), color: C.neg },
          { label: "Total Ret",   value: fmtPct(data.metrics["Total Return"]), color: C.pos },
        ].map(c => (
          <MetricCard key={c.label} label={c.label} value={c.value} color={c.color} />
        ))}
      </div>

      {/* OOS equity */}
      <Panel className="mb-3">
        <Label>OOS equity curve</Label>
        <EquityChart data={data.chart} />
      </Panel>

      <Panel className="mb-3">
        <Label>OOS drawdown</Label>
        <DrawdownChart data={data.chart} />
      </Panel>

      {/* Fold log */}
      <Panel>
        <Label>Fold log</Label>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Fold", "Train start", "Train end", "Test start", "Test end", "Fast", "Slow", "Sharpe"].map(h => (
                  <th key={h} className="font-mono text-[8px] tracking-[0.15em] uppercase text-left p-2"
                      style={{ color: C.muted, borderBottom: `1px solid ${C.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.folds.map(fold => (
                <tr key={fold.Fold}
                    style={{ borderBottom: `1px solid ${C.border}` }}>
                  {[
                    fold.Fold,
                    fold.Train_Start,
                    fold.Train_End,
                    fold.Test_Start,
                    fold.Test_End,
                    fold.Best_Fast,
                    fold.Best_Slow,
                  ].map((v, i) => (
                    <td key={i} className="font-mono text-[9px] p-2" style={{ color: C.text }}>
                      {v}
                    </td>
                  ))}
                  <td className="font-mono text-[9px] p-2"
                      style={{ color: (fold.OOS_Sharpe ?? 0) >= 1 ? C.pos : C.text }}>
                    {fold.OOS_Sharpe?.toFixed(2) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function TabStrategy({ params, backtestData }: Props) {
  const [hmLoading, setHmLoading]   = useState(false)
  const [hmData,    setHmData]      = useState<HeatmapCell[] | null>(null)
  const [hmError,   setHmError]     = useState<string | null>(null)

  const [wfLoading, setWfLoading]   = useState(false)
  const [wfData,    setWfData]      = useState<WalkForwardResponse | null>(null)
  const [wfError,   setWfError]     = useState<string | null>(null)
  const [trainDays, setTrainDays]   = useState(252)
  const [testDays,  setTestDays]    = useState(63)
  const [flatten,   setFlatten]     = useState(true)

  const runHeatmap = async () => {
    setHmLoading(true); setHmError(null)
    try {
      const res = await api.heatmap(params)
      setHmData(res.heatmap)
    } catch (e) {
      setHmError((e as Error).message)
    } finally {
      setHmLoading(false)
    }
  }

  const runWF = async () => {
    setWfLoading(true); setWfError(null)
    try {
      const res = await api.walkforward(params, trainDays, testDays, flatten)
      setWfData(res)
    } catch (e) {
      setWfError((e as Error).message)
    } finally {
      setWfLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">

      {/* Signal chart */}
      {backtestData && (
        <Panel className="mb-5">
          <Label>Price + signal</Label>
          <SignalChart data={backtestData.chart} />
        </Panel>
      )}

      <Divider />

      {/* Heatmap */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: C.text }}>
            Momentum — Sharpe heatmap
          </p>
          <GhostButton onClick={runHeatmap} disabled={hmLoading}>
            {hmLoading ? "Running..." : "Run heatmap"}
          </GhostButton>
        </div>
        {hmError  && <ErrorState message={hmError} />}
        {hmLoading && <Skeleton className="h-48 w-full" />}
        {hmData   && !hmLoading && <Panel><HeatmapGrid cells={hmData} /></Panel>}
      </div>

      <Divider />

      {/* Walk-forward */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: C.text }}>
            Walk-forward optimisation
          </p>
          <GhostButton onClick={runWF} disabled={wfLoading}>
            {wfLoading ? "Running..." : "Run walk-forward"}
          </GhostButton>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ForgeSlider
            label="Training window (days)"
            min={63} max={504} step={1}
            value={trainDays}
            onChange={setTrainDays}
          />
          <ForgeSlider
            label="Test window (days)"
            min={21} max={126} step={1}
            value={testDays}
            onChange={setTestDays}
          />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setFlatten(!flatten)}
            className="font-mono text-[8px] tracking-[0.15em] border px-2 py-0.5"
            style={{
              borderColor: flatten ? C.pos    : C.dim,
              color:       flatten ? C.pos    : C.subtle,
              background:  flatten ? C.posDim : "transparent",
            }}
          >
            {flatten ? "FLATTEN ON" : "FLATTEN OFF"}
          </button>
          <span className="font-mono text-[9px]" style={{ color: C.subtle }}>
            flatten position at fold boundaries
          </span>
        </div>

        {wfError  && <ErrorState message={wfError} />}
        {wfLoading && <Skeleton className="h-64 w-full" />}
        {wfData   && !wfLoading && <WFResults data={wfData} />}
      </div>

    </div>
  )
}
