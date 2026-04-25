/**
 * Supplementary market data from free public APIs
 * DexScreener API is free, no key required, and provides price/volume/liquidity
 */

import type { MarketData } from '@/types/token';

const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';

interface DexScreenerPair {
  chainId: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceNative: string; // Price in SOL
  volume: { h24: number };
  priceChange: { h24: number; h6: number; h1: number };
  liquidity: { usd: number };
  fdv: number;
  txns: { h24: { buys: number; sells: number } };
}

interface DexScreenerResponse {
  pairs: DexScreenerPair[] | null;
}

/**
 * Get market data for a single token from DexScreener (free, no API key)
 */
export async function getTokenMarketData(tokenMint: string): Promise<MarketData | null> {
  try {
    const res = await fetch(`${DEXSCREENER_BASE}/tokens/${tokenMint}`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) return null;

    const data: DexScreenerResponse = await res.json();
    if (!data.pairs || data.pairs.length === 0) return null;

    // Get the pair with highest liquidity on Solana
    const pair = data.pairs
      .filter(p => p.chainId === 'solana')
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

    if (!pair) return null;

    return {
      address: tokenMint,
      priceUsd: parseFloat(pair.priceUsd) || 0,
      priceSOL: parseFloat(pair.priceNative) || 0,
      volume24h: pair.volume?.h24 || 0,
      change24h: (pair.priceChange?.h24 || 0) / 100,
      change7d: 0, // DexScreener doesn't provide 7d directly
      marketCap: pair.fdv || 0,
      holders: 0, // Will be fetched from Solana RPC
      tradeCount24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
    };
  } catch (error) {
    console.error(`DexScreener fetch failed for ${tokenMint}:`, error);
    return null;
  }
}

/**
 * Batch fetch market data for multiple tokens
 * DexScreener supports up to 30 addresses in a single call
 */
export async function getBatchMarketData(tokenMints: string[]): Promise<Map<string, MarketData>> {
  const results = new Map<string, MarketData>();

  // DexScreener batch endpoint: comma-separated addresses, max 30
  const chunks: string[][] = [];
  for (let i = 0; i < tokenMints.length; i += 30) {
    chunks.push(tokenMints.slice(i, i + 30));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const addresses = chunk.join(',');
        const res = await fetch(`${DEXSCREENER_BASE}/tokens/${addresses}`, {
          next: { revalidate: 30 },
        });

        if (!res.ok) return;

        const data: DexScreenerResponse = await res.json();
        if (!data.pairs) return;

        // Group by token address and pick the highest liquidity pair
        const tokenPairs = new Map<string, DexScreenerPair>();
        for (const pair of data.pairs) {
          if (pair.chainId !== 'solana') continue;
          const addr = pair.baseToken.address;
          const existing = tokenPairs.get(addr);
          if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
            tokenPairs.set(addr, pair);
          }
        }

        for (const [addr, pair] of tokenPairs.entries()) {
          results.set(addr, {
            address: addr,
            priceUsd: parseFloat(pair.priceUsd) || 0,
            priceSOL: parseFloat(pair.priceNative) || 0,
            volume24h: pair.volume?.h24 || 0,
            change24h: (pair.priceChange?.h24 || 0) / 100,
            change7d: 0,
            marketCap: pair.fdv || 0,
            holders: 0,
            tradeCount24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
          });
        }
      } catch (error) {
        console.error('DexScreener batch fetch failed:', error);
      }
    })
  );

  return results;
}
