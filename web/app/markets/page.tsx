"use client"

import { useMemo } from "react"
import { PortfolioNavbar } from "@/components/PortfolioNavbar"
import { MarketTickerBar } from "@/components/markets/MarketTickerBar"
import { AssetColumns } from "@/components/markets/AssetColumns"
import { ProductGrid } from "@/components/markets/ProductGrid"
import { useBybitTickers } from "@/hooks/useBybitTickers"
import type { AssetWithQuote } from "@/hooks/useStockQuotes"

// Crypto names mapping
const CRYPTO_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  LINK: "Chainlink",
  SUI: "Sui",
  DOGE: "Dogecoin",
  XRP: "Ripple",
  AVAX: "Avalanche",
  ATOM: "Cosmos",
  ADA: "Cardano",
  DOT: "Polkadot",
  LTC: "Litecoin",
  ARB: "Arbitrum",
  OP: "Optimism",
  PEPE: "Pepe",
  WIF: "dogwifhat",
  BONK: "Bonk",
  SEI: "Sei",
  APT: "Aptos",
  FIL: "Filecoin",
  NEAR: "NEAR Protocol",
  INJ: "Injective",
  TIA: "Celestia",
}

// Crypto categories
const CRYPTO_CATEGORIES: Record<string, string[]> = {
  BTC: ["Layer 1", "Large Cap"],
  ETH: ["Layer 1", "Large Cap", "DeFi"],
  SOL: ["Layer 1", "Large Cap"],
  LINK: ["Oracle", "DeFi"],
  SUI: ["Layer 1"],
  DOGE: ["Meme", "Large Cap"],
  XRP: ["Large Cap"],
  AVAX: ["Layer 1", "DeFi"],
  ATOM: ["Layer 1"],
  ADA: ["Layer 1"],
  DOT: ["Layer 1"],
  LTC: ["Large Cap"],
  ARB: ["Layer 2"],
  OP: ["Layer 2"],
  PEPE: ["Meme"],
  WIF: ["Meme"],
  BONK: ["Meme"],
  SEI: ["Layer 1"],
  APT: ["Layer 1"],
  FIL: ["Storage"],
  NEAR: ["Layer 1"],
  INJ: ["DeFi"],
  TIA: ["Layer 1", "Modular"],
}

// Generate sparkline data based on 24h price change
function generateSparklineData(currentPrice: number, changePct: number, points: number = 24): number[] {
  const data: number[] = []
  const startPrice = currentPrice / (1 + changePct / 100)
  const priceRange = currentPrice - startPrice
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1)
    // Create a smooth curve from start to end price with some randomness
    const baseValue = startPrice + priceRange * progress
    const noise = (Math.random() - 0.5) * Math.abs(priceRange) * 0.2
    const value = baseValue + noise
    data.push(Math.max(0, value))
  }
  
  // Ensure last point is the current price
  data[data.length - 1] = currentPrice
  
  return data
}

export default function MarketsPage() {
  const { tickersList, loading, error } = useBybitTickers()

  // Convert Bybit ticker data to AssetWithQuote format
  const assets: AssetWithQuote[] = useMemo(() => {
    return tickersList.map((ticker, index) => ({
      id: ticker.ticker,
      ticker: ticker.ticker,
      name: CRYPTO_NAMES[ticker.ticker] || ticker.ticker,
      price: ticker.price,
      change24h: ticker.change24h,
      change24hPercent: ticker.changePct24h,
      categories: CRYPTO_CATEGORIES[ticker.ticker] || [],
      isLive: true,
      marketCap: `Vol $${(ticker.turnover24h / 1e9).toFixed(2)}B`,
      addedDate: index < 3 ? "New" : undefined, // Mark first 3 as new
      sparklineData: generateSparklineData(ticker.price, ticker.changePct24h),
      high24h: ticker.high24h,
      low24h: ticker.low24h,
    }))
  }, [tickersList])

  const refetch = () => {
    // Bybit tickers auto-refresh via WebSocket, so we don't need manual refetch
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background">
      <PortfolioNavbar />
      <main className="pt-24 pb-16">
        <MarketTickerBar />
        <div className="px-4 sm:px-6 lg:px-8 mt-8">
          <AssetColumns assets={assets} loading={loading} />
          <ProductGrid assets={assets} loading={loading} error={error} onRefetch={refetch} />
        </div>
      </main>
    </div>
  )
}
