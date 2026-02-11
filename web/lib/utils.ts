import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LOGOKIT_TOKEN = "pk_frfbe2dd55bc04b3d4d1bc"
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY ?? ""

export function getStockLogoUrl(ticker: string): string {
  return `https://img.logokit.com/ticker/${ticker}?token=${LOGOKIT_TOKEN}`
}

export function getCryptoLogoUrl(ticker: string): string {
  const lower = ticker.toLowerCase()
  // Logos from logo.dev (crypto only)
  if (!LOGO_DEV_TOKEN) {
    // Fallback to no-token URL if env is missing
    return `https://img.logo.dev/crypto/${lower}`
  }
  return `https://img.logo.dev/crypto/${lower}?token=${LOGO_DEV_TOKEN}`
}
