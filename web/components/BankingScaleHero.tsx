"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
type StatItem = {
  value: string
  description: string
  delay: number
}
type DataPoint = {
  id: number
  left: number
  top: number
  height: number
  direction: "up" | "down"
  delay: number
}
const stats: StatItem[] = [
  {
    value: "<100ms",
    description: "EXECUTION",
    delay: 0,
  },
  {
    value: "$0",
    description: "GAS FEES",
    delay: 0.2,
  },
  {
    value: "24/7",
    description: "MARKET HOURS",
    delay: 0.4,
  },
  {
    value: "100%",
    description: "NON-CUSTODIAL",
    delay: 0.6,
  },
]
const generateDataPoints = (): DataPoint[] => {
  const points: DataPoint[] = []
  const baseLeft = 1
  const spacing = 32
  for (let i = 0; i < 50; i++) {
    const direction = i % 2 === 0 ? "down" : "up"
    const height = Math.floor(Math.random() * 120) + 88
    const top = direction === "down" ? Math.random() * 150 + 250 : Math.random() * 100 - 80
    points.push({
      id: i,
      left: baseLeft + i * spacing,
      top,
      height,
      direction,
      delay: i * 0.035,
    })
  }
  return points
}

// @component: BankingScaleHero
export const BankingScaleHero = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [dataPoints] = useState<DataPoint[]>(generateDataPoints())
  const [typingComplete, setTypingComplete] = useState(false)
  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => setTypingComplete(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // @return
  return (
    <div className="w-full overflow-hidden bg-black border-t border-white/10">
      <div className="mx-auto max-w-7xl px-8 py-24 pt-16">
        <div className="grid grid-cols-12 gap-5 gap-y-16">
          <div className="col-span-12 md:col-span-6 relative z-10">
            <div
              className="relative h-6 inline-flex items-center uppercase text-xs mb-12 px-3 py-1 rounded-full bg-[hsl(174,62%,56%)]/10 border border-[hsl(174,62%,56%)]/20"
              style={{
                fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace",
              }}
            >
              <div className="flex items-center gap-0.5 overflow-hidden">
                <motion.span
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: "auto",
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="block whitespace-nowrap overflow-hidden relative z-10 text-[hsl(174,62%,56%)] font-semibold"
                >
                  ● BUILT DIFFERENT
                </motion.span>
              </div>
            </div>

            <h2
              className="text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-white mb-6"
              style={{
                fontFamily: "var(--font-sans), Space Grotesk, sans-serif",
              }}
            >
              Settling trades in{" "}
              <span className="text-[hsl(174,62%,56%)]">milliseconds</span>, not days
              <br />— for traders who refuse to wait.
            </h2>

            <p
              className="text-lg leading-7 text-zinc-400 mt-0 mb-8 max-w-xl"
              style={{
                fontFamily: "var(--font-sans), Space Grotesk, sans-serif",
              }}
            >
              Traditional brokers settle in T+1. CEXs take your keys. We use Yellow Network state channels to give you instant, non-custodial trading with zero gas fees.
            </p>

            <div className="flex gap-4 mt-8">
              <button className="relative inline-flex justify-center items-center leading-5 text-center cursor-pointer whitespace-nowrap outline-none font-semibold h-12 text-black bg-[hsl(174,62%,56%)] transition-all duration-200 ease-in-out rounded-xl px-8 text-base group hover:bg-[hsl(174,62%,66%)]" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                <span className="relative z-10 flex items-center gap-2">
                  Learn how it works
                  <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Settlement Speed Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="col-span-2 bg-zinc-900/50 rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}>SETTLEMENT SPEED</div>
                  <div className="w-2 h-2 rounded-full bg-[hsl(174,62%,56%)] animate-pulse" />
                </div>
                <div className="text-5xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>&lt;100ms</div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={isVisible ? { width: "95%" } : {}}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[hsl(174,62%,56%)] to-green-500"
                  />
                </div>
              </motion.div>

              {/* Gas Fees Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10"
              >
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}>GAS FEES</div>
                <div className="text-4xl font-bold text-[hsl(174,62%,56%)]" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>$0</div>
              </motion.div>

              {/* Uptime Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10"
              >
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}>UPTIME</div>
                <div className="text-4xl font-bold text-[hsl(355,70%,68%)]" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>24/7</div>
              </motion.div>

              {/* Non-Custodial Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="col-span-2 bg-gradient-to-br from-[hsl(174,62%,56%)]/10 to-transparent rounded-2xl p-6 border border-[hsl(174,62%,56%)]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(174,62%,56%)]/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[hsl(174,62%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>100%</div>
                    <div className="text-sm text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>Non-Custodial</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="col-span-12">
            <div className="overflow-visible pb-5">
              <div className="grid grid-cols-12 gap-5 relative z-10">
                {stats.map((stat, index) => (
                  <div key={index} className="col-span-6 md:col-span-3">
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 20,
                        filter: "blur(4px)",
                      }}
                      animate={
                        isVisible
                          ? {
                              opacity: [0, 1, 1],
                              y: [20, 0, 0],
                              filter: ["blur(4px)", "blur(0px)", "blur(0px)"],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        delay: stat.delay,
                        ease: [0.1, 0, 0.1, 1],
                      }}
                      className="flex flex-col gap-2"
                    >
                      <span
                        className="text-3xl font-semibold leading-tight tracking-tight text-[hsl(174,62%,56%)]"
                        style={{
                          fontFamily: "var(--font-sans), Space Grotesk, sans-serif",
                        }}
                      >
                        {stat.value}
                      </span>
                      <p className="text-xs leading-tight text-zinc-400 m-0 whitespace-pre-line uppercase tracking-wide font-semibold" style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}>
                        {stat.description}
                      </p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
