"use client"

// ── Pure mono design tokens ──────────────────────────────────────────────────
// All components import from here — single source of truth.

export const C = {
  bg:      "#0b0b0b",
  surface: "#0f0f0d",
  panel:   "#111110",
  border:  "#1a1a18",
  dim:     "#222220",
  muted:   "#333330",
  subtle:  "#4a4845",
  mid:     "#6b6963",
  text:    "#c8c5bc",
  bright:  "#e8e6e0",
  pos:     "#3d7a4a",
  neg:     "#7a3d3d",
  warn:    "#7a6a3d",
  posDim:  "#1e3320",
  negDim:  "#331e1e",
  warnDim: "#332d1e",
} as const

export const REGIME_COLOR: Record<string, string> = {
  Trending: C.pos,
  Choppy:   C.warn,
  HighVol:  C.neg,
}

export const REGIME_DIM: Record<string, string> = {
  Trending: C.posDim,
  Choppy:   C.warnDim,
  HighVol:  C.negDim,
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function fmt(val: number | null | undefined, suffix = "", decimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) return "—"
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

// ── Base UI primitives ────────────────────────────────────────────────────────

import React from "react"
import { cn } from "@/lib/utils"

// Panel card
export function Panel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("border p-4", className)}
      style={{ background: C.surface, borderColor: C.border }}
    >
      {children}
    </div>
  )
}

// Section label
export function Label({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn("font-mono text-[9px] tracking-[0.25em] uppercase mb-3", className)}
      style={{ color: C.muted }}
    >
      {children}
    </p>
  )
}

// Metric card
export function MetricCard({
  label,
  value,
  color,
  sub,
}: {
  label: string
  value: string
  color?: string
  sub?: string
}) {
  return (
    <div
      className="p-3 border"
      style={{ background: C.surface, borderColor: C.border }}
    >
      <p className="font-mono text-[8px] tracking-[0.22em] uppercase mb-2"
         style={{ color: C.muted }}>
        {label}
      </p>
      <p className="font-mono text-xl font-medium tracking-tight"
         style={{ color: color ?? C.text }}>
        {value}
      </p>
      {sub && (
        <p className="font-mono text-[9px] mt-1" style={{ color: C.subtle }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// Regime badge
export function RegimeBadge({ regime }: { regime: string }) {
  return (
    <span
      className="font-mono text-[8px] tracking-[0.2em] uppercase border px-2 py-0.5"
      style={{
        color:       REGIME_COLOR[regime] ?? C.mid,
        borderColor: REGIME_DIM[regime]   ?? C.border,
      }}
    >
      {regime}
    </span>
  )
}

// Loading skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse", className)}
      style={{ background: C.dim }}
    />
  )
}

// Error state
export function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="p-4 border font-mono text-[11px]"
      style={{ borderColor: C.neg, color: C.neg, background: C.negDim }}
    >
      {message}
    </div>
  )
}

// Divider
export function Divider() {
  return <div className="w-full h-px my-4" style={{ background: C.border }} />
}

// Inline button
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
        "font-mono text-[9px] tracking-[0.2em] uppercase border px-3 py-1.5",
        "transition-colors duration-150",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      )}
      style={{
        color:       C.mid,
        borderColor: C.dim,
        background:  "transparent",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.color = C.text }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.mid }}
    >
      {children}
    </button>
  )
}

// Slider
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
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase"
              style={{ color: C.muted }}>
          {label}
        </span>
        <span className="font-mono text-[10px]" style={{ color: C.text }}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-px appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${C.text} 0%, ${C.text} ${((value - min) / (max - min)) * 100}%, ${C.dim} ${((value - min) / (max - min)) * 100}%, ${C.dim} 100%)`,
          accentColor: C.text,
        }}
      />
    </div>
  )
}

// Select
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
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-1.5"
         style={{ color: C.muted }}>
        {label}
      </p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full font-mono text-[10px] border px-2 py-1.5 appearance-none cursor-pointer"
        style={{
          background:  C.surface,
          color:       C.text,
          borderColor: C.dim,
          outline:     "none",
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: C.surface }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
