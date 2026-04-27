"use client"

import { C, Divider, ForgeSelect, ForgeSlider, Label, displayDate } from "./design-system"
import { ETFSearch } from "./etf-search"
import { Watchlist }  from "./watchlist"
import { getTodayIsoDate } from "@/lib/date"
import type { TerminalParams } from "@/types"

const MIN_DATE = "1993-01-29"
const MAX_DATE = getTodayIsoDate()

const STRATEGIES = [
  { value: "momentum",          label: "Momentum" },
  { value: "mean_reversion",    label: "Mean Reversion" },
  { value: "regime_aware",      label: "Regime-Aware" },
  { value: "trend_following",   label: "Trend Following" },
  { value: "breakout",          label: "Breakout" },
  { value: "rsi_mean_reversion",label: "RSI Mean Reversion" },
  { value: "dual_momentum",     label: "Dual Momentum" },
  { value: "volatility_target", label: "Volatility Targeting" },
  { value: "carry",             label: "Carry" },
  { value: "pairs",             label: "Pairs / Spread" },
]

interface SidebarProps {
  params:         TerminalParams
  onChange:       (p: Partial<TerminalParams>) => void
  onRun:          () => void
  loading:        boolean
  onTickerSelect: (ticker: string) => void
}

export function Sidebar({ params, onChange, onRun, loading, onTickerSelect }: SidebarProps) {
  return (
    <aside
      className="flex w-56 flex-shrink-0 flex-col overflow-y-auto border-r"
      style={{ background: C.surface, borderColor: C.border }}
    >
      <div className="flex-1 p-4">

        {/* ETF search */}
        <ETFSearch value={params.ticker} onChange={ticker => onChange({ ticker })} />

        {/* Start date */}
        <div className="mb-1">
          <Label>Start date</Label>
          <input
            type="date"
            value={params.start}
            min={MIN_DATE}
            max={params.end}
            onChange={e => onChange({ start: e.target.value })}
            className="w-full border px-3 py-2 font-mono text-[12px] tracking-[0.08em] outline-none"
            style={{ background: C.bg, color: C.text, borderColor: C.dim }}
          />
          <p className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.15em]" style={{ color: C.muted }}>
            Earliest: {displayDate(MIN_DATE)}
          </p>
        </div>

        {/* End date */}
        <div className="mb-4 mt-3">
          <Label>End date</Label>
          <input
            type="date"
            value={params.end}
            min={params.start}
            max={MAX_DATE}
            onChange={e => onChange({ end: e.target.value })}
            className="w-full border px-3 py-2 font-mono text-[12px] tracking-[0.08em] outline-none"
            style={{ background: C.bg, color: C.text, borderColor: C.dim }}
          />
          <p className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.15em]" style={{ color: C.muted }}>
            Latest: {displayDate(MAX_DATE)}
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

        {/* Strategy — 10 options */}
        <ForgeSelect
          label="Strategy"
          value={params.strategy}
          onChange={v => onChange({ strategy: v as TerminalParams["strategy"] })}
          options={STRATEGIES}
        />

        <Divider />

        {/* SMA / Bollinger params */}
        <ForgeSlider label="Fast SMA"    min={5}   max={50}  step={1}   value={params.fast}   onChange={v => onChange({ fast: v })} />
        <ForgeSlider label="Slow SMA"    min={20}  max={200} step={1}   value={params.slow}   onChange={v => onChange({ slow: v })} />
        <ForgeSlider label="Bollinger k" min={0.5} max={3}   step={0.1} value={params.bb_k}   onChange={v => onChange({ bb_k: v })} />

        {/* Allow short */}
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>
            Allow short
          </span>
          <button
            onClick={() => onChange({ allow_short: !params.allow_short })}
            className="border px-2 py-0.5 font-mono text-[8px] tracking-[0.15em] transition-colors"
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

        <ForgeSlider label="Commission (bps)" min={0} max={20} step={1} value={params.commission} onChange={v => onChange({ commission: v })} />
        <ForgeSlider label="Slippage (bps)"   min={0} max={20} step={1} value={params.slippage}   onChange={v => onChange({ slippage: v })} />

        <Divider />

        <ForgeSelect
          label="Event Type"
          value={params.event_type}
          onChange={v => onChange({ event_type: v })}
          options={[{ value: "FOMC", label: "FOMC" }]}
        />

        {/* Watchlist */}
        <Watchlist
          onSelect={onTickerSelect}
          activeTicker={params.ticker}
        />

      </div>

      {/* Run button */}
      <div className="border-t p-4" style={{ borderColor: C.border }}>
        <button
          onClick={onRun}
          disabled={loading}
          className="w-full border py-2.5 font-mono text-[9px] uppercase tracking-[0.25em] transition-colors disabled:opacity-40"
          style={{
            borderColor: "var(--forge-accent)",
            color:       C.bg,
            background:  loading ? C.dim : "var(--forge-accent)",
            cursor:      loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Running…" : "Run"}
        </button>
      </div>
    </aside>
  )
}
