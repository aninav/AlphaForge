"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts"
import { C } from "./design-system"
import type { ChartPoint } from "@/types"

// ── shared tooltip style ──────────────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: {
    background:  C.surface,
    border:      `1px solid ${C.border}`,
    borderRadius: 0,
    fontFamily:  "var(--font-dm-mono), monospace",
    fontSize:    10,
    color:       C.text,
    padding:     "8px 12px",
  },
  labelStyle:   { color: C.mid, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" as const },
  itemStyle:    { color: C.text, fontSize: 10 },
  cursor:       { stroke: C.dim, strokeWidth: 1, strokeDasharray: "3 3" },
}

const axisProps = {
  tick:     { fill: C.muted, fontSize: 9, fontFamily: "var(--font-dm-mono), monospace" },
  tickLine: false,
  axisLine: { stroke: C.border },
}

// ── Equity curve ──────────────────────────────────────────────────────────────

export function EquityChart({ data }: { data: ChartPoint[] }) {
  // Build buy-and-hold baseline
  const firstClose = data.find(d => d.Close)?.Close ?? 1
  const chartData  = data.map(d => ({
    ...d,
    BH: d.Close ? (d.Close / firstClose) * 100_000 : null,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis dataKey="Date" {...axisProps} interval="preserveStartEnd" tickCount={6} />
        <YAxis
          {...axisProps}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          width={46}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number, name: string) => [
            `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            name,
          ]}
        />
        <Line
          type="monotone"
          dataKey="BH"
          stroke={C.muted}
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          name="Buy & Hold"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Equity"
          stroke={C.text}
          strokeWidth={1.5}
          dot={false}
          name="Strategy"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Drawdown chart ────────────────────────────────────────────────────────────

export function DrawdownChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis dataKey="Date" {...axisProps} interval="preserveStartEnd" tickCount={6} />
        <YAxis
          {...axisProps}
          tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          width={36}
          domain={["auto", 0]}
        />
        <ReferenceLine y={0} stroke={C.border} strokeWidth={1} />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number) => [`${(v * 100).toFixed(2)}%`, "Drawdown"]}
        />
        <Area
          type="monotone"
          dataKey="Drawdown"
          stroke={C.neg}
          strokeWidth={1}
          fill={C.negDim}
          fillOpacity={0.6}
          dot={false}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Regime distribution bar chart ─────────────────────────────────────────────

const REGIME_COLORS: Record<string, string> = {
  Trending: C.pos,
  Choppy:   C.warn,
  HighVol:  C.neg,
}

export function RegimeChart({ distribution }: { distribution: Record<string, number> }) {
  const data = Object.entries(distribution).map(([regime, pct]) => ({ regime, pct }))

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="regime"
          tick={{ fill: C.muted, fontSize: 9, fontFamily: "var(--font-dm-mono), monospace" }}
          tickLine={false}
          axisLine={{ stroke: C.border }}
        />
        <YAxis
          {...axisProps}
          tickFormatter={v => `${v.toFixed(0)}%`}
          width={32}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number) => [`${v.toFixed(1)}%`, "Share"]}
        />
        <Bar dataKey="pct" radius={0}>
          {data.map(entry => (
            <Cell key={entry.regime} fill={REGIME_COLORS[entry.regime] ?? C.muted} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Signal chart (price + signal bars) ────────────────────────────────────────

export function SignalChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis dataKey="Date" {...axisProps} interval="preserveStartEnd" tickCount={6} />
        <YAxis {...axisProps} width={46} />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number, name: string) => [v.toFixed(2), name]}
        />
        <Line
          type="monotone"
          dataKey="Close"
          stroke={C.text}
          strokeWidth={1.5}
          dot={false}
          name="Close"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Return distribution histogram ─────────────────────────────────────────────

function buildHistogram(values: number[], bins = 30): { bin: string; count: number }[] {
  if (!values.length) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const binSize = (max - min) / bins
  const buckets = Array.from({ length: bins }, (_, i) => ({
    bin: ((min + i * binSize) * 100).toFixed(1),
    count: 0,
  }))
  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / binSize), bins - 1)
    buckets[idx].count++
  }
  return buckets
}

export function ReturnDistChart({
  evReturns,
  nonEvReturns,
  evLabel = "Event",
}: {
  evReturns: number[]
  nonEvReturns: number[]
  evLabel?: string
}) {
  const evData  = buildHistogram(evReturns)
  const nonData = buildHistogram(nonEvReturns)

  // Merge on bin key
  const merged = evData.map((d, i) => ({
    bin:    d.bin,
    [evLabel]: d.count,
    "Non-Event": nonData[i]?.count ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={merged} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="bin"
          {...axisProps}
          tickCount={6}
          tickFormatter={v => `${v}%`}
        />
        <YAxis {...axisProps} width={28} />
        <Tooltip {...tooltipStyle} />
        <Legend
          wrapperStyle={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 9,
                          color: C.muted, letterSpacing: "0.15em", textTransform: "uppercase" }}
        />
        <Bar dataKey={evLabel}    fill={C.warn} opacity={0.75} radius={0} />
        <Bar dataKey="Non-Event"  fill={C.mid}  opacity={0.55} radius={0} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Rotation equity chart ─────────────────────────────────────────────────────

const ROTATION_COLORS = [C.text, C.pos, C.warn, C.mid, C.subtle]

export function RotationChart({
  data,
  tickers,
}: {
  data: Record<string, number | string | null>[]
  tickers: string[]
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" tickCount={6} />
        <YAxis
          {...axisProps}
          tickFormatter={v => `$${(Number(v) / 1000).toFixed(0)}k`}
          width={46}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number) => [
            `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          ]}
        />
        <Legend
          wrapperStyle={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 9,
                          color: C.muted, letterSpacing: "0.15em" }}
        />
        <Line
          type="monotone"
          dataKey="rotation"
          stroke={C.text}
          strokeWidth={1.5}
          dot={false}
          name="Rotation"
          connectNulls
        />
        {tickers.map((t, i) => (
          <Line
            key={t}
            type="monotone"
            dataKey={t}
            stroke={ROTATION_COLORS[(i + 1) % ROTATION_COLORS.length]}
            strokeWidth={0.8}
            strokeDasharray="3 3"
            dot={false}
            name={t}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
