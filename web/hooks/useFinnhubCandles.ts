"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  tickerToBybitSymbol,
  timeframeToBybitInterval,
  BYBIT_WS_URL,
} from "@/lib/bybit"

export type FinnhubOHLC = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type BybitKlineWsMessage = {
  topic?: string
  type?: string
  ts?: number
  data?: Array<{
    start: number
    end: number
    interval: string
    open: string
    close: string
    high: string
    low: string
    volume: string
    turnover: string
    confirm: boolean
    timestamp: number
  }>
}

/** Map Bybit WS candle data to our OHLC type */
function wsCandleToOHLC(d: {
  start: number
  open: string
  high: string
  low: string
  close: string
  volume: string
}): FinnhubOHLC {
  return {
    time: Math.floor(d.start / 1000),
    open: Number(d.open),
    high: Number(d.high),
    low: Number(d.low),
    close: Number(d.close),
    volume: Number(d.volume),
  }
}

/** Map our timeframe labels to Finnhub-style resolutions for the API route */
function timeframeToResolution(tf: string): string {
  const map: Record<string, string> = {
    "1m": "1",
    "5m": "5",
    "15m": "15",
    "1h": "60",
    "4h": "60", // fetch hourly, close enough
    D: "D",
    W: "W",
    M: "M",
  }
  return map[tf] ?? "5"
}

export function useFinnhubCandles(
  ticker: string,
  timeframe: string,
  enabled: boolean
): {
  data: FinnhubOHLC[]
  loading: boolean
  error: string | null
} {
  const symbol = tickerToBybitSymbol(ticker)
  const interval = timeframeToBybitInterval(timeframe)
  const isSupported = !!symbol

  const [data, setData] = useState<FinnhubOHLC[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mergeCandle = useCallback((candle: FinnhubOHLC) => {
    setData((prev) => {
      const idx = prev.findIndex((c) => c.time === candle.time)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = candle
        return next
      }
      const next = [...prev, candle]
      next.sort((a, b) => a.time - b.time)
      // Keep max 200 candles
      if (next.length > 200) return next.slice(-200)
      return next
    })
  }, [])

  // Fetch initial candle data from our API route (which now calls Bybit)
  useEffect(() => {
    if (!enabled || !ticker || !isSupported) {
      setData([])
      return
    }

    let cancelled = false

    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const resolution = timeframeToResolution(timeframe)
        const count = 120
        const params = new URLSearchParams({
          symbol: ticker,
          resolution,
          count: String(count),
        })
        const res = await fetch(`/api/stocks/candles?${params.toString()}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Failed to fetch candles")
        const json = await res.json()

        if (json && json.s === "ok" && Array.isArray(json.t) && json.t.length > 0) {
          const candles: FinnhubOHLC[] = json.t.map((t: number, i: number) => ({
            time: t,
            open: json.o[i],
            high: json.h[i],
            low: json.l[i],
            close: json.c[i],
            volume: json.v[i],
          }))
          if (!cancelled) {
            setData(candles)
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load candle data")
          setData([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInitial()
    return () => {
      cancelled = true
    }
  }, [ticker, timeframe, enabled, isSupported])

  // Subscribe to Bybit WebSocket for live candle updates
  useEffect(() => {
    if (!enabled || !isSupported || !symbol) return

    const topic = `kline.${interval}.${symbol}`

    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return

      const ws = new WebSocket(BYBIT_WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            op: "subscribe",
            args: [topic],
          })
        )
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as BybitKlineWsMessage
          if (msg.topic === topic && msg.data?.length) {
            const candle = wsCandleToOHLC(msg.data[0])
            mergeCandle(candle)
          }
        } catch {
          // ignore parse errors
        }
      }

      ws.onclose = () => {
        wsRef.current = null
        if (!cancelled) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000)
        }
      }

      ws.onerror = () => {
        // will trigger onclose
      }
    }

    let cancelled = false
    connect()

    return () => {
      cancelled = true
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [symbol, interval, enabled, isSupported, mergeCandle])

  return { data, loading, error }
}
