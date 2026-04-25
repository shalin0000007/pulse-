/**
 * Token momentum scoring algorithm
 * Scores tokens from -1 (strong sell signal) to +1 (strong buy signal)
 * Based on volume, holder, and trade velocity ratios
 */

import type { BagsToken } from '@/types/token';

export function computeMomentum(token: Partial<BagsToken>): number {
  const volumeScore = (token.volume24h || 0) / (token.volumeAvg7d || 1);
  const holderScore = ((token.holderChange24h || 0) / (token.holders || 1)) * 10;
  const tradeScore = (token.tradeCount24h || 0) / (token.tradeCountAvg7d || 1);

  // Weighted composite
  const raw = volumeScore * 0.4 + holderScore * 0.3 + tradeScore * 0.3;

  // Normalize to -1..+1 range
  return Math.max(-1, Math.min(1, (raw - 1) / 2));
}

export function momentumToColor(score: number): string {
  if (score > 0.5) return '#065F46';    // Teal 800 — strong bullish
  if (score > 0.2) return '#0F766E';    // Teal 600
  if (score > 0) return '#14B8A6';      // Teal 400
  if (score > -0.2) return '#374151';   // Neutral gray
  if (score > -0.5) return '#EA580C';   // Coral 500
  return '#C2410C';                      // Coral 700 — strong bearish
}

export function momentumToBgClass(score: number): string {
  if (score > 0.5) return 'bg-teal-800';
  if (score > 0.2) return 'bg-teal-600';
  if (score > 0) return 'bg-teal-400/20';
  if (score > -0.2) return 'bg-zinc-700';
  if (score > -0.5) return 'bg-orange-600';
  return 'bg-orange-800';
}

export function momentumToLabel(score: number): string {
  if (score > 0.5) return 'Strong Buy';
  if (score > 0.2) return 'Bullish';
  if (score > 0) return 'Slightly Bullish';
  if (score > -0.2) return 'Neutral';
  if (score > -0.5) return 'Bearish';
  return 'Strong Sell';
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${(change * 100).toFixed(1)}%`;
}

export function formatPrice(price: number): string {
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toFixed(1);
}
