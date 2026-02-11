"use client"

import React, { useMemo, useState } from "react"
import { useAccount, useBalance, useReadContract, useSwitchChain } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { formatUnits } from "viem"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Wallet,
  Settings,
  Layers,
  Plus,
  ArrowUpFromLine,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Zap,
  Sparkles,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import { useYellowNetwork } from "@/lib/yellowNetwork"
import { useStockQuotes } from "@/hooks/useStockQuotes"
import { ASSETS, getAssetByTicker } from "@/lib/sparkline-data"
import { CHAIN_OPTIONS, USDC_BY_CHAIN, CHAIN_LOGOS } from "@/lib/chains"
import { DepositModal, type DepositPayload } from "./DepositModal"
import { WithdrawModal, type WithdrawPayload } from "./WithdrawModal"
import { TransactionHistory } from "./TransactionHistory"
import { toast } from "sonner"

const LOGOKIT_TOKEN = "pk_frfbe2dd55bc04b3d4d1bc"

function ChainLogo({
  chainId,
  chainName,
}: {
  chainId: string
  chainName: string
}) {
  const [failed, setFailed] = React.useState(false)
  const logoUrl = CHAIN_LOGOS[chainId]
  const initial = chainName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  if (failed || !logoUrl) {
    return (
      <div
        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-semibold bg-muted text-muted-foreground"
        title={chainName}
      >
        {initial}
      </div>
    )
  }
  return (
    <img
      src={logoUrl}
      alt={chainName}
      className="w-5 h-5 rounded-full flex-shrink-0 object-cover bg-muted"
      onError={() => setFailed(true)}
    />
  )
}

// Sepolia addresses
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as const
const CUSTODY_CONTRACT_ADDRESS = "0xC2307D26194561eB939278456cF39a7AF0c115ea" as const

const custodyContractABI = [
  {
    inputs: [
      { name: "accounts", type: "address[]" },
      { name: "tokens", type: "address[]" },
    ],
    name: "getAccountsBalances",
    outputs: [{ name: "", type: "uint256[][]" }],
    stateMutability: "view",
    type: "function",
  },
] as const

const TIME_FRAMES = ["1D", "7D", "30D", "90D"] as const

const PIE_COLORS = {
  liquid: "#22c55e",
  nonLiquid: "hsl(174,62%,56%)",
}

