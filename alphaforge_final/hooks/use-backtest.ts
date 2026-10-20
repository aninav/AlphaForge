"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import type { BacktestResponse, TerminalParams } from "@/types"

interface State {
  data:    BacktestResponse | null
  loading: boolean
  error:   string | null
}

/**
 * Runs a backtest for `params`.
 * When `enabled` is false the hook stays idle — nothing is fetched until the
 * user explicitly runs one (keeps the first page load clean and avoids firing
 * a heavy request before the user has chosen anything).
 */
export function useBacktest(params: TerminalParams, enabled: boolean = true) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null })

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await api.backtest(params)
      setState({ data, loading: false, error: null })
    } catch (e) {
      setState({ data: null, loading: false, error: (e as Error).message })
    }
  }, [
    params.ticker, params.start, params.end, params.strategy,
    params.fast, params.slow, params.bb_k, params.allow_short,
    params.commission, params.slippage, params.event_type,
  ])

  useEffect(() => {
    if (enabled) fetch()
  }, [fetch, enabled])

  return { ...state, refetch: fetch }
}
