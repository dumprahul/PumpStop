"use client"

import { useState, useEffect, useMemo } from "react"
import type { AssetData } from "@/lib/sparkline-data"
import { useBybitTickers } from "./useBybitTickers"
import { tickerToBybitSymbol } from "@/lib/bybit"

export type AssetDetailData = AssetData & {
  price: number
  change24h: number
  change24hPercent: number
  sparklineData: number[]
  chartData: { time: number; value: number }[]
  candlesData: { o: number[]; h: number[]; l: number[]; c: number[]; t: number[] } | null
  isLoading: boolean
}

// Crypto tickers set
const CRYPTO_TICKERS = new Set([
  "BTC", "ETH", "SOL", "LINK", "SUI", "DOGE", "XRP",
  "AVAX", "ATOM", "ADA", "DOT", "LTC", "ARB", "OP",
  "PEPE", "WIF", "BONK", "SEI", "APT", "FIL", "NEAR", "INJ", "TIA",
  "IHAI", "CTDL", "PBNB", "BABYMOLT", "IDEA", "CLAW",
  "LIFE", "STOCK", "KIN", "ROBIN", "BASE", "JEWDENG",
])

export function useAssetDetail(asset: AssetData) {
  const { tickers } = useBybitTickers()
  const isCrypto = CRYPTO_TICKERS.has(asset.ticker.toUpperCase())
  
  const [stockData, setStockData] = useState<AssetDetailData>({
    ...asset,
    price: asset.price,
    change24h: asset.change24h,
    change24hPercent: asset.change24hPercent,
    sparklineData: asset.sparklineData,
    chartData: asset.sparklineData.map((v, i) => ({ time: i, value: v })),
    candlesData: null,
    isLoading: !isCrypto,
  })

  // For cryptos, get live data from Bybit using useMemo to avoid re-render loops
  const cryptoData = useMemo(() => {
    if (!isCrypto) return null

    const symbol = tickerToBybitSymbol(asset.ticker.toUpperCase())
    if (!symbol) return null

    const bybitData = tickers.get(symbol)
    if (!bybitData) return null

    return {
      ...asset,
      price: bybitData.price,
      change24h: bybitData.change24h,
      change24hPercent: bybitData.changePct24h,
      sparklineData: generateSparkline(bybitData.price, bybitData.changePct24h),
      chartData: generateSparkline(bybitData.price, bybitData.changePct24h).map((v, i) => ({ time: i, value: v })),
      candlesData: null,
      isLoading: false,
    }
  }, [isCrypto, asset, tickers])

  // Fetch stock data for non-crypto assets
  useEffect(() => {
    if (isCrypto) return // Skip for cryptos

    let cancelled = false

    async function fetchData() {
      try {
        const [quoteRes, candlesRes] = await Promise.all([
          fetch(`/api/stocks/quotes?symbols=${asset.ticker}`),
          fetch(`/api/stocks/candles?symbol=${asset.ticker}&resolution=D&count=90`),
        ])

        if (cancelled) return

        const quoteData = await quoteRes.json()
        const quote = quoteData[asset.ticker]
        const candles = candlesRes.ok ? await candlesRes.json() : null

        if (cancelled) return

        const updates: Partial<AssetDetailData> = { isLoading: false }

        if (quote && quote.c > 0) {
          const change = quote.d ?? quote.c - quote.pc
          const changePercent = quote.dp ?? (quote.pc ? ((quote.c - quote.pc) / quote.pc) * 100 : 0)
          updates.price = quote.c
          updates.change24h = change
          updates.change24hPercent = changePercent
          updates.sparklineData = generateSparkline(quote.c, changePercent)
        }

        if (candles?.c?.length) {
          updates.chartData = candles.c.map((v: number, i: number) => ({
            time: candles.t?.[i] ?? i,
            value: v,
          }))
          updates.candlesData = candles
        }

        setStockData((prev) => ({ ...prev, ...updates }))
      } catch {
        if (!cancelled) {
          setStockData((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [asset.ticker, asset.id, isCrypto])

  // Return crypto data if available, otherwise stock data
  return cryptoData || stockData
}

function generateSparkline(currentPrice: number, changePercent: number, points = 24): number[] {
  const data: number[] = []
  const totalChange = currentPrice * (changePercent / 100)
  for (let i = 0; i <= points; i++) {
    const t = i / points
    const noise = Math.sin(i * 2.1) * 0.008 + Math.cos(i * 1.3) * 0.005
    const price = currentPrice - totalChange * (1 - t) + currentPrice * noise
    data.push(Math.max(price, 0.01))
  }
  return data
}
