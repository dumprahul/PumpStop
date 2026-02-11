"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { RainbowConnectButton } from "./ConnectButton"

const NAV_LINKS = [
  { name: "Markets", href: "/markets" },
  { name: "Perpetuals", href: "/perpetuals" },
  { name: "Portfolio", href: "/portfolio" },
] as const

export const PortfolioNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => setIsMobileMenuOpen((open) => !open)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleAnchorClick = (href: string) => {
    if (!href.startsWith("#")) return
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-xl border-b border-white/10"
          : "bg-black/70 backdrop-blur-xl"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-foreground hover:text-[hsl(174,62%,56%)] transition-colors duration-200 flex items-center gap-2"
            style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans), Space Grotesk, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              PumpStop
            </span>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[15px] font-medium text-zinc-300 hover:text-white transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/5"
                    style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    type="button"
                    onClick={() => handleAnchorClick(link.href)}
                    className="text-[15px] font-medium text-zinc-300 hover:text-white transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/5"
                    style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
                  >
                    {link.name}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Right controls: wallet */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/portfolio"
              className="text-sm font-semibold text-zinc-300 hover:text-[hsl(174,62%,56%)] transition-colors px-4 py-2"
              style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
            >
              Sign In
            </Link>
            <div
              className="rounded-xl px-4 py-2"
              style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
            >
              <RainbowConnectButton />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleMobileMenu}
              className="text-foreground hover:text-primary p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border"
          >
            <div className="px-6 py-4 space-y-3">
              {NAV_LINKS.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block w-full text-left text-foreground hover:text-primary py-2.5 text-base font-medium"
                    style={{ fontFamily: "Figtree, sans-serif" }}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    type="button"
                    onClick={() => {
                      handleAnchorClick(link.href)
                      closeMobileMenu()
                    }}
                    className="block w-full text-left text-foreground hover:text-primary py-2.5 text-base font-medium"
                    style={{ fontFamily: "Figtree, sans-serif" }}
                  >
                    {link.name}
                  </button>
                )
              )}
              <div className="pt-3 border-t border-border">
                <div className="rounded-2xl bg-white/5 border border-white/10 px-2 py-2 backdrop-blur-xl">
                  <div className="[&_button]:!w-full [&_button]:!justify-center [&_button]:!rounded-full">
                    <RainbowConnectButton />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

