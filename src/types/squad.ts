export interface Squad {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  members: SquadMember[];
  stats: SquadStats;
  createdAt: string;
}

export interface SquadMember {
  walletAddress: string;
  displayName?: string;
  holdings: import('./token').TokenHolding[];
  weekPerformance: number;
  curatorScore: number;
  badges: Badge[];
}

export interface SquadStats {
  combinedValueSOL: number;
  totalTokensHeld: number;
  sharedPicks: SharedPick[];
  squadRank: number;
  weekPerformance: number;
}

export interface SharedPick {
  tokenAddress: string;
  symbol: string;
  memberCount: number;
  overlapPercent: number;
  change7d: number;
}

export type Badge =
  | 'top_curator'
  | 'early_buyer'
  | 'diamond_hands'
  | 'whale'
  | 'trendsetter';
