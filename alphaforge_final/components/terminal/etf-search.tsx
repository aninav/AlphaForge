"use client"

import { useState, useRef, useEffect } from "react"
import { C, Label } from "./design-system"

// Popular ETFs with names for autocomplete
const ETF_LIST = [
  { ticker: "SPY",  name: "S&P 500" },
  { ticker: "QQQ",  name: "Nasdaq 100" },
  { ticker: "IWM",  name: "Russell 2000" },
  { ticker: "DIA",  name: "Dow Jones" },
  { ticker: "VOO",  name: "Vanguard S&P 500" },
  { ticker: "VTI",  name: "Vanguard Total Market" },
  { ticker: "VEA",  name: "Vanguard Developed Mkts" },
  { ticker: "VWO",  name: "Vanguard Emerging Mkts" },
  { ticker: "EFA",  name: "iShares MSCI EAFE" },
  { ticker: "EEM",  name: "iShares MSCI Emerging" },
  { ticker: "AGG",  name: "Core US Bond" },
  { ticker: "TLT",  name: "20+ Year Treasury" },
  { ticker: "IEF",  name: "7-10 Year Treasury" },
  { ticker: "SHY",  name: "1-3 Year Treasury" },
  { ticker: "LQD",  name: "Investment Grade Corp Bond" },
  { ticker: "HYG",  name: "High Yield Corp Bond" },
  { ticker: "GLD",  name: "Gold" },
  { ticker: "SLV",  name: "Silver" },
  { ticker: "USO",  name: "Oil" },
  { ticker: "UNG",  name: "Natural Gas" },
  { ticker: "XLK",  name: "Technology Sector" },
  { ticker: "XLF",  name: "Financials Sector" },
  { ticker: "XLE",  name: "Energy Sector" },
  { ticker: "XLV",  name: "Health Care Sector" },
  { ticker: "XLI",  name: "Industrials Sector" },
  { ticker: "XLC",  name: "Communication Services" },
  { ticker: "XLY",  name: "Consumer Discretionary" },
  { ticker: "XLP",  name: "Consumer Staples" },
  { ticker: "XLB",  name: "Materials Sector" },
  { ticker: "XLRE", name: "Real Estate Sector" },
  { ticker: "XLU",  name: "Utilities Sector" },
  { ticker: "VNQ",  name: "Vanguard Real Estate" },
  { ticker: "ARKK", name: "ARK Innovation" },
  { ticker: "ARKG", name: "ARK Genomic Revolution" },
  { ticker: "ARKW", name: "ARK Next Gen Internet" },
  { ticker: "TQQQ", name: "3x Nasdaq 100 Bull" },
  { ticker: "SQQQ", name: "3x Nasdaq 100 Bear" },
  { ticker: "SPXL", name: "3x S&P 500 Bull" },
  { ticker: "SPXS", name: "3x S&P 500 Bear" },
  { ticker: "UVXY", name: "1.5x VIX Short-Term" },
  { ticker: "VXX",  name: "iPath VIX Short-Term" },
  { ticker: "VIXY", name: "ProShares VIX Short-Term" },
  { ticker: "IBIT", name: "iShares Bitcoin" },
  { ticker: "FBTC", name: "Fidelity Bitcoin" },
  { ticker: "BITO", name: "ProShares Bitcoin Strategy" },
  { ticker: "SOXX", name: "Semiconductors" },
  { ticker: "SMH",  name: "VanEck Semiconductors" },
  { ticker: "CIBR", name: "Cybersecurity" },
  { ticker: "HACK", name: "Cybersecurity ETF" },
  { ticker: "BOTZ", name: "Robotics & AI" },
  { ticker: "ROBO", name: "Robotics & Automation" },
  { ticker: "FINX", name: "FinTech" },
  { ticker: "SKYY", name: "Cloud Computing" },
  { ticker: "CLOU", name: "Global Cloud Computing" },
  { ticker: "DRIV", name: "Autonomous & EV" },
  { ticker: "KARS", name: "Electric Vehicles" },
  { ticker: "ICLN", name: "Clean Energy" },
  { ticker: "QCLN", name: "Clean Edge Clean Energy" },
  { ticker: "MCHI", name: "iShares MSCI China" },
  { ticker: "FXI",  name: "China Large-Cap" },
  { ticker: "EWJ",  name: "iShares MSCI Japan" },
  { ticker: "EWZ",  name: "iShares MSCI Brazil" },
  { ticker: "EWY",  name: "iShares MSCI South Korea" },
  { ticker: "EWG",  name: "iShares MSCI Germany" },
  { ticker: "RSP",  name: "S&P 500 Equal Weight" },
  { ticker: "MTUM", name: "iShares MSCI Momentum" },
  { ticker: "QUAL", name: "iShares MSCI Quality" },
  { ticker: "VLUE", name: "iShares MSCI Value" },
  { ticker: "USMV", name: "iShares Min Volatility" },
  { ticker: "FDVV", name: "Fidelity High Dividend" },
  { ticker: "DVY",  name: "iShares Select Dividend" },
  { ticker: "NOBL", name: "S&P 500 Dividend Aristocrats" },
  { ticker: "JEPI", name: "JPMorgan Equity Premium" },
  { ticker: "JEPQ", name: "JPMorgan Nasdaq Equity Premium" },
  { ticker: "XYLD", name: "S&P 500 Covered Call" },
  { ticker: "QYLD", name: "Nasdaq Covered Call" },
  { ticker: "SCHD", name: "Schwab US Dividend Equity" },
  { ticker: "VIG",  name: "Vanguard Dividend Appreciation" },
]

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
