"use client"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"
type ProductTeaserCardProps = {
  dailyVolume?: string
  dailyVolumeLabel?: string
  headline?: string
  subheadline?: string
  description?: string
  videoSrc?: string
  posterSrc?: string
  primaryButtonText?: string
  primaryButtonHref?: string
  secondaryButtonText?: string
  secondaryButtonHref?: string
}

// @component: ProductTeaserCard
export const ProductTeaserCard = (props: ProductTeaserCardProps) => {
  const {
    dailyVolume = "$2.4B",
    dailyVolumeLabel = "PROCESSING",
    headline = "Settle Trades in Milliseconds",
    subheadline = "A pro trading layer on top of RobinPump.fun that gives traders CEX-grade tools without giving up custody.",
    // Use local TradingView-style candles video by default
    videoSrc = "/candles.mp4",
    posterSrc = "",
    primaryButtonText = "Start Trading",
    primaryButtonHref = "/markets",
    secondaryButtonText = "Watch Demo",
    secondaryButtonHref = "#demo",
  } = props

  // @return
  return (
    <section className="w-full px-8 pt-24 pb-32 bg-black min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.645, 0.045, 0.355, 1],
            }}
            className="flex flex-col"
          >
            {/* Beta Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-8 w-fit"
            >
              <div className="flex items-center gap-2 bg-[hsl(174,62%,56%)]/20 px-3 py-1.5 rounded-full border border-[hsl(174,62%,56%)]/30">
                <div className="w-2 h-2 rounded-full bg-[hsl(174,62%,56%)] animate-pulse" />
                <span className="text-xs font-medium text-[hsl(174,62%,56%)]">
                  Now in Public Beta
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <h1
              className="text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"
              style={{
                fontFamily: "var(--font-sans), Space Grotesk, sans-serif",
              }}
            >
              Build your crypto{" "}
              <span className="text-[hsl(174,62%,56%)]">
                trading platform
              </span>{" "}
              with confidence
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg text-zinc-400 mb-8 max-w-[540px] leading-relaxed"
              style={{
                fontFamily: "var(--font-sans), Space Grotesk, sans-serif",
              }}
            >
              {subheadline}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/markets"
                className="inline-flex items-center gap-2 bg-[hsl(174,62%,56%)] text-black px-8 py-4 rounded-xl font-semibold text-base hover:bg-[hsl(174,62%,66%)] transition-all duration-200"
                style={{
                  fontFamily: "var(--font-sans), Space Grotesk, sans-serif",
                }}
              >
                Start Trading
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/perpetuals"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/5 transition-all duration-200"
                style={{
                  fontFamily: "var(--font-sans), Space Grotesk, sans-serif",
                }}
              >
                Start Perps
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trader Stats */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "https://randomuser.me/api/portraits/men/32.jpg",
                  "https://randomuser.me/api/portraits/women/44.jpg",
                  "https://randomuser.me/api/portraits/men/86.jpg",
                  "https://randomuser.me/api/portraits/women/68.jpg"
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Trader ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-black object-cover"
                  />
                ))}
              </div>
              <span className="text-base text-zinc-300 font-medium" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                2,400+ traders building
              </span>
            </div>
          </motion.div>

          {/* Right Side - Illustration & Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.7,
              ease: [0.21, 0.8, 0.35, 1],
              delay: 0.2,
            }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[600px]">
              {/* Processing Stats - Top Left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute top-0 left-0 z-10"
              >
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/10">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                    24H VOLUME
                  </div>
                  <div className="text-3xl font-bold text-[hsl(174,62%,56%)]">
                    $2.4B
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    trading volume
                  </div>
                </div>
              </motion.div>

              {/* Uptime Stats - Bottom Right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute bottom-0 right-0 z-10"
              >
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/10">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                    LIQUIDITY
                  </div>
                  <div className="text-3xl font-bold text-[hsl(355,70%,68%)]">
                    $8.5M
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    available now
                  </div>
                </div>
              </motion.div>

              {/* Trading Terminal Illustration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative flex items-center justify-center py-16"
              >
                <div className="relative w-full h-[400px] flex items-center justify-center">
                  {/* Main Trading Platform */}
                  <div 
                    className="absolute w-[500px] h-[320px] rounded-2xl overflow-hidden"
                    style={{
                      background: "linear-gradient(145deg, hsl(220,26%,16%), hsl(220,26%,12%))",
                      transform: "perspective(1000px) rotateX(8deg) rotateY(-5deg)",
                      boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                    }}
                  >
                    {/* Trading Chart Area */}
                    <div className="absolute inset-0 p-4">
                      {/* Chart Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-[hsl(174,62%,56%)]" />
                        <span className="text-sm font-semibold text-white">BTC/USDT</span>
                        <span className="text-xs text-[hsl(174,62%,56%)] ml-auto">+2.4%</span>
                      </div>

                      {/* Candlestick Chart Simulation */}
                      <div className="relative h-40 flex items-end justify-between gap-1 px-2">
                        {[60, 75, 55, 80, 70, 85, 65, 90, 75, 95, 80, 100, 85, 92, 88, 94].map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 + i * 0.05 }}
                            className="relative flex-1 origin-bottom"
                            style={{ height: `${height}%` }}
                          >
                            <div
                              className={`w-full rounded-t ${i % 3 === 0 ? 'bg-green-500/80' : 'bg-[hsl(174,62%,56%)]/60'}`}
                              style={{ height: '100%' }}
                            />
                          </motion.div>
                        ))}
                        
                        {/* Grid lines */}
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="absolute left-0 right-0 border-t border-white/5"
                            style={{ top: `${i * 25}%` }}
                          />
                        ))}
                      </div>

                      {/* Order Panel */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                          <div className="text-xs text-zinc-400 mb-1">Long</div>
                          <div className="text-sm font-bold text-green-400">$64,538</div>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                          <div className="text-xs text-zinc-400 mb-1">Short</div>
                          <div className="text-sm font-bold text-red-400">$64,425</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Mobile Device */}
                  <motion.div
                    animate={{ y: [0, -8, 0], x: [0, 3, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[5%] top-[15%] w-24 h-36 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                    style={{
                      transform: "perspective(600px) rotateY(-15deg) rotateX(5deg)",
                    }}
                  >
                    <div className="h-full flex flex-col p-3 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[hsl(174,62%,56%)]" />
                        <div className="flex-1 h-2 bg-zinc-800 rounded" />
                      </div>
                      <div className="flex-1 bg-zinc-800/50 rounded-lg" />
                      <div className="grid grid-cols-2 gap-1">
                        <div className="h-8 bg-green-500/20 rounded border border-green-500/30" />
                        <div className="h-8 bg-red-500/20 rounded border border-red-500/30" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Animated Crypto Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-24 overflow-hidden py-6 border-t border-b border-white/10"
        >
          <div className="relative">
            {/* Gradient fades */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
            
            {/* Ticker tape - duplicate for seamless loop */}
            <div className="flex gap-8 animate-scroll-left whitespace-nowrap">
              {[...CRYPTO_TICKERS, ...CRYPTO_TICKERS].map((crypto, i) => (
                <div
                  key={`${crypto.ticker}-${i}`}
                  className="flex items-center gap-3 flex-shrink-0"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-zinc-900 border border-white/10">
                    <img
                      src={`https://img.logo.dev/crypto/${crypto.ticker.toLowerCase()}?token=pk_CDZ01_qUTsOMosnUm6lEvA`}
                      alt={crypto.ticker}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{crypto.ticker}</span>
                    <span className="text-xs text-zinc-400">{crypto.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const CRYPTO_TICKERS = [
  { ticker: "BTC", name: "Bitcoin" },
  { ticker: "ETH", name: "Ethereum" },
  { ticker: "SOL", name: "Solana" },
  { ticker: "LINK", name: "Chainlink" },
  { ticker: "SUI", name: "Sui" },
  { ticker: "DOGE", name: "Dogecoin" },
  { ticker: "XRP", name: "XRP" },
  { ticker: "AVAX", name: "Avalanche" },
  { ticker: "ATOM", name: "Cosmos" },
  { ticker: "ADA", name: "Cardano" },
  { ticker: "DOT", name: "Polkadot" },
  { ticker: "LTC", name: "Litecoin" },
  { ticker: "ARB", name: "Arbitrum" },
  { ticker: "OP", name: "Optimism" },
  { ticker: "PEPE", name: "Pepe" },
  { ticker: "WIF", name: "dogwifhat" },
  { ticker: "BONK", name: "Bonk" },
  { ticker: "SEI", name: "Sei" },
  { ticker: "APT", name: "Aptos" },
  { ticker: "FIL", name: "Filecoin" },
  { ticker: "NEAR", name: "NEAR Protocol" },
  { ticker: "INJ", name: "Injective" },
  { ticker: "TIA", name: "Celestia" },
  { ticker: "IHAI", name: "I have an idea" },
  { ticker: "CTDL", name: "AI Market Maker" },
  { ticker: "PBNB", name: "PetsBNB" },
  { ticker: "BABYMOLT", name: "babymolt" },
  { ticker: "IDEA", name: "Idea Coins" },
  { ticker: "CLAW", name: "OpenClaw" },
  { ticker: "LIFE", name: "SENFINA" },
  { ticker: "STOCK", name: "24 Hour Stock Trader" },
  { ticker: "KIN", name: "KIN" },
  { ticker: "ROBIN", name: "Robinpump" },
  { ticker: "BASE", name: "Base" },
  { ticker: "JEWDENG", name: "JEWDENG" },
]
