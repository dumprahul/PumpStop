"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

type StatItem = {
  value: string
  label: string
  delay: number
}

type FallingBar = {
  id: number
  left: number
  height: number
  delay: number
  opacity: number
}

const stats: StatItem[] = [
  { value: "<100ms", label: "EXECUTION", delay: 0 },
  { value: "$0", label: "GAS FEES", delay: 0.15 },
  { value: "24/7", label: "MARKET HOURS", delay: 0.3 },
  { value: "100%", label: "NON-CUSTODIAL", delay: 0.45 },
]

const generateFallingBars = (): FallingBar[] => {
  const bars: FallingBar[] = []
  for (let i = 0; i < 24; i++) {
    bars.push({
      id: i,
      left: i * 20 + 10,
      height: Math.random() * 200 + 100,
      delay: i * 0.05,
      opacity: Math.random() * 0.5 + 0.3,
    })
  }
  return bars
}

export const WhyWeWinSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [bars] = useState<FallingBar[]>(generateFallingBars())

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    const element = document.getElementById("why-we-win-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="why-we-win-section"
      className="w-full overflow-hidden bg-black border-t border-white/10"
    >
      <div className="mx-auto max-w-7xl px-8 py-24">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left Content */}
          <div className="col-span-12 lg:col-span-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
            >
              <div
                className="relative h-6 inline-flex items-center uppercase text-xs mb-8 px-3 py-1 rounded-full bg-[hsl(174,62%,56%)]/10 border border-[hsl(174,62%,56%)]/20"
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace",
                }}
              >
                <span className="flex items-center gap-1.5 text-[hsl(174,62%,56%)] font-semibold">
                  ● BUILT DIFFERENT
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
              Settling trades in{" "}
              <span className="text-[hsl(174,62%,56%)]">milliseconds</span>, not days — for traders who refuse to wait.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.645, 0.045, 0.355, 1] }}
              className="text-lg leading-7 text-zinc-400 mb-8 max-w-xl"
              style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
            >
              Traditional brokers settle in T+1. CEXs take your keys. We use Yellow Network
              state channels to give you instant, non-custodial trading with zero gas fees.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.645, 0.045, 0.355, 1] }}
            >
              <button className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-base transition-colors bg-[hsl(174,62%,56%)] text-black hover:bg-[hsl(174,62%,66%)]" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                Learn how it works
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.645, 0.045, 0.355, 1] }}
              className="grid grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/10"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.5 + stat.delay,
                    ease: [0.645, 0.045, 0.355, 1],
                  }}
                  className="flex flex-col gap-1"
                >
                  <span
                    className="text-3xl font-bold tracking-tight text-[hsl(174,62%,56%)]"
                    style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" }}>
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Visual - Trading Metrics Cards */}
          <div className="col-span-12 lg:col-span-6 relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Speed Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="col-span-2 bg-zinc-900/50 rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Settlement Speed</div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">&lt;100ms</div>
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
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-3">Gas Fees</div>
                <div className="text-4xl font-bold text-[hsl(174,62%,56%)]">$0</div>
              </motion.div>

              {/* 24/7 Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10"
              >
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-3">Uptime</div>
                <div className="text-4xl font-bold text-[hsl(355,70%,68%)]">24/7</div>
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
                    <div className="text-2xl font-bold text-white">100%</div>
                    <div className="text-sm text-zinc-400">Non-Custodial</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
