"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CUSTOM_TOKENS } from "@/lib/custom-tokens"
import type { TickerData } from "./useBybitTickers"

const POLL_INTERVAL = 30_000 // 30 seconds

type PriceResponse = {
  tokenPriceUsd: number
  ethUsd: number
  timestamp: number
}

export function useCustomTokenPrices() {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prevPriceRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/custom-tokens/prices", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch custom token prices")
      const data: PriceResponse = await res.json()

      const price = data.tokenPriceUsd
      const prev = prevPriceRef.current
      const change24h = prev !== null ? price - prev : 0
      const changePct24h = prev !== null && prev > 0 ? ((price - prev) / prev) * 100 : 0
      prevPriceRef.current = price

      const now = Date.now()
      const newMap = new Map<string, TickerData>()

      for (const token of CUSTOM_TOKENS) {
        newMap.set(token.ticker, {
          ticker: token.ticker,
          symbol: `${token.ticker}USDT`,
          price,
          change24h,
          changePct24h,
          high24h: price * 1.05,
          low24h: price * 0.95,
          volume24h: 0,
          turnover24h: 0,
          openInterest: 0,
          fundingRate: 0,
          nextFundingTime: 0,
          lastUpdated: now,
        })
      }

      setTickers(newMap)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrices()
    intervalRef.current = setInterval(fetchPrices, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchPrices])

  return { tickers, loading, error }
}
