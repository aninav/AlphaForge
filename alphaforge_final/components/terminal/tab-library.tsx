"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { C, Panel, Label, Skeleton, ErrorState, fmt, fmtPct } from "./design-system"

interface SavedBacktest {
  id: string
  created_at: string
  ticker: string
  strategy: string
  start: string
  end: string
  params: Record<string, unknown>
  metrics: Record<string, number | null>
  label?: string
}

const DAILY_LIMIT = 2

function todayKey() {
  return new Date().toISOString().split("T")[0]
}

function MetricPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 border" style={{ borderColor: C.border, background: C.panel }}>
      <span className="font-mono text-[7px] uppercase tracking-[0.2em] mb-1" style={{ color: C.muted }}>{label}</span>
      <span className="font-mono text-[11px] font-medium" style={{ color: color ?? C.text }}>{value}</span>
    </div>
  )
}

interface Props {
  /** Passed down from Terminal so the save button can appear in the header */
  pendingResult: {
    ticker: string
    strategy: string
    start: string
    end: string
    params: Record<string, unknown>
    metrics: Record<string, number | null>
  } | null
}

export function TabLibrary({ pendingResult }: Props) {
  const { user } = useAuth()
  const supabase  = createClient()

  const [runs,      setRuns]      = useState<SavedBacktest[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [saveMsg,   setSaveMsg]   = useState<string | null>(null)
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [editId,    setEditId]    = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from("saved_backtests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
    if (error) { setError(error.message); setLoading(false); return }
    setRuns(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    if (!user || !pendingResult) return
    setSaving(true); setSaveMsg(null)

    // Check daily limit
    const today = todayKey()
    const todayRuns = runs.filter(r => r.created_at.startsWith(today))
    if (todayRuns.length >= DAILY_LIMIT) {
      setSaveMsg(`Daily limit reached (${DAILY_LIMIT} saves/day). Come back tomorrow.`)
      setSaving(false)
      return
    }

    const { error } = await supabase.from("saved_backtests").insert({
      user_id:  user.id,
      ticker:   pendingResult.ticker,
      strategy: pendingResult.strategy,
      start:    pendingResult.start,
      end:      pendingResult.end,
      params:   pendingResult.params,
      metrics:  pendingResult.metrics,
    })

    if (error) { setSaveMsg(`Error: ${error.message}`); setSaving(false); return }
    setSaveMsg("Saved!")
    setTimeout(() => setSaveMsg(null), 3000)
    setSaving(false)
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from("saved_backtests").delete().eq("id", id)
    setRuns(r => r.filter(x => x.id !== id))
  }

  async function handleRename(id: string) {
    await supabase.from("saved_backtests").update({ label: editLabel }).eq("id", id)
    setRuns(r => r.map(x => x.id === id ? { ...x, label: editLabel } : x))
    setEditId(null)
  }

  const todayCount = runs.filter(r => r.created_at.startsWith(todayKey())).length
  const canSave    = !!pendingResult && todayCount < DAILY_LIMIT

  return (
    <div className="flex-1 overflow-y-auto p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[13px] uppercase tracking-[0.08em]" style={{ color: C.bright }}>
            Backtest Library
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: C.subtle }}>
            {todayCount}/{DAILY_LIMIT} saves used today
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className="font-mono text-[9px] uppercase tracking-[0.15em]"
                  style={{ color: saveMsg.startsWith("Error") ? C.neg : C.pos }}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="font-mono text-[9px] uppercase tracking-[0.2em] border px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: canSave ? C.text : C.dim,
              color:       canSave ? C.bg   : C.subtle,
              background:  canSave ? C.text : "transparent",
            }}
          >
            {saving ? "Saving…" : pendingResult ? "Save current run" : "Run a backtest first"}
          </button>
        </div>
      </div>

      {!user && (
        <Panel>
          <p className="font-mono text-[10px] text-center py-6" style={{ color: C.subtle }}>
            Sign in to save and view your backtest library.
          </p>
        </Panel>
      )}

      {user && error && <ErrorState message={error} />}

      {user && loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      )}

      {user && !loading && runs.length === 0 && (
        <div className="text-center py-20">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>
            No saved runs yet — run a backtest and hit Save
          </p>
        </div>
      )}

      {user && !loading && runs.length > 0 && (
        <div className="space-y-3">
          {runs.map(run => {
            const isOpen = expanded === run.id
            const cagr   = run.metrics?.CAGR
            const sharpe = run.metrics?.Sharpe
            const dd     = run.metrics?.["Max Drawdown"]
            const ret    = run.metrics?.["Total Return"]
            const date   = new Date(run.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

            return (
              <div key={run.id} className="border" style={{ borderColor: C.border, background: C.surface }}>

                {/* Row header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  style={{ borderBottom: isOpen ? `1px solid ${C.border}` : "none" }}
                  onClick={() => setExpanded(isOpen ? null : run.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: C.bright }}>
                      {run.ticker}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: C.subtle }}>
                      {run.strategy.replace(/_/g, " ")}
                    </span>
                    {run.label && (
                      <span className="font-mono text-[8px] border px-1.5 py-0.5 uppercase tracking-wider"
                            style={{ color: C.accent, borderColor: C.dim }}>
                        {run.label}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[8px] uppercase tracking-[0.15em]" style={{ color: C.muted }}>
                      {date}
                    </span>
                    <span className="font-mono text-[9px]"
                          style={{ color: (cagr ?? 0) >= 0 ? C.pos : C.neg }}>
                      CAGR {fmtPct(cagr)}
                    </span>
                    <span className="font-mono text-[8px]" style={{ color: C.subtle }}>
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-4 py-4">

                    {/* Metrics row */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      <MetricPill label="CAGR"        value={fmtPct(cagr)}   color={(cagr ?? 0) >= 0 ? C.pos : C.neg} />
                      <MetricPill label="Sharpe"      value={fmt(sharpe)}    color={(sharpe ?? 0) >= 1 ? C.pos : C.text} />
                      <MetricPill label="Max DD"      value={fmtPct(dd)}     color={C.neg} />
                      <MetricPill label="Total Ret"   value={fmtPct(ret)}    color={(ret ?? 0) >= 0 ? C.pos : C.neg} />
                      <MetricPill label="Win Rate"    value={fmtPct(run.metrics?.["Win Rate"])} />
                    </div>

                    {/* Params */}
                    <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1">
                      {[
                        ["Period", `${run.start} → ${run.end}`],
                        ["Fast", String((run.params as Record<string,unknown>).fast ?? "—")],
                        ["Slow", String((run.params as Record<string,unknown>).slow ?? "—")],
                        ["Commission", `${(run.params as Record<string,unknown>).commission ?? "—"}bps`],
                        ["Slippage",   `${(run.params as Record<string,unknown>).slippage ?? "—"}bps`],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center gap-1.5">
                          <span className="font-mono text-[8px] uppercase tracking-[0.15em]" style={{ color: C.muted }}>{k}</span>
                          <span className="font-mono text-[9px]" style={{ color: C.body }}>{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Label + actions */}
                    <div className="flex items-center gap-3">
                      {editId === run.id ? (
                        <>
                          <input
                            autoFocus
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleRename(run.id); if (e.key === "Escape") setEditId(null) }}
                            placeholder="Label this run…"
                            className="font-mono text-[9px] border px-2 py-1 outline-none w-40"
                            style={{ background: C.bg, color: C.text, borderColor: C.dim }}
                          />
                          <button onClick={() => handleRename(run.id)}
                            className="font-mono text-[8px] uppercase tracking-[0.15em]" style={{ color: C.pos }}>
                            Save
                          </button>
                          <button onClick={() => setEditId(null)}
                            className="font-mono text-[8px] uppercase tracking-[0.15em]" style={{ color: C.subtle }}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setEditId(run.id); setEditLabel(run.label ?? "") }}
                          className="font-mono text-[8px] uppercase tracking-[0.15em] transition-colors"
                          style={{ color: C.subtle }}
                          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                          onMouseLeave={e => (e.currentTarget.style.color = C.subtle)}
                        >
                          {run.label ? "Rename" : "+ Add label"}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(run.id)}
                        className="font-mono text-[8px] uppercase tracking-[0.15em] transition-colors ml-auto"
                        style={{ color: C.subtle }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.neg)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.subtle)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