export function PortfolioView() {
  const [selectedFrame, setSelectedFrame] = useState<(typeof TIME_FRAMES)[number]>("7D")
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  const { isConnected, address, chain } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { switchChainAsync } = useSwitchChain()
  const {
    unifiedBalances,
    ledgerEntries,
    refreshLedgerEntries,
    depositToCustody,
    withdrawFromCustody,
    withdrawStock,
    addToTradingBalance,
    withdrawFromTradingBalance,
    isAuthenticated,
    createAppSession,
    submitAppState,
    transfer,
  } = useYellowNetwork()

  // Backend wallet address for cross-chain withdrawals
  const BACKEND_WALLET_ADDRESS = "0x4888Eb840a7Ca93F49C9be3dD95Fc0EdA25bF0c6" as `0x${string}`
  const SOURCE_CHAIN_ID = 11155111 // Sepolia
  const { assets: quotedAssets } = useStockQuotes()

  const { data: usdcBalanceSepolia } = useBalance({
    address,
    token: USDC_BY_CHAIN[11155111],
    chainId: 11155111,
    query: { enabled: !!address },
  })
  const { data: usdcBalanceBase } = useBalance({
    address,
    token: USDC_BY_CHAIN[84532],
    chainId: 84532,
    query: { enabled: !!address },
  })
  const { data: usdcBalanceArbitrum } = useBalance({
    address,
    token: USDC_BY_CHAIN[421614],
    chainId: 421614,
    query: { enabled: !!address },
  })
  const { data: usdcBalanceOptimism } = useBalance({
    address,
    token: USDC_BY_CHAIN[11155420],
    chainId: 11155420,
    query: { enabled: !!address },
  })
  const { data: usdcBalanceArc } = useBalance({
    address,
    token: USDC_BY_CHAIN[5042002],
    chainId: 5042002,
    query: { enabled: !!address },
  })

  const walletBalancesByChain = useMemo(() => {
    const data = [
      usdcBalanceSepolia,
      usdcBalanceBase,
      usdcBalanceArbitrum,
      usdcBalanceOptimism,
      usdcBalanceArc,
    ]
    return CHAIN_OPTIONS.map((chain, i) => ({
      chain,
      balance: data[i]?.value
        ? parseFloat(formatUnits(data[i].value, data[i].decimals))
        : 0,
    }))
  }, [
    usdcBalanceSepolia,
    usdcBalanceBase,
    usdcBalanceArbitrum,
    usdcBalanceOptimism,
    usdcBalanceArc,
  ])

  const walletBalance = walletBalancesByChain.reduce((s, c) => s + c.balance, 0)

  const { data: custodyBalanceData } = useReadContract({
    address: CUSTODY_CONTRACT_ADDRESS,
    abi: custodyContractABI,
    functionName: "getAccountsBalances",
    args: address ? [[address], [USDC_ADDRESS]] : undefined,
    chainId: 11155111,
    query: { enabled: !!address },
  })

  const custodyBalance =
    custodyBalanceData && custodyBalanceData[0]?.[0]
      ? parseFloat(formatUnits(custodyBalanceData[0][0], 6))
      : 0

  const usdcUnified = unifiedBalances.find((b) => b.asset.toLowerCase() === "usdc")
  const unifiedUsdcBalance = usdcUnified ? parseFloat(usdcUnified.amount) : 0

  const liquidValue = walletBalance + custodyBalance + unifiedUsdcBalance

  // Stock holdings from unifiedBalances (non-USDC assets)
  const stockHoldings = useMemo(() => {
    const stocks = unifiedBalances.filter((b) => b.asset.toLowerCase() !== "usdc")
    return stocks
      .map((b) => {
        const ticker = b.asset.toUpperCase()
        const asset = getAssetByTicker(ticker) || ASSETS.find((a) => a.ticker.toUpperCase() === ticker)
        const quote = quotedAssets.find((q) => q.ticker.toUpperCase() === ticker)
        const price = quote?.price ?? asset?.price ?? 0
        const amount = parseFloat(b.amount)
        const value = amount * price
        return {
          ticker,
          name: asset?.name ?? ticker,
          price,
          amount,
          value,
          change24hPercent: quote?.change24hPercent ?? asset?.change24hPercent ?? 0,
        }
      })
      .filter((h) => h.amount > 0)
      .sort((a, b) => b.value - a.value)
  }, [unifiedBalances, quotedAssets])

  const nonLiquidValue = useMemo(() => stockHoldings.reduce((s, h) => s + h.value, 0), [stockHoldings])
  const totalPortfolioValue = liquidValue + nonLiquidValue

  const pieData = useMemo(() => {
    const data = [
      { name: "Liquid (Stablecoins)", value: Math.max(0, liquidValue), color: PIE_COLORS.liquid },
      { name: "Non-liquid (Stocks)", value: Math.max(0, nonLiquidValue), color: PIE_COLORS.nonLiquid },
    ]
    return data.filter((d) => d.value > 0)
  }, [liquidValue, nonLiquidValue])

  const hasPortfolio = totalPortfolioValue > 0

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Balance cards - prominent display */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-zinc-900/50 border border-white/10 p-8 shadow-sm hover:shadow-lg transition-all overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-15 group-hover:opacity-25 transition-opacity bg-blue-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-500/20 text-blue-400 shadow-inner">
                  <Wallet className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                    Wallet
                  </span>
                  <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-0.5" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                    ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-4" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>USDC across 5 chains — ready to deposit</p>
              {isConnected && (
                <div className="space-y-2 pt-4 border-t border-border">
                  {walletBalancesByChain.map(({ chain, balance }) => (
                    <div key={chain.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChainLogo chainId={chain.id} chainName={chain.name} />
                        <span className="text-zinc-400 truncate" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>{chain.name}</span>
                      </div>
                      <span className="font-semibold text-white flex-shrink-0" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[hsl(174,62%,56%)]/10 to-transparent border-2 border-[hsl(174,62%,56%)]/30 p-8 shadow-sm hover:shadow-lg transition-all overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-25 group-hover:opacity-35 transition-opacity" style={{ background: "hsl(174,62%,56%)" }} />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner bg-[hsl(174,62%,56%)]/20">
                  <Layers className="w-7 h-7 text-[hsl(174,62%,56%)]" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(174,62%,56%)]" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                    Trading
                  </span>
                  <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-0.5" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                    ${unifiedUsdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>Instant balance for orders — deposit to add funds</p>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-900/50 border border-white/10 p-8 shadow-sm hover:shadow-lg transition-all overflow-hidden relative group">
            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity bg-violet-500" />
            <div className="relative flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-violet-500/15 text-violet-400 shadow-inner">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                    Portfolio
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                  ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>Liquid (USDC)</span>
                  <span className="font-semibold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>${liquidValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>Stocks</span>
                  <span className="font-semibold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>${nonLiquidValue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
          <div
            className="flex items-center rounded-lg p-1 bg-zinc-900 border border-white/10 w-fit"
          >
            {TIME_FRAMES.map((frame) => (
              <button
                key={frame}
                onClick={() => setSelectedFrame(frame)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-md transition-all",
                  selectedFrame === frame
                    ? "bg-[hsl(174,62%,56%)] text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
                style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
              >
                {frame}
              </button>
            ))}
          </div>
          {isConnected && (
            <p className="text-sm text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
              Combined: <span className="font-semibold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>${liquidValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> USDC liquid
            </p>
          )}
        </div>
      </motion.div>

      {/* Main layout: 30% pie chart | 70% holdings table */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,30%)_1fr] gap-6 min-h-[500px]">
        {/* 30% - Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-zinc-900/50 border border-white/10 p-6 flex flex-col"
        >
          <h3
            className="text-xs font-semibold text-zinc-400 mb-4 uppercase tracking-wider"
            style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}
          >
            Asset Allocation
          </h3>
          <div className="flex-1 min-h-[240px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "hsla(174,62%,56%,0.1)" }}
                >
                  <Wallet className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-sm text-zinc-400 mb-2" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>No assets yet</p>
                <p className="text-xs text-zinc-400 max-w-[200px]" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                  Connect wallet and add funds to see your allocation
                </p>
              </div>
            )}
          </div>
          {hasPortfolio && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>Total portfolio</span>
                <span className="font-bold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>${totalPortfolioValue.toFixed(2)}</span>
              </div>
            </div>
          )}
          {isConnected && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="flex-1 min-w-[80px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-[hsl(174,62%,56%)] text-black hover:bg-[hsl(174,62%,66%)] transition-colors"
                style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
              >
                <Plus className="w-4 h-4" /> Deposit
              </button>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="flex-1 min-w-[80px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border-2 border-white/20 text-white hover:bg-white/5 transition-colors"
                style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
              >
                <ArrowUpFromLine className="w-4 h-4" /> Withdraw
              </button>
            </div>
          )}
        </motion.div>

        {/* 70% - Holdings table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl bg-zinc-900/50 border border-white/10 overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
              >
                Stock Holdings
              </h3>
              {isConnected && stockHoldings.length > 0 && (
                <p className="text-xs text-zinc-400 mt-0.5" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                  {stockHoldings.length} stock{stockHoldings.length !== 1 ? "s" : ""} held: {stockHoldings.map((h) => h.ticker).join(", ")}
                </p>
              )}
            </div>
          </div>

          {!isConnected ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
              <div
                className="relative w-28 h-28 mb-6 flex items-center justify-center rounded-2xl"
                style={{ background: "hsla(174,62%,56%,0.06)" }}
              >
                <Wallet className="w-14 h-14 text-muted-foreground/60" />
                <div
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "hsla(174,62%,56%,0.2)", color: "hsl(174,62%,56%)" }}
                >
                  <Settings className="w-4 h-4" />
                </div>
              </div>
              <p className="text-center text-zinc-400 mb-6 max-w-sm" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                Connect your wallet to view your portfolio
              </p>
              <button
                type="button"
                onClick={() => openConnectModal?.()}
                className="px-8 py-4 rounded-xl font-semibold text-black bg-[hsl(174,62%,56%)] hover:bg-[hsl(174,62%,66%)] transition-colors"
                style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
              >
                Connect wallet
              </button>
            </div>
          ) : !hasPortfolio && stockHoldings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              <p className="text-center text-zinc-400 mb-6" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                Deposit funds to start trading
              </p>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(true)}
                className="px-8 py-4 rounded-xl font-semibold text-black bg-[hsl(174,62%,56%)] hover:bg-[hsl(174,62%,66%)] transition-colors"
                style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
              >
                Deposit funds
              </button>
            </div>
          ) : stockHoldings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              <p className="text-center text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                No stock holdings. Trade on the Perpetuals page to open positions.
              </p>
              <Link
                href="/perpetuals"
                className="mt-4 px-8 py-4 rounded-xl font-semibold text-black bg-[hsl(174,62%,56%)] hover:bg-[hsl(174,62%,66%)] transition-colors"
                style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
              >
                Trade Perpetuals
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-900/30 text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                    <th className="text-left py-4 px-4">Asset</th>
                    <th className="text-right py-4 px-4">Price</th>
                    <th className="text-right py-4 px-4">Balance</th>
                    <th className="text-right py-4 px-4">Value</th>
                    <th className="text-right py-4 px-4">24h Change</th>
                    <th className="text-right py-4 px-4">Proportion</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHoldings.map((holding) => (
                    <tr
                      key={holding.ticker}
                      className="border-t border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <Link
                          href={`/markets/assets/${holding.ticker}`}
                          className="flex items-center gap-3 hover:text-[hsl(174,62%,56%)] transition-colors"
                        >
                          <img
                            src={`https://img.logokit.com/ticker/${holding.ticker}?token=${LOGOKIT_TOKEN}`}
                            alt={holding.ticker}
                            className="w-8 h-8 rounded-full object-cover bg-muted"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                          <div>
                            <span className="font-semibold text-white" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>{holding.ticker}</span>
                            <span className="block text-xs text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>{holding.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="text-right py-4 px-4 font-semibold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                        ${holding.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-4 px-4 text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                        {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td className="text-right py-4 px-4 font-bold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                        ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-semibold",
                            holding.change24hPercent >= 0 ? "text-emerald-500" : "text-red-500"
                          )}
                          style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}
                        >
                          {holding.change24hPercent >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {holding.change24hPercent >= 0 ? "+" : ""}
                          {holding.change24hPercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right py-4 px-4 text-zinc-400" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                        {totalPortfolioValue > 0
                          ? ((holding.value / totalPortfolioValue) * 100).toFixed(1)
                          : "0"}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail boxes below */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
      >
        <div
          className="rounded-xl bg-zinc-900/50 border border-white/10 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[hsl(174,62%,56%)]/15"
            >
              <BarChart3 className="w-4 h-4 text-[hsl(174,62%,56%)]" />
            </div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
              Total Trades
            </span>
          </div>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>--</p>
          <p className="text-xs text-zinc-400 mt-1" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>Lifetime trade count</p>
        </div>

        <div
          className="rounded-xl bg-zinc-900/50 border border-white/10 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/15"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
              7D Realized PnL
            </span>
          </div>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>$0.00</p>
          <p className="text-xs text-emerald-400 mt-1" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>0.00% this week</p>
        </div>

        <div
          className="rounded-xl bg-zinc-900/50 border border-white/10 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[hsl(174,62%,56%)]/15"
            >
              <Target className="w-4 h-4 text-[hsl(174,62%,56%)]" />
            </div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
              7D Win Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>0.00%</p>
          <p className="text-xs text-zinc-400 mt-1" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>Profitable trades</p>
        </div>

        <div
          className="rounded-xl bg-zinc-900/50 border border-white/10 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[hsl(174,62%,56%)]/15"
            >
              <Zap className="w-4 h-4 text-[hsl(174,62%,56%)]" />
            </div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
              Assets Held
            </span>
          </div>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
            {stockHoldings.length > 0 ? stockHoldings.length : 0}
          </p>
          <p className="text-xs text-zinc-400 mt-1" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
            {stockHoldings.length === 1 ? "Unique position" : "Unique positions"}
          </p>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-6"
      >
        <TransactionHistory
          ledgerEntries={ledgerEntries}
          refreshLedgerEntries={refreshLedgerEntries}
          isAuthenticated={!!isAuthenticated}
        />
      </motion.div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onConfirm={async (payload: DepositPayload) => {
          if (payload.type === "usdc") {
            try {
              // Switch to selected chain if different from current chain
              if (chain?.id !== payload.chainId) {
                const chainName = CHAIN_OPTIONS.find(c => c.chainId === payload.chainId)?.name || payload.chain
                toast.info(`Switching to ${chainName}...`)
                await switchChainAsync({ chainId: payload.chainId })
                // Wait a moment for chain switch to complete and NitroliteClient to reinitialize
                await new Promise(resolve => setTimeout(resolve, 1500))
              }

              // Step 1: Deposit to custody (on-chain)
              toast.info("Step 1/2: Depositing to custody...")
              await depositToCustody(payload.amount)

              // Step 2: Automatically add funds to trading balance
              toast.info("Step 2/2: Adding funds to trading balance...")
              await addToTradingBalance(payload.amount)

              toast.success(`Successfully deposited $${payload.amount} USDC to trading balance!`)
            } catch (error) {
              console.error("Deposit flow failed:", error)
              toast.error("Deposit failed. Please check your balances and try again.")
            }
          } else {
            toast.info(`${payload.stock} deposit on ${payload.chain} — stock token deposits coming soon`)
          }
        }}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={unifiedUsdcBalance}
        stockHoldings={stockHoldings.map(h => {
          const asset = getAssetByTicker(h.ticker)
          return {
            ticker: h.ticker,
            name: h.name,
            amount: h.amount,
            chainId: asset?.chainId || 11155111,
            address: asset?.address || "",
          }
        })}
        onConfirm={async (payload: WithdrawPayload) => {
          try {
            // Handle stock withdrawals
            if (payload.type === "stock") {
              if (!payload.ticker || !payload.address || !payload.chainId) {
                toast.error("Stock ticker, address or chain not found")
                return
              }

              // Use the withdrawStock function (creates channel, resizes, withdraws from custody)
              await withdrawStock(payload.ticker, payload.address, payload.chainId, payload.amount)
              return
            }

            // Handle USDC withdrawals (existing logic)
            const isCrossChain = payload.chainId !== SOURCE_CHAIN_ID

            if (isCrossChain) {
              // Cross-chain withdrawal flow
              toast.info("Initiating cross-chain withdrawal via CCTP...")

              // Step 1: Create app session with backend for cross-chain withdrawal
              toast.info("Step 1/4: Creating withdrawal session...")
              const { appSessionId } = await createAppSession(
                [address!, BACKEND_WALLET_ADDRESS],
                [
                  { participant: address!, asset: "usdc", amount: "0" },
                  { participant: BACKEND_WALLET_ADDRESS, asset: "usdc", amount: "0" },
                ],
                "Median App" // Must match the session key application name
              )

              // Step 2: Submit app state with withdrawal details
              toast.info("Step 2/4: Submitting withdrawal request...")
              await submitAppState(
                appSessionId,
                [
                  { participant: address!, asset: "usdc", amount: "0" },
                  { participant: BACKEND_WALLET_ADDRESS, asset: "usdc", amount: "0" },
                ],
                "operate",
                {
                  action: "crossChainWithdrawal",
                  sourceChainId: SOURCE_CHAIN_ID,
                  destChainId: payload.chainId,
                  amount: payload.amount,
                  userWallet: address,
                }
              )

              // Step 3: Transfer funds to backend
              toast.info("Step 3/4: Transferring funds for bridging...")
              await transfer(BACKEND_WALLET_ADDRESS, [
                { asset: "usdc", amount: payload.amount }
              ])

              toast.success(
                `Cross-chain withdrawal initiated! ${payload.amount} USDC will be bridged to ${payload.chain}. This may take 10-20 minutes.`
              )
            } else {
              // Same-chain withdrawal flow
              toast.info("Step 1/2: Withdrawing from trading balance...")
              await withdrawFromTradingBalance(payload.amount)

              toast.info("Step 2/2: Withdrawing from custody to wallet...")
              await withdrawFromCustody(payload.amount)

              toast.success(`Successfully withdrew $${payload.amount} USDC to your wallet!`)
            }
          } catch (error) {
            console.error("Withdraw flow failed:", error)
            toast.error("Withdrawal failed. Please check your balances and try again.")
          }
        }}
      />
    </div>
  )
}
