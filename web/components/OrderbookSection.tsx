"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Zap, Shield, Lock } from "lucide-react"

type FeatureItem = {
  icon: React.ReactNode
  text: string
  delay: number
}

const features: FeatureItem[] = [
  {
    icon: <BookOpen className="w-4 h-4" />,
    text: "Limit & market orders",
    delay: 0,
  },
  {
    icon: <Zap className="w-4 h-4" />,
    text: "Off-chain matching, zero gas",
    delay: 0.1,
  },
  {
    icon: <Shield className="w-4 h-4" />,
    text: "Cryptographic settlement proofs",
    delay: 0.2,
  },
]

type OrderLevel = {
  price: string
  size: string
  total: string
  depth: number
}

const bids: OrderLevel[] = [
  { price: "178.25", size: "124", total: "124", depth: 0.9 },
  { price: "178.20", size: "256", total: "380", depth: 0.75 },
  { price: "178.15", size: "189", total: "569", depth: 0.6 },
  { price: "178.10", size: "412", total: "981", depth: 0.45 },
  { price: "178.05", size: "298", total: "1279", depth: 0.35 },
  { price: "178.00", size: "567", total: "1846", depth: 0.25 },
]

const asks: OrderLevel[] = [
  { price: "178.30", size: "98", total: "98", depth: 0.85 },
  { price: "178.35", size: "187", total: "285", depth: 0.7 },
  { price: "178.40", size: "234", total: "519", depth: 0.55 },
  { price: "178.45", size: "156", total: "675", depth: 0.4 },
  { price: "178.50", size: "423", total: "1098", depth: 0.3 },
  { price: "178.55", size: "312", total: "1410", depth: 0.2 },
]

export const OrderbookSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [highlightedBid, setHighlightedBid] = useState<number | null>(null)
  const [highlightedAsk, setHighlightedAsk] = useState<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    const element = document.getElementById("orderbook-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => {
      const randomBid = Math.floor(Math.random() * bids.length)
      const randomAsk = Math.floor(Math.random() * asks.length)
      setHighlightedBid(randomBid)
      setHighlightedAsk(randomAsk)
      setTimeout(() => {
        setHighlightedBid(null)
        setHighlightedAsk(null)
      }, 300)
    }, 1500)
    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section
      id="orderbook-section"
      className="w-full overflow-hidden bg-black border-t border-white/10"
    >
      <div className="mx-auto max-w-7xl px-8 py-24">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left Visual - Orderbook Depth */}
          <div className="col-span-12 lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
              className="relative w-full rounded-3xl overflow-hidden bg-zinc-900/50 border border-white/10"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-white">Live Orderbook</span>
                </div>
                <span
                  className="text-xs font-mono text-zinc-400"
                  style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}
                >
                  AAPL-PERP
                </span>
              </div>

              {/* Orderbook */}
              <div className="p-4">
                {/* Column Headers */}
                <div
                  className="grid grid-cols-3 gap-4 text-xs text-zinc-400 mb-3 px-2"
                  style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}
                >
                  <span>Price</span>
                  <span className="text-right">Size</span>
                  <span className="text-right">Total</span>
                </div>

                {/* Asks (Sells) - Reversed to show highest at top */}
                <div className="space-y-1 mb-4">
                  {[...asks].reverse().map((ask, index) => (
                    <motion.div
                      key={`ask-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: 0.1 * (asks.length - 1 - index),
                        ease: [0.645, 0.045, 0.355, 1],
                      }}
                      className={`relative grid grid-cols-3 gap-4 text-sm py-1.5 px-2 rounded transition-all ${
                        highlightedAsk === asks.length - 1 - index
                          ? "bg-red-500/20"
                          : "hover:bg-white/5"
                      }`}
                      style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}
                    >
                      {/* Depth indicator */}
                      <div
                        className="absolute inset-y-0 right-0 bg-red-500/10 rounded-r"
                        style={{ width: `${ask.depth * 100}%` }}
                      />
                      <span className="text-red-400 relative z-10">${ask.price}</span>
                      <span className="text-right text-zinc-300 relative z-10">{ask.size}</span>
                      <span className="text-right text-zinc-400 relative z-10">{ask.total}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Spread Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex items-center justify-center py-3 mb-4 border-y border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-semibold text-white">$178.275</span>
                    <span
                      className="text-xs px-2 py-1 rounded bg-[#FFD700]/10 text-[#FFD700]"
                      style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}
                    >
                      Spread: $0.05
                    </span>
                  </div>
                </motion.div>

                {/* Bids (Buys) */}
                <div className="space-y-1">
                  {bids.map((bid, index) => (
                    <motion.div
                      key={`bid-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: 0.1 * index + 0.6,
                        ease: [0.645, 0.045, 0.355, 1],
                      }}
                      className={`relative grid grid-cols-3 gap-4 text-sm py-1.5 px-2 rounded transition-all ${
                        highlightedBid === index ? "bg-green-500/20" : "hover:bg-white/5"
                      }`}
                      style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}
                    >
                      {/* Depth indicator */}
                      <div
                        className="absolute inset-y-0 left-0 bg-green-500/10 rounded-l"
                        style={{ width: `${bid.depth * 100}%` }}
                      />
                      <span className="text-green-400 relative z-10">${bid.price}</span>
                      <span className="text-right text-zinc-300 relative z-10">{bid.size}</span>
                      <span className="text-right text-zinc-400 relative z-10">{bid.total}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span className="text-xs text-zinc-400">Settlement proof ready</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-green-500">12ms</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content */}
          <div className="col-span-12 lg:col-span-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
            >
              <div
                className="relative h-6 inline-flex items-center uppercase text-xs mb-8 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20"
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace",
                }}
              >
                <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  TRUE ORDERBOOK
                </span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.645, 0.045, 0.355, 1] }}
              className="text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-white mb-6"
              style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
            >
              Set your price.
              <br />
              <span className="text-zinc-500">Not the AMM&apos;s.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.645, 0.045, 0.355, 1] }}
              className="text-lg leading-7 text-zinc-400 mb-8 max-w-xl"
              style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
            >
              Limit orders. Market orders. Visible depth. Yellow state channels settle
              your trades in milliseconds — off-chain speed with on-chain guarantees.
            </motion.p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + feature.delay,
                    ease: [0.645, 0.045, 0.355, 1],
                  }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[hsl(174,62%,56%)]/10"
                  >
                    <div className="text-[hsl(174,62%,56%)]">{feature.icon}</div>
                  </div>
                  <span
                    className="text-base text-white"
                    style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
                  >
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
              className="flex gap-8 mt-10 pt-8 border-t border-white/10"
            >
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-[#FFD700]" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                  12ms
                </span>
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}>
                  Avg. Settlement
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-[hsl(174,62%,56%)]" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                  100%
                </span>
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}>
                  On-chain Backed
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
