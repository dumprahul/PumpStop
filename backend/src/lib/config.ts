import { sepolia } from 'viem/chains';

export const CHAIN_ID = sepolia.id;
export const USDC_TOKEN = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`;
export const AUTH_SCOPE = 'Median App';
export const SESSION_DURATION = 3600; // 1 hour in seconds

// Alchemy RPC configuration
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '';
export const ALCHEMY_RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Multi-chain configuration for CCTP cross-chain transfers
export const SUPPORTED_CHAINS = {
    sepolia: {
        id: 11155111,
        name: 'Ethereum Sepolia',
        rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        usdcToken: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`,
        custody: '0xC2307D26194561eB939278456cF39a7AF0c115ea' as `0x${string}`,
        adjudicator: '0xf6eAD00841dBcdd191dB142e54429D60ce824a8E' as `0x${string}`,
    },
    baseSepolia: {
        id: 84532,
        name: 'Base Sepolia',
        rpcUrl: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        usdcToken: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
        custody: '0xC2307D26194561eB939278456cF39a7AF0c115ea' as `0x${string}`,
        adjudicator: '0xf6eAD00841dBcdd191dB142e54429D60ce824a8E' as `0x${string}`,
    },
    arbitrumSepolia: {
        id: 421614,
        name: 'Arbitrum Sepolia',
        rpcUrl: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        usdcToken: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d' as `0x${string}`,
        custody: '0xC2307D26194561eB939278456cF39a7AF0c115ea' as `0x${string}`,
        adjudicator: '0xf6eAD00841dBcdd191dB142e54429D60ce824a8E' as `0x${string}`,
    },
    optimismSepolia: {
        id: 11155420,
        name: 'Optimism Sepolia',
        rpcUrl: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        usdcToken: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7' as `0x${string}`,
        custody: '0xC2307D26194561eB939278456cF39a7AF0c115ea' as `0x${string}`,
        adjudicator: '0xf6eAD00841dBcdd191dB142e54429D60ce824a8E' as `0x${string}`,
    },
} as const;

export type ChainConfig = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS];

export function getChainById(chainId: number): ChainConfig | undefined {
    return Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId);
}

export function getChainByName(name: keyof typeof SUPPORTED_CHAINS): ChainConfig {
    return SUPPORTED_CHAINS[name];
}

export const SUPPORTED_TICKERS = [
    'BTC', 'ETH', 'SOL', 'LINK', 'SUI', 'DOGE', 'XRP', 'AVAX', 'ATOM', 'ADA',
    'DOT', 'LTC', 'ARB', 'OP', 'PEPE', 'WIF', 'BONK', 'SEI', 'APT', 'FIL',
    'NEAR', 'INJ', 'TIA',
    // Custom community tokens
    'IHAI', 'CTDL', 'PBNB', 'BABYMOLT', 'IDEA', 'CLAW',
    'LIFE', 'STOCK', 'KIN', 'ROBIN', 'BASE', 'JEWDENG',
] as const;

export const AUTH_ALLOWANCES = [
    { asset: 'usdc', amount: '100000000000' },
    ...SUPPORTED_TICKERS.map(ticker => ({ asset: ticker, amount: '100000000000' })),
];

// Custom tokens use robinpump.fun for pricing instead of Bybit
export const CUSTOM_TOKEN_TICKERS = new Set([
    'IHAI', 'CTDL', 'PBNB', 'BABYMOLT', 'IDEA', 'CLAW',
    'LIFE', 'STOCK', 'KIN', 'ROBIN', 'BASE', 'JEWDENG',
]);

export const CUSTOM_PRICE_ADDRESS = '0xf0973c2fa6a5a140f9fa38a378b670623b5c6d6b';

export function isCustomToken(ticker: string): boolean {
    return CUSTOM_TOKEN_TICKERS.has(ticker.toUpperCase());
}

export default function getContractAddresses() {
    return {
        custody: '0xC2307D26194561eB939278456cF39a7AF0c115ea',
        adjudicator: '0xf6eAD00841dBcdd191dB142e54429D60ce824a8E',
    }
}