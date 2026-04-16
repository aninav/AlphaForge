"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useBacktest } from "@/hooks/use-backtest"
import { Theme } from "@/components/ui/theme"
import { useAuth } from "@/components/auth-provider"
import { getTodayIsoDate } from "@/lib/date"
import { C } from "./design-system"
import { Sidebar } from "./sidebar"
import { TabEvents } from "./tab-events"
import { TabHome } from "./tab-home"
import { TabLive } from "./tab-live"
import { TabPortfolio } from "./tab-portfolio"
import { TabStrategy } from "./tab-strategy"
import { TabTrades } from "./tab-trades"
import type { TerminalParams } from "@/types"

const DEFAULT_PARAMS: TerminalParams = {
  ticker: "QQQ",
  start: "1999-03-10",
  end: getTodayIsoDate(),
  strategy: "momentum",
  fast: 20,
  slow: 50,
  bb_k: 2.0,
  allow_short: false,
  commission: 5,
  slippage: 2,
  event_type: "FOMC",
  mode: "backtest",
}

const TABS = ["Home", "Strategy", "Events", "Portfolio", "Trades"] as const
type Tab = typeof TABS[number]

export function Terminal() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [params, setParams] = useState<TerminalParams>(DEFAULT_PARAMS)
  const [pending, setPending] = useState<TerminalParams>(DEFAULT_PARAMS)
  const [activeTab, setActiveTab] = useState<Tab>("Home")

  const { data, loading, error } = useBacktest(params)

  const handleChange = useCallback((patch: Partial<TerminalParams>) => {
    setPending((p) => ({ ...p, ...patch }))
  }, [])

  const handleRun = useCallback(() => {
    setParams(pending)
  }, [pending])

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: C.bg }}>
      <header
        className="flex h-12 flex-shrink-0 items-center justify-between border-b px-5"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px] font-medium uppercase tracking-[0.1em]" style={{ color: C.bright }}>
            AlphaForge
          </span>
          <span className="border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: C.pos, borderColor: C.posDim }}>
            Terminal
          </span>
        </div>

        <nav className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="border-b px-4 py-3 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors"
              style={{
                color: activeTab === tab ? C.bright : C.muted,
                borderColor: activeTab === tab ? "var(--forge-accent)" : "transparent",
                background: "transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Theme variant="button" size="sm" />

          <span className="border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: C.text, borderColor: C.dim }}>
            {params.mode === "walkforward" ? "Walk-Fwd" : params.mode}
          </span>

          {user && (
            <button
              onClick={signOut}
              className="border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.15em] transition-colors"
              style={{ color: C.body, borderColor: C.dim, background: "transparent" }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.color = C.text
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.color = C.body
              }}
            >
              Log out
            </button>
          )}

          <button
            onClick={() => router.push("/")}
            className="border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.15em] transition-colors"
            style={{ color: C.body, borderColor: C.dim, background: "transparent" }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = C.text
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = C.body
            }}
          >
            ← Landing
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar params={pending} onChange={handleChange} onRun={handleRun} loading={loading} />

        <main className="flex flex-1 flex-col overflow-hidden" style={{ background: C.bg }}>
          {params.mode === "live" ? (
            <TabLive params={params} />
          ) : activeTab === "Home" ? (
            <TabHome data={data} loading={loading} error={error} ticker={params.ticker} strategy={params.strategy} />
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
