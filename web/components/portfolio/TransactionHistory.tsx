"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { History, ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LedgerEntry } from "@/lib/yellowNetwork/types"

interface TransactionHistoryProps {
  ledgerEntries: LedgerEntry[]
  refreshLedgerEntries: () => Promise<void>
  isAuthenticated: boolean
}

function formatDate(createdAt: string) {
  try {
    const d = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return createdAt
  }
}

function getTransactionLabel(entry: LedgerEntry): string {
  const credit = parseFloat(entry.credit || "0")
  const debit = parseFloat(entry.debit || "0")
  if (credit > 0 && debit === 0) return "Credit"
  if (debit > 0 && credit === 0) return "Debit"
  return "Transfer"
}

export function TransactionHistory({
  ledgerEntries,
  refreshLedgerEntries,
  isAuthenticated,
}: TransactionHistoryProps) {
  useEffect(() => {
    if (isAuthenticated) {
      refreshLedgerEntries()
    }
  }, [isAuthenticated, refreshLedgerEntries])

  const sortedEntries = [...ledgerEntries].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl bg-zinc-900/50 border border-white/10 overflow-hidden"
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
          <History className="w-5 h-5 text-zinc-400" />
          Transaction History
        </h3>
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => refreshLedgerEntries()}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {!isAuthenticated ? (
          <div className="p-8 text-center">
            <History className="w-12 h-12 mx-auto mb-3 text-zinc-500" />
            <p className="text-sm text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
              Connect and authenticate to view transaction history
            </p>
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-12 h-12 mx-auto mb-3 text-zinc-500" />
            <p className="text-sm text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
              No transactions yet
            </p>
            <p className="text-xs text-zinc-400 mt-1" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
              Deposits, withdrawals, and trades will appear here
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-zinc-900/30 sticky top-0">
              <tr className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Asset</th>
                <th className="text-right py-3 px-4">Amount</th>
                <th className="text-right py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry) => {
                const credit = parseFloat(entry.credit || "0")
                const debit = parseFloat(entry.debit || "0")
                const isCredit = credit > 0
                const amount = isCredit ? credit : debit
                const label = getTransactionLabel(entry)

                return (
                  <tr
                    key={entry.id}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-lg",
                            isCredit
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-amber-500/15 text-amber-400"
                          )}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                          {label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-white font-semibold uppercase" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                        {entry.asset || "—"}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right text-sm font-bold",
                        isCredit ? "text-emerald-400" : "text-amber-400"
                      )}
                      style={{ fontFamily: "var(--font-mono), JetBrains Mono, monospace" }}
                    >
                      {isCredit ? "+" : "-"}
                      {amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                      {formatDate(entry.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}
