"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { C, Label } from "./design-system"
import { ETF_LIST } from "./etf-list"

interface WatchlistProps {
  onSelect: (ticker: string) => void
  activeTicker: string
}

export function Watchlist({ onSelect, activeTicker }: WatchlistProps) {
  const { user }   = useAuth()
  const supabase   = createClient()
  const [tickers,  setTickers]  = useState<string[]>([])
  const [input,    setInput]    = useState("")
  const [open,     setOpen]     = useState(false)
  const [results,  setResults]  = useState<typeof ETF_LIST>([])

  const load = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from("watchlist")
      .select("ticker")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
    setTickers((data ?? []).map((r: { ticker: string }) => r.ticker))
  }, [user])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (input.length === 0) { setResults([]); setOpen(false); return }
    const q = input.toUpperCase()
    setResults(
      ETF_LIST.filter(e =>
        e.ticker.startsWith(q) || e.name.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 6)
    )
    setOpen(true)
  }, [input])

  async function add(ticker: string) {
    if (!user || tickers.includes(ticker)) return
    await supabase.from("watchlist").insert({ user_id: user.id, ticker })
    setTickers(t => [...t, ticker])
    setInput(""); setOpen(false)
  }

  async function remove(ticker: string) {
    if (!user) return
    await supabase.from("watchlist").delete().eq("user_id", user.id).eq("ticker", ticker)
    setTickers(t => t.filter(x => x !== ticker))
  }

  if (!user) return null

  return (
    <div className="border-t pt-4 mt-2" style={{ borderColor: C.border }}>
      <Label className="mb-2">Watchlist</Label>

      {/* Ticker list */}
      <div className="flex flex-col gap-0.5 mb-2">
        {tickers.length === 0 && (
          <p className="font-mono text-[8px] uppercase tracking-[0.15em] py-1" style={{ color: C.muted }}>
            No tickers saved
          </p>
        )}
        {tickers.map(t => (
          <div
            key={t}
            className="flex items-center justify-between px-1.5 py-1 cursor-pointer transition-colors"
            style={{ background: t === activeTicker ? C.panel : "transparent" }}
            onClick={() => onSelect(t)}
          >
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: t === activeTicker ? C.bright : C.text }}
            >
              {t}
            </span>
            <button
              onClick={e => { e.stopPropagation(); remove(t) }}
              className="font-mono text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: C.subtle }}
              onMouseEnter={e => (e.currentTarget.style.color = C.neg)}
              onMouseLeave={e => (e.currentTarget.style.color = C.subtle)}
              aria-label={`Remove ${t}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          placeholder="Add ticker…"
          autoComplete="off"
          spellCheck={false}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => {
            if (e.key === "Enter" && input.length > 0) { add(results[0]?.ticker ?? input); }
            if (e.key === "Escape") { setInput(""); setOpen(false) }
          }}
          className="w-full font-mono text-[9px] uppercase tracking-widest border px-2 py-1 outline-none"
          style={{ background: C.bg, color: C.text, borderColor: C.dim }}
        />
        {open && results.length > 0 && (
          <div
            className="absolute left-0 right-0 bottom-full mb-0.5 border z-50 overflow-y-auto"
            style={{ background: C.panel, borderColor: C.border, maxHeight: "160px" }}
          >
            {results.map(etf => (
              <button
                key={etf.ticker}
                onMouseDown={() => add(etf.ticker)}
                className="w-full flex items-center justify-between px-2 py-1.5 transition-colors"
                style={{ background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surface)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: C.text }}>
                  {etf.ticker}
                </span>
                <span className="font-mono text-[8px] truncate ml-2 max-w-[90px] text-right" style={{ color: C.subtle }}>
                  {etf.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
