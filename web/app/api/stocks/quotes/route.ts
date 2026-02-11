import { NextResponse } from "next/server"
import { BYBIT_REST_URL, tickerToBybitSymbol } from "@/lib/bybit"
import { ASSETS } from "@/lib/sparkline-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

type QuoteData = {
  c: number  // current price
  d: number  // change
  dp: number // change percent
  h: number  // high
  l: number  // low
  o: number  // open (prev close as proxy)
  pc: number // previous close
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbolsParam = searchParams.get("symbols")
  const tickers = symbolsParam
    ? symbolsParam.split(",").map((s) => s.trim())
    : ASSETS.map((a) => a.ticker)

  try {
    // Fetch all linear tickers from Bybit in one call
    const url = new URL(`${BYBIT_REST_URL}/v5/market/tickers`)
    url.searchParams.set("category", "linear")
    const res = await fetch(url.toString(), { cache: "no-store" })
    const json = await res.json()

    if (json.retCode !== 0) {
      throw new Error(json.retMsg ?? "Bybit API error")
    }

    const list: Array<{
      symbol: string
      lastPrice: string
      prevPrice24h: string
      highPrice24h: string
      lowPrice24h: string
      price24hPcnt: string
    }> = json.result?.list ?? []

    // Build a lookup from Bybit symbol → ticker data
    const bybitMap = new Map<string, (typeof list)[0]>()
    for (const item of list) {
      bybitMap.set(item.symbol, item)
    }

    // Map requested tickers to QuoteData
    const quotes: Record<string, QuoteData | null> = {}
    for (const ticker of tickers) {
      const bybitSymbol = tickerToBybitSymbol(ticker)
      if (!bybitSymbol) {
        quotes[ticker] = null
        continue
      }
      const item = bybitMap.get(bybitSymbol)
      if (!item) {
        quotes[ticker] = null
        continue
      }

      const price = Number(item.lastPrice)
      const prevClose = Number(item.prevPrice24h) || price
      const change = price - prevClose
      const changePct = Number(item.price24hPcnt) * 100

      quotes[ticker] = {
        c: price,
        d: change,
        dp: changePct,
        h: Number(item.highPrice24h),
        l: Number(item.lowPrice24h),
        o: prevClose,
        pc: prevClose,
      }
    }

    return NextResponse.json(quotes)
  } catch (error) {
    console.error("Failed to fetch quotes from Bybit:", error)
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    )
  }
}
