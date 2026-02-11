import { NextResponse } from "next/server"
import { fetchBybitKlines, tickerToBybitSymbol, timeframeToBybitInterval } from "@/lib/bybit"

export const dynamic = "force-dynamic"
export const revalidate = 0

/** Map Finnhub-style resolution to our timeframe label */
function resolutionToTimeframe(resolution: string): string {
  const map: Record<string, string> = {
    "1": "1m",
    "5": "5m",
    "15": "15m",
    "30": "15m", // Bybit doesn't have 30m, use 15m
    "60": "1h",
    D: "D",
    W: "W",
    M: "M",
  }
  return map[resolution] ?? "5m"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get("symbol")
  const resolution = searchParams.get("resolution") || "D"
  const count = parseInt(searchParams.get("count") || "30", 10)

  if (!ticker) {
    return NextResponse.json(
      { error: "Symbol is required" },
      { status: 400 }
    )
  }

  const bybitSymbol = tickerToBybitSymbol(ticker)
  if (!bybitSymbol) {
    return NextResponse.json(
      { error: `Unsupported ticker: ${ticker}` },
      { status: 400 }
    )
  }

  try {
    const timeframe = resolutionToTimeframe(resolution)
    const interval = timeframeToBybitInterval(timeframe)
    const candles = await fetchBybitKlines(bybitSymbol, interval, count)

    // Return in Finnhub-compatible shape for useAssetDetail compatibility
    const result = {
      o: candles.map((c) => c.open),
      h: candles.map((c) => c.high),
      l: candles.map((c) => c.low),
      c: candles.map((c) => c.close),
      t: candles.map((c) => c.time),
      v: candles.map((c) => c.volume),
      s: "ok",
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch candles from Bybit:", error)
    return NextResponse.json(
      { error: "Failed to fetch candle data" },
      { status: 500 }
    )
  }
}
