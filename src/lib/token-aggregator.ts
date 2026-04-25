/**
 * Token Aggregator — combines Bags API + DexScreener + momentum scoring
 * into the unified BagsToken[] array used by the heatmap and all UI
 */

import type { BagsToken } from '@/types/token';
import { getTokenLaunchFeed } from './bags';
import { getBatchMarketData } from './dex-data';
import { computeMomentum } from './momentum';
import { cache, CACHE_TTL } from './cache';

const CACHE_KEY = 'all_tokens_with_momentum';

/**
 * Get all Bags tokens with momentum scores
 * 1. Fetch launched tokens from Bags API
 * 2. Batch-fetch market data from DexScreener
 * 3. Merge + compute momentum
 * 4. Sort by momentum descending
 */
export async function getAllTokensWithMomentum(): Promise<BagsToken[]> {
  // Check cache first
  const cached = cache.get<BagsToken[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    // Step 1: Get all launched tokens from Bags
    const launches = await getTokenLaunchFeed();

    // Filter to only active tokens (PRE_GRAD or GRADUATED)
    const activeTokens = launches.filter(
      t => t.status === 'PRE_GRAD' || t.status === 'GRADUATED'
    );

    if (activeTokens.length === 0) {
      return [];
    }

    // Step 2: Get market data for all tokens from DexScreener
    const tokenMints = activeTokens.map(t => t.tokenMint);
    const marketDataMap = await getBatchMarketData(tokenMints);

    // Step 3: Merge and compute momentum
    const tokens: BagsToken[] = activeTokens.map(launch => {
      const market = marketDataMap.get(launch.tokenMint);

      const token: BagsToken = {
        address: launch.tokenMint,
        symbol: launch.symbol,
        name: launch.name,
        creatorName: launch.name,
        image: launch.image,
        twitter: launch.twitter || '',
        website: launch.website || '',
        status: launch.status,
        price: market?.priceSOL || 0,
        marketCap: market?.marketCap || 0,
        volume24h: market?.volume24h || 0,
        volumeAvg7d: (market?.volume24h || 0) * 0.8, // Estimate: assume today is ~1.25x avg
        holders: market?.holders || 0,
        holderChange24h: 0,
        tradeCount24h: market?.tradeCount24h || 0,
        tradeCountAvg7d: (market?.tradeCount24h || 0) * 0.8,
        change24h: market?.change24h || 0,
        change7d: market?.change7d || 0,
        momentum: 0,
        poolKey: launch.dbcPoolKey,
        dbcConfigKey: launch.dbcConfigKey,
      };

      token.momentum = computeMomentum(token);
      return token;
    });

    // Step 4: Sort by momentum descending
    tokens.sort((a, b) => b.momentum - a.momentum);

    // Cache the result
    cache.set(CACHE_KEY, tokens, CACHE_TTL.TOKENS);

    return tokens;
  } catch (error) {
    console.error('Failed to aggregate tokens:', error);
    return [];
  }
}
