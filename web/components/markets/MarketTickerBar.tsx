"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Radio } from "lucide-react"
import { useBybitTickers } from "@/hooks/useBybitTickers"
import { cn, getCryptoLogoUrl } from "@/lib/utils"

type CryptoAsset = {
  id: string
  ticker: string
  name: string
  price: number
  change24hPercent: number
  isLive: boolean
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  } else if (price >= 1) {
    return price.toFixed(2)
  } else if (price >= 0.01) {
    return price.toFixed(4)
  }
  return price.toFixed(6)
}

function TickerItem({ asset }: { asset: CryptoAsset }) {
  const isPositive = asset.change24hPercent >= 0

  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-200 min-w-[200px] cursor-default">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted overflow-hidden">
        <img
          src={getCryptoLogoUrl(asset.ticker)}
          alt={asset.ticker}
          className="w-8 h-8 object-cover rounded-full"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
          {asset.ticker}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-[100px]" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
          {asset.name}
        </span>
      </div>
      <div className="flex flex-col items-end ml-auto">
        <span className="text-sm font-semibold text-foreground tabular-nums" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
          ${formatPrice(asset.price)}
        </span>
        <span
          className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            isPositive ? "text-emerald-600" : "text-red-600"
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositive ? "+" : ""}
          {asset.change24hPercent.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

function TickerSkeleton() {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border min-w-[200px]">
      <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
      <div className="flex flex-col gap-1">
        <div className="w-12 h-4 bg-muted rounded animate-pulse" />
        <div className="w-16 h-3 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex flex-col items-end ml-auto gap-1">
        <div className="w-16 h-4 bg-muted rounded animate-pulse" />
        <div className="w-12 h-3 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
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
  IHAI: "I have an idea",
  CTDL: "AI Market Maker",
  PBNB: "PetsBNB",
  BABYMOLT: "babymolt",
  IDEA: "Idea Coins",
  CLAW: "OpenClaw",
  LIFE: "SENFINA",
  STOCK: "24 Hour Stock Trader",
  KIN: "KIN",
  ROBIN: "Robinpump",
  BASE: "Base",
  JEWDENG: "JEWDENG",
}

export function MarketTickerBar() {
  const { tickersList, loading } = useBybitTickers()

  // Convert to CryptoAsset format
  const cryptoAssets: CryptoAsset[] = tickersList
    .filter((ticker) => ticker.price > 0)
    .map((ticker) => ({
      id: ticker.ticker,
      ticker: ticker.ticker,
      name: CRYPTO_NAMES[ticker.ticker] || ticker.ticker,
      price: ticker.price,
      change24hPercent: ticker.changePct24h,
      isLive: true,
    }))

  // Show loading state
  if (loading && cryptoAssets.length === 0) {
    return (
      <div className="relative overflow-hidden border-b border-border bg-background/80">
        <div className="flex gap-6 py-4 px-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TickerSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Don't render if no valid assets
  if (cryptoAssets.length === 0) {
    return null
  }

  return (
    <div className="relative overflow-hidden border-b border-border bg-background/80">
      {/* Live indicator */}
      <div className="absolute top-2 right-4 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium">
        <Radio className="w-3 h-3 animate-pulse" />
        Live
      </div>

      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background via-background/95 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background via-background/95 to-transparent z-10 pointer-events-none" />

      {/* Scrolling ticker */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex gap-6 py-4 animate-ticker"
        style={{ width: "max-content" }}
      >
        {/* Duplicate assets for seamless scrolling */}
        {[...cryptoAssets, ...cryptoAssets].map((asset, i) => (
          <TickerItem key={`${asset.id}-${i}`} asset={asset} />
        ))}
      </motion.div>
    </div>
  )
}
