"use client"

import { use, useMemo } from "react"
import { notFound } from "next/navigation"
import { PortfolioNavbar } from "@/components/PortfolioNavbar"
import { AssetDetailView } from "@/components/markets/AssetDetailView"
import { useBybitTickers } from "@/hooks/useBybitTickers"
import { getAssetByTicker } from "@/lib/sparkline-data"

type Props = {
  params: Promise<{ ticker: string }>
}

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

// Supported crypto tickers
const CRYPTO_TICKERS = new Set([
  "BTC", "ETH", "SOL", "LINK", "SUI", "DOGE", "XRP",
  "AVAX", "ATOM", "ADA", "DOT", "LTC", "ARB", "OP",
  "PEPE", "WIF", "BONK", "SEI", "APT", "FIL", "NEAR", "INJ", "TIA"
])

export default function AssetPage({ params }: Props) {
  const { ticker: rawTicker } = use(params)
  const ticker = rawTicker.toUpperCase()
  const { getTickerByTicker } = useBybitTickers()
  
  const isCrypto = CRYPTO_TICKERS.has(ticker)
  
  // Get asset data - use Bybit for cryptos, fallback to static for stocks
  const asset = useMemo(() => {
    if (isCrypto) {
      const bybitData = getTickerByTicker(ticker)
      if (bybitData) {
        // Convert Bybit data to AssetData format
        return {
          id: ticker,
          ticker: ticker,
          name: CRYPTO_NAMES[ticker] || ticker,
          price: bybitData.price,
          change24h: bybitData.change24h,
          change24hPercent: bybitData.changePct24h,
          category: "Cryptocurrency",
          categories: ["Crypto"],
          sparklineData: [],
          isCrypto: true,
        }
      }
    }
    return getAssetByTicker(ticker)
  }, [ticker, isCrypto, getTickerByTicker])

  if (!asset) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <PortfolioNavbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <AssetDetailView asset={asset} />
      </main>
    </div>
  )
}
