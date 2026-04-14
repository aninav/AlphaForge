"use client"

import { C, Label, ForgeSlider, ForgeSelect, Divider } from "./design-system"
import { ETFSearch } from "./etf-search"
import type { TerminalParams } from "@/types"

// Earliest date yfinance reliably has data for common ETFs
const MIN_DATE = "1993-01-29" // SPY inception — practical floor
const MAX_DATE = new Date().toISOString().split("T")[0] // today

interface SidebarProps {
  params: TerminalParams
  onChange: (p: Partial<TerminalParams>) => void
  onRun: () => void
  loading: boolean
}

export function Sidebar({ params, onChange, onRun, loading }: SidebarProps) {
  return (
    <aside
      className="w-52 flex-shrink-0 flex flex-col border-r overflow-y-auto"
      style={{ background: C.surface, borderColor: C.border }}
    >
      <div className="p-4 flex-1">

        {/* ETF search */}
        <ETFSearch
          value={params.ticker}
          onChange={ticker => onChange({ ticker })}
        />

        {/* Date range */}
        <div className="mb-1">
          <Label>Start date</Label>
          <input
            type="date"
            value={params.start}
            min={MIN_DATE}
            max={params.end}
            onChange={e => onChange({ start: e.target.value })}
            className="w-full font-mono text-[10px] border px-2 py-1.5 outline-none"
            style={{ background: C.bg, color: C.text, borderColor: C.dim, colorScheme: "dark" }}
          />
          <p className="font-mono text-[8px] mt-1" style={{ color: C.muted }}>
            earliest: {MIN_DATE}
          </p>
        </div>

        <div className="mb-4 mt-3">
          <Label>End date</Label>
          <input
            type="date"
            value={params.end}
            min={params.start}
            max={MAX_DATE}
            onChange={e => onChange({ end: e.target.value })}
            className="w-full font-mono text-[10px] border px-2 py-1.5 outline-none"
            style={{ background: C.bg, color: C.text, borderColor: C.dim, colorScheme: "dark" }}
          />
          <p className="font-mono text-[8px] mt-1" style={{ color: C.muted }}>
            latest: today
          </p>
        </div>

        <Divider />

        {/* Mode */}
        <ForgeSelect
          label="Mode"
          value={params.mode}
          onChange={v => onChange({ mode: v as TerminalParams["mode"] })}
          options={[
            { value: "backtest",    label: "Backtest" },
            { value: "walkforward", label: "Walk-Forward" },
            { value: "live",        label: "Live Signal" },
          ]}
        />

        {/* Strategy */}
        <ForgeSelect
          label="Strategy"
          value={params.strategy}
          onChange={v => onChange({ strategy: v as TerminalParams["strategy"] })}
          options={[
            { value: "momentum",       label: "Momentum" },
            { value: "mean_reversion", label: "Mean Reversion" },
            { value: "regime_aware",   label: "Regime-Aware" },
          ]}
        />

        <Divider />

        {/* SMA params */}
        <ForgeSlider
          label="Fast SMA"
          min={5} max={50} step={1}
          value={params.fast}
          onChange={v => onChange({ fast: v })}
        />
        <ForgeSlider
          label="Slow SMA"
          min={20} max={200} step={1}
          value={params.slow}
          onChange={v => onChange({ slow: v })}
        />
        <ForgeSlider
          label="Bollinger k"
          min={0.5} max={3} step={0.1}
          value={params.bb_k}
          onChange={v => onChange({ bb_k: v })}
        />

        {/* Allow short toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: C.muted }}>
            Allow Short
          </span>
          <button
            onClick={() => onChange({ allow_short: !params.allow_short })}
            className="font-mono text-[8px] tracking-[0.15em] border px-2 py-0.5 transition-colors"
            style={{
              borderColor: params.allow_short ? C.pos    : C.dim,
              color:       params.allow_short ? C.pos    : C.subtle,
              background:  params.allow_short ? C.posDim : "transparent",
            }}
          >
            {params.allow_short ? "ON" : "OFF"}
          </button>
        </div>

        <Divider />

        {/* Costs */}
        <ForgeSlider
          label="Commission (bps)"
          min={0} max={20} step={1}
          value={params.commission}
          onChange={v => onChange({ commission: v })}
        />
        <ForgeSlider
          label="Slippage (bps)"
          min={0} max={20} step={1}
          value={params.slippage}
          onChange={v => onChange({ slippage: v })}
        />

        <Divider />

        {/* Event type */}
        <ForgeSelect
          label="Event Type"
          value={params.event_type}
          onChange={v => onChange({ event_type: v })}
          options={[{ value: "FOMC", label: "FOMC" }]}
        />

      </div>

      {/* Run button pinned to bottom */}
      <div className="p-4 border-t" style={{ borderColor: C.border }}>
        <button
          onClick={onRun}
          disabled={loading}
          className="w-full font-mono text-[9px] tracking-[0.25em] uppercase border py-2.5 transition-colors disabled:opacity-40"
          style={{
            borderColor: C.text,
            color:       C.bg,
            background:  loading ? C.dim : C.text,
            cursor:      loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>
    </aside>
  )
}
