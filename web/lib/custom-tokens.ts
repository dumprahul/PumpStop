// Single source of truth for custom community tokens.
// These tokens use the robinpump.fun API for prices instead of Bybit.

export const CUSTOM_PRICE_ADDRESS = "0xf0973c2fa6a5a140f9fa38a378b670623b5c6d6b"

export type CustomToken = {
  ticker: string
  name: string
  address: string
  chainId: number
}

export const CUSTOM_TOKENS: CustomToken[] = [
  // Sepolia (chain ID: 11155111)
  { ticker: "IHAI", name: "I have an idea", address: "0x486aeF528736F932E4C3538C8D208C0d12336D17", chainId: 11155111 },
  { ticker: "CTDL", name: "AI Market Maker", address: "0x8C2AB5976C68710D96190E7016eF13e25A8EE418", chainId: 11155111 },
  { ticker: "PBNB", name: "PetsBNB", address: "0x1E61Fa5969F47F7e8622053Ad45baC9E0D0E5532", chainId: 11155111 },
  { ticker: "BABYMOLT", name: "babymolt", address: "0xBA24952E81861A7c8969f8436De538c8E1724d1A", chainId: 11155111 },
  { ticker: "IDEA", name: "Idea Coins", address: "0x259f44E3E4AadD3aBc1cb996CE6D99FE85f2807e", chainId: 11155111 },
  { ticker: "CLAW", name: "OpenClaw", address: "0xC356Fbfbc22c2298d39961Cb68751Fb0f35BF4B8", chainId: 11155111 },
  // Base Sepolia (chain ID: 84532)
  { ticker: "LIFE", name: "SENFINA", address: "0x5eF594D3a2812fc62cCFeFf9D0632dFdf604545A", chainId: 84532 },
  { ticker: "STOCK", name: "24 Hour Stock Trader", address: "0xE6407dC763840A474314f210120e3d14e6b7d08A", chainId: 84532 },
  { ticker: "KIN", name: "KIN", address: "0xB8322Cf6a18F74Fb8BfcD7657081adB5DDff776d", chainId: 84532 },
  { ticker: "ROBIN", name: "Robinpump", address: "0xFcb67b2f8585357e0C3c8F2B51b4247D344c6499", chainId: 84532 },
  { ticker: "BASE", name: "Base", address: "0x0f43c0e06ACC4E15bEd78507bB627DEE84f485cB", chainId: 84532 },
  { ticker: "JEWDENG", name: "JEWDENG", address: "0x6Cd9e4642aaF902342Afe7762D6da60Ca9591324", chainId: 84532 },
]

export const CUSTOM_TOKEN_TICKERS = new Set(CUSTOM_TOKENS.map((t) => t.ticker))

export function isCustomToken(ticker: string): boolean {
  return CUSTOM_TOKEN_TICKERS.has(ticker.toUpperCase())
}
