"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  fetchBybitKlines,
  tickerToBybitSymbol,
  timeframeToBybitInterval,
  BYBIT_WS_URL,
  type OHLCData,
} from "@/lib/bybit"
import { isCustomToken } from "@/lib/custom-tokens"

/** Log stream data to console (enable in dev) */
const LOG_STREAM = false

function logStream(label: string, data: unknown) {
  if (typeof window !== "undefined" && LOG_STREAM) {
    // eslint-disable-next-line no-console
    console.log(`[Bybit WS] ${label}`, data)
  }
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

function wsCandleToOHLC(d: {
  start: number
  open: string
  high: string
  low: string
  close: string
  volume: string
}): OHLCData {
  return {
    time: Math.floor(d.start / 1000),
    open: Number(d.open),
    high: Number(d.high),
    low: Number(d.low),
    close: Number(d.close),
    volume: Number(d.volume),
  }
}

function generateCustomTokenCandles(basePrice: number, count: number = 200): OHLCData[] {
  const data: OHLCData[] = []
  let price = basePrice
  const now = Date.now()

  for (let i = count - 1; i >= 0; i--) {
    const time = Math.floor((now - i * 15 * 60 * 1000) / 1000)
    const volatility = basePrice * 0.02
    const change = (Math.sin(i * 0.5) * 0.5 + Math.cos(i * 0.3) * 0.3) * volatility
    const open = price
    price = price + change
    const close = price
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const volume = Math.floor(1000000 + Math.random() * 5000000)
    data.push({ time, open, high, low, close, volume })
  }
  return data
}

export function useBybitKline(ticker: string, timeframe: string) {
  const symbol = tickerToBybitSymbol(ticker)
  const interval = timeframeToBybitInterval(timeframe)
  const isCustom = isCustomToken(ticker)
  const isSupported = !!symbol || isCustom

  const [data, setData] = useState<OHLCData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const pendingCandleRef = useRef<OHLCData | null>(null)
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mergeCandle = useCallback((candle: OHLCData, confirmed: boolean = false) => {
    const now = Date.now()
    
    // For confirmed candles, update immediately
    if (confirmed) {
      pendingCandleRef.current = null
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
        updateTimerRef.current = null
      }
      lastUpdateRef.current = now
      
      setData((prev) => {
        const idx = prev.findIndex((c) => c.time === candle.time)
        let next: OHLCData[]
        if (idx >= 0) {
          next = [...prev]
          next[idx] = candle
        } else {
          next = [...prev, candle]
          next.sort((a, b) => a.time - b.time)
        }
        return next
      })
      return
    }
    
    // For unconfirmed candles, throttle updates to max once per second
    pendingCandleRef.current = candle
    
    const timeSinceLastUpdate = now - lastUpdateRef.current
    if (timeSinceLastUpdate >= 1000) {
      // Update immediately if it's been more than 1 second
      lastUpdateRef.current = now
      setData((prev) => {
        const idx = prev.findIndex((c) => c.time === candle.time)
        let next: OHLCData[]
        if (idx >= 0) {
          next = [...prev]
          next[idx] = candle
        } else {
          next = [...prev, candle]
          next.sort((a, b) => a.time - b.time)
        }
        return next
      })
    } else if (!updateTimerRef.current) {
      // Schedule an update for later
      updateTimerRef.current = setTimeout(() => {
        updateTimerRef.current = null
        if (pendingCandleRef.current) {
          lastUpdateRef.current = Date.now()
          const pendingCandle = pendingCandleRef.current
          setData((prev) => {
            const idx = prev.findIndex((c) => c.time === pendingCandle.time)
            let next: OHLCData[]
            if (idx >= 0) {
              next = [...prev]
              next[idx] = pendingCandle
            } else {
              next = [...prev, pendingCandle]
              next.sort((a, b) => a.time - b.time)
            }
            return next
          })
        }
      }, 1000 - timeSinceLastUpdate)
    }
  }, [])

  useEffect(() => {
    if (!isSupported) {
      setData([])
      setLoading(false)
      setError(null)
      return
    }

    // Custom tokens use mock candle data
    if (isCustom) {
      setData(generateCustomTokenCandles(0.0000045, 200))
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const candles = await fetchBybitKlines(symbol!, interval, 200)
        if (!cancelled) {
          setData(candles)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch klines")
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
  }, [symbol, interval, isSupported, isCustom])

  useEffect(() => {
    if (!isSupported || !symbol || isCustom) return

    const topic = `kline.${interval}.${symbol}`

    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return

      const ws = new WebSocket(BYBIT_WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        logStream("Connected", { url: BYBIT_WS_URL })
        ws.send(
          JSON.stringify({
            op: "subscribe",
            args: [topic],
          })
        )
        logStream("Subscribed", { topic })
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as BybitKlineWsMessage
          logStream("Message", msg)

          if (msg.topic === topic && msg.data?.length) {
            const rawCandle = msg.data[0]
            const candle = wsCandleToOHLC(rawCandle)
            const confirmed = rawCandle.confirm ?? false
            logStream("Candle update", { candle, confirmed })
            mergeCandle(candle, confirmed)
          }
        } catch {
          // ignore parse errors
        }
      }

      ws.onerror = (e) => {
        logStream("Error", e)
      }

      ws.onclose = () => {
        wsRef.current = null
        logStream("Closed", { topic })
        if (!cancelled) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000)
        }
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
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
        updateTimerRef.current = null
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      pendingCandleRef.current = null
    }
  }, [symbol, interval, isSupported, isCustom, mergeCandle])

  return {
    data,
    loading,
    error,
    isSupported,
    symbol: symbol ?? undefined,
  }
}
