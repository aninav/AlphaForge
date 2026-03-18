"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useBacktest } from "@/hooks/use-backtest"
import { Sidebar } from "./sidebar"
import { TabHome }      from "./tab-home"
import { TabStrategy }  from "./tab-strategy"
import { TabEvents }    from "./tab-events"
import { TabPortfolio } from "./tab-portfolio"
import { TabTrades }    from "./tab-trades"
import { TabLive }      from "./tab-live"
import { C } from "./design-system"
import type { TerminalParams } from "@/types"

const DEFAULT_PARAMS: TerminalParams = {
  ticker:      "QQQ",
  start:       "1999-03-10",
  end:         "2025-01-01",
  strategy:    "momentum",
  fast:        20,
  slow:        50,
  bb_k:        2.0,
  allow_short: false,
  commission:  5,
  slippage:    2,
  event_type:  "FOMC",
  mode:        "backtest",
}

const TABS = ["Home", "Strategy", "Events", "Portfolio", "Trades"] as const
type Tab = typeof TABS[number]

export function Terminal() {
  const router = useRouter()
  const [params,  setParams]  = useState<TerminalParams>(DEFAULT_PARAMS)
  const [pending, setPending] = useState<TerminalParams>(DEFAULT_PARAMS)
  const [activeTab, setActiveTab] = useState<Tab>("Home")

  // Only fetch when params are committed (Run button)
  const { data, loading, error, refetch } = useBacktest(params)

  const handleChange = useCallback((patch: Partial<TerminalParams>) => {
    setPending(p => ({ ...p, ...patch }))
  }, [])

  const handleRun = useCallback(() => {
    setParams(pending)
  }, [pending])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: C.bg }}>

      {/* ── Top nav bar ───────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-5 h-11 border-b"
        style={{ background: C.surface, borderColor: C.border }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px] font-medium tracking-[0.1em] uppercase"
                style={{ color: C.bright }}>
            AlphaForge
          </span>
          <span
            className="font-mono text-[8px] tracking-[0.2em] uppercase border px-2 py-0.5"
            style={{ color: C.pos, borderColor: C.posDim }}
          >
            Terminal
          </span>
        </div>

        {/* Centre: tab bar */}
        <nav className="flex">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="font-mono text-[9px] tracking-[0.2em] uppercase px-4 py-3 transition-colors border-b"
              style={{
                color:       activeTab === tab ? C.bright : C.muted,
                borderColor: activeTab === tab ? C.bright : "transparent",
                background:  "transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Right: back + mode badge */}
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[8px] tracking-[0.2em] uppercase border px-2 py-0.5"
            style={{ color: C.mid, borderColor: C.dim }}
          >
            {params.mode === "walkforward" ? "Walk-Fwd" : params.mode}
          </span>
          <button
            onClick={() => router.push("/")}
            className="font-mono text-[8px] tracking-[0.15em] uppercase border px-2.5 py-1 transition-colors"
            style={{ color: C.muted, borderColor: C.dim, background: "transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.text }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.muted }}
          >
            ← Landing
          </button>
        </div>
      </header>

      {/* ── Main area: sidebar + content ──────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          params={pending}
          onChange={handleChange}
          onRun={handleRun}
          loading={loading}
        />

        {/* Tab content */}
        <main className="flex-1 flex flex-col overflow-hidden" style={{ background: C.bg }}>
          {params.mode === "live" ? (
            <TabLive params={params} />
          ) : activeTab === "Home" ? (
            <TabHome
              data={data}
              loading={loading}
              error={error}
              ticker={params.ticker}
              strategy={params.strategy}
            />
          ) : activeTab === "Strategy" ? (
            <TabStrategy params={params} backtestData={data} />
          ) : activeTab === "Events" ? (
            <TabEvents params={params} />
          ) : activeTab === "Portfolio" ? (
            <TabPortfolio params={params} />
          ) : (
            <TabTrades data={data} loading={loading} error={error} />
          )}
        </main>
      </div>
    </div>
  )
}
