"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date"

export const C = {
  bg: "var(--forge-bg)",
  surface: "var(--forge-surface)",
  panel: "var(--forge-panel)",
  border: "var(--forge-border)",
  dim: "var(--forge-dim)",
  muted: "var(--forge-muted)",
  subtle: "var(--forge-subtle)",
  accent: "var(--forge-accent)",
  label: "var(--forge-label)",
  body: "var(--forge-body)",
  mid: "var(--forge-subtle)",
  text: "var(--forge-text)",
  bright: "var(--forge-bright)",
  pos: "var(--forge-pos)",
  neg: "var(--forge-neg)",
  warn: "var(--forge-warn)",
  posDim: "var(--forge-pos-dim)",
  negDim: "var(--forge-neg-dim)",
  warnDim: "var(--forge-warn-dim)",
} as const

export const REGIME_COLOR: Record<string, string> = {
  Trending: C.pos,
  Choppy: C.warn,
  HighVol: C.neg,
}

export const REGIME_DIM: Record<string, string> = {
  Trending: C.posDim,
  Choppy: C.warnDim,
  HighVol: C.negDim,
}

export function fmt(val: number | null | undefined, suffix = "", decimals = 2): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "-"
  return `${val.toFixed(decimals)}${suffix}`
}

export function fmtPct(val: number | null | undefined, decimals = 2): string {
  return fmt(val, "%", decimals)
}

export function signalLabel(s: number): string {
  return s === 1 ? "LONG" : s === -1 ? "SHORT" : "FLAT"
}

export function signalColor(s: number): string {
  return s === 1 ? C.pos : s === -1 ? C.neg : C.mid
}

export function displayDate(value: string) {
  return formatDateLabel(value)
}

export function displayDateTime(value: string) {
  return formatDateTimeLabel(value)
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border p-4", className)} style={{ background: C.surface, borderColor: C.border }}>
      {children}
    </div>
  )
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mb-3 font-mono text-[9px] uppercase tracking-[0.25em]", className)} style={{ color: C.muted }}>
      {children}
    </p>
  )
}

export function MetricCard({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="border p-3" style={{ background: C.surface, borderColor: C.border }}>
      <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.22em]" style={{ color: C.muted }}>{label}</p>
      <p className="font-mono text-xl font-medium tracking-tight" style={{ color: color ?? C.text }}>{value}</p>
      {sub && <p className="mt-1 font-mono text-[9px]" style={{ color: C.subtle }}>{sub}</p>}
    </div>
  )
}

export function RegimeBadge({ regime }: { regime: string }) {
  return (
    <span
      className="border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em]"
      style={{ color: REGIME_COLOR[regime] ?? C.mid, borderColor: REGIME_DIM[regime] ?? C.border }}
    >
      {regime}
    </span>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse", className)} style={{ background: C.dim }} />
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="border p-4 font-mono text-[11px]" style={{ borderColor: C.neg, color: C.neg, background: C.negDim }}>
      {message}
    </div>
  )
}

export function Divider() {
  return <div className="my-4 h-px w-full" style={{ background: C.border }} />
}

export function GhostButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      style={{ color: C.mid, borderColor: C.dim, background: "transparent" }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.color = C.text
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.color = C.mid
      }}
    >
      {children}
    </button>
  )
}

export function ForgeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  suffix = "",
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  suffix?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>{label}</span>
        <span className="font-mono text-[10px]" style={{ color: C.text }}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-px w-full cursor-pointer appearance-none"
        style={{
          background: `linear-gradient(to right, var(--forge-accent) 0%, var(--forge-accent) ${pct}%, var(--forge-dim) ${pct}%, var(--forge-dim) 100%)`,
          accentColor: "var(--forge-accent)",
        }}
      />
    </div>
  )
}

export function ForgeSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none border px-2 py-2 font-mono text-[11px]"
        style={{ background: C.surface, color: C.text, borderColor: C.dim, outline: "none" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: C.surface }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
