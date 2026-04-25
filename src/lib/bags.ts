/**
 * Bags API Client — Typed wrapper around the real Bags REST API
 * Base URL: https://public-api-v2.bags.fm/api/v1/
 * Auth: x-api-key header
 */

import type {
  BagsApiResponse,
  BagsTokenLaunch,
  BagsPool,
  ClaimablePosition,
  TokenClaimEvent,
} from '@/types/bags-api';

const BASE_URL = process.env.BAGS_API_BASE_URL || 'https://public-api-v2.bags.fm/api/v1';
const API_KEY = process.env.BAGS_API_KEY || '';

async function bagsRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: { revalidate: 30 }, // Cache for 30 seconds in Next.js
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Bags API error ${res.status}: ${errorText}`);
  }

  const data: BagsApiResponse<T> = await res.json();

  if (!data.success) {
    throw new Error(`Bags API returned error: ${data.error || 'Unknown error'}`);
  }

  return data.response;
}

/**
 * Get all launched tokens from the Bags platform
 * GET /token-launch/feed
 */
export async function getTokenLaunchFeed(): Promise<BagsTokenLaunch[]> {
  return bagsRequest<BagsTokenLaunch[]>('/token-launch/feed');
}

/**
 * Get all Bags pools (token liquidity pools)
 * GET /solana/bags/pools
 */
export async function getBagsPools(onlyMigrated?: boolean): Promise<BagsPool[]> {
  const query = onlyMigrated ? '?only-migrated=true' : '';
  return bagsRequest<BagsPool[]>(`/solana/bags/pools${query}`);
}

/**
 * Get a specific pool by its token mint address
 * GET /solana/bags/pool/{tokenMint}
 */
export async function getPoolByTokenMint(tokenMint: string): Promise<BagsPool> {
  return bagsRequest<BagsPool>(`/solana/bags/pool/${tokenMint}`);
}

/**
 * Get claimable fee positions for a wallet
 * GET /fees/claimable-positions?wallet={publicKey}
 */
export async function getClaimablePositions(wallet: string): Promise<ClaimablePosition[]> {
  return bagsRequest<ClaimablePosition[]>(`/fees/claimable-positions?wallet=${wallet}`);
}

/**
 * Get token claim events (fee claim history)
 * GET /analytics/claims/events
 */
export async function getTokenClaimEvents(tokenMint?: string): Promise<TokenClaimEvent[]> {
  const query = tokenMint ? `?tokenMint=${tokenMint}` : '';
  return bagsRequest<TokenClaimEvent[]>(`/analytics/claims/events${query}`);
}

/**
 * Get token launch creators
 * GET /analytics/token-launch-creators
 */
export async function getTokenLaunchCreators(): Promise<unknown[]> {
  return bagsRequest<unknown[]>('/analytics/token-launch-creators');
}

/**
 * Health check
 */
export async function ping(): Promise<{ message: string }> {
  const res = await fetch('https://public-api-v2.bags.fm/ping');
  return res.json();
}
