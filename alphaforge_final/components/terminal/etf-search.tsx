"use client"

import { useState, useRef, useEffect } from "react"
import { C, Label } from "./design-system"
import { ETF_LIST } from "./etf-list"


interface ETFSearchProps {
  value: string
  onChange: (ticker: string) => void
}

export function ETFSearch({ value, onChange }: ETFSearchProps) {
  const [query, setQuery]       = useState(value)
  const [open, setOpen]         = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef  = useRef<HTMLInputElement>(null)
  const listRef   = useRef<HTMLDivElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)

  // Sync if parent changes value externally
  useEffect(() => { setQuery(value) }, [value])

  const results = query.length === 0 ? [] : ETF_LIST.filter(e =>
    e.ticker.startsWith(query.toUpperCase()) ||
    e.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  function commit(ticker: string) {
    setQuery(ticker)
    onChange(ticker)
    setOpen(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return
    if (e.key === "ArrowDown")  { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)) }
    if (e.key === "ArrowUp")    { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === "Enter")      { e.preventDefault(); commit(results[highlighted].ticker) }
    if (e.key === "Escape")     { setOpen(false) }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [highlighted])

  return (
    <div ref={wrapRef} className="mb-4 relative">
      <Label>Ticker / ETF</Label>
      <input
        ref={inputRef}
        type="text"
        value={query}
        autoComplete="off"
        spellCheck={false}
        placeholder="QQQ, SPY…"
        onChange={e => {
          const v = e.target.value.toUpperCase()
          setQuery(v)
          setOpen(v.length > 0)
          setHighlighted(0)
          // If user clears or types a valid raw ticker, pass it up immediately
          onChange(v)
        }}
        onFocus={() => { if (query.length > 0) setOpen(true) }}
        onKeyDown={handleKey}
        className="w-full font-mono text-[11px] border px-2 py-1.5 uppercase tracking-widest outline-none transition-colors duration-150"
        style={{ background: C.bg, color: C.text, borderColor: C.dim }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = C.subtle)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = open ? C.text : C.dim)}
      />

      {open && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 border overflow-y-auto"
          style={{ background: C.panel, borderColor: C.border, maxHeight: "200px" }}
        >
          {results.map((etf, i) => (
            <button
              key={etf.ticker}
              onMouseDown={() => commit(etf.ticker)}
              onMouseEnter={() => setHighlighted(i)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-left transition-colors"
              style={{
                background: i === highlighted ? C.surface : "transparent",
              }}
            >
              <span className="font-mono text-[10px] tracking-widest uppercase"
                    style={{ color: i === highlighted ? C.bright : C.text }}>
                {etf.ticker}
              </span>
              <span className="font-mono text-[9px] truncate ml-2 max-w-[110px] text-right"
                    style={{ color: C.subtle }}>
                {etf.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
