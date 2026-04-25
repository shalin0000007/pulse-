// Unified token type used throughout the app (combines Bags API + supplementary data)

export interface BagsToken {
  address: string;           // tokenMint from Bags
  symbol: string;
  name: string;
  creatorName: string;
  image: string;
  twitter: string;
  website: string;
  status: string;
  price: number;             // SOL — from DexScreener/on-chain
  marketCap: number;         // SOL
  volume24h: number;         // SOL
  volumeAvg7d: number;
  holders: number;
  holderChange24h: number;
  tradeCount24h: number;
  tradeCountAvg7d: number;
  change24h: number;         // Decimal: 0.31 = +31%
  change7d: number;
  momentum: number;          // Computed: -1 to +1
  poolKey: string;
  dbcConfigKey: string;
}

export interface TokenHolding {
  tokenAddress: string;
  symbol: string;
  name: string;
  balance: number;
  valueSOL: number;
  change7d: number;
}

export interface MarketData {
  address: string;
  priceUsd: number;
  priceSOL: number;
  volume24h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  holders: number;
  tradeCount24h: number;
}

export interface TokenWithHistory extends BagsToken {
  priceHistory7d: number[];
}
