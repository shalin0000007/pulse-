import { NextRequest, NextResponse } from 'next/server';
import { getTokenLaunchFeed } from '@/lib/bags';
import { getTokenMarketData } from '@/lib/dex-data';
import { computeMomentum } from '@/lib/momentum';
import { cache, CACHE_TTL } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const cacheKey = `token_detail_${address}`;

    // Check cache
    const cached = cache.get<Record<string, unknown>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Get token info from Bags
    const launches = await getTokenLaunchFeed();
    const launch = launches.find(t => t.tokenMint === address);

    if (!launch) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Get market data
    const market = await getTokenMarketData(address);

    const token = {
      address: launch.tokenMint,
      symbol: launch.symbol,
      name: launch.name,
      description: launch.description,
      image: launch.image,
      twitter: launch.twitter || '',
      website: launch.website || '',
      status: launch.status,
      uri: launch.uri,
      poolKey: launch.dbcPoolKey,
      dbcConfigKey: launch.dbcConfigKey,
      price: market?.priceSOL || 0,
      priceUsd: market?.priceUsd || 0,
      marketCap: market?.marketCap || 0,
      volume24h: market?.volume24h || 0,
      change24h: market?.change24h || 0,
      holders: market?.holders || 0,
      tradeCount24h: market?.tradeCount24h || 0,
      momentum: 0,
    };

    token.momentum = computeMomentum({
      volume24h: token.volume24h,
      volumeAvg7d: token.volume24h * 0.8,
      holderChange24h: 0,
      holders: token.holders,
      tradeCount24h: token.tradeCount24h,
      tradeCountAvg7d: token.tradeCount24h * 0.8,
    });

    const result = { token, updatedAt: new Date().toISOString() };
    cache.set(cacheKey, result, CACHE_TTL.TOKENS);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/token/[address] error:', error);
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}
