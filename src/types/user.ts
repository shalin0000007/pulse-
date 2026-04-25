import type { Badge } from './squad';
import type { BagsToken } from './token';

export interface PulseUser {
  id: string;
  walletAddress: string;
  username?: string;
  xHandle?: string;
  curatorScore: number;
  feeShareEarned: number;
  badges: Badge[];
  squads: string[];
  topPick?: BagsToken;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username?: string;
  curatorScore: number;
  topPick: string;
  weekPerformance: number;
  badges: Badge[];
}
