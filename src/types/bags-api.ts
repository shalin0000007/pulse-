// Types matching the REAL Bags API response shapes

export interface BagsTokenLaunch {
  name: string;
  symbol: string;
  description: string;
  image: string;
  tokenMint: string;
  status: 'PRE_LAUNCH' | 'PRE_GRAD' | 'GRADUATED' | 'FAILED';
  twitter: string;
  website: string;
  launchSignature: string;
  accountKeys: string[];
  numRequiredSigners: number;
  uri: string;
  dbcPoolKey: string;
  dbcConfigKey: string;
}

export interface BagsPool {
  tokenMint: string;
  dbcConfigKey: string;
  dbcPoolKey: string;
  dammV2PoolKey: string;
}

export interface BagsApiResponse<T> {
  success: boolean;
  response: T;
  error?: string;
}

export interface ClaimablePosition {
  tokenMint: string;
  claimableAmount: number;
  poolKey: string;
}

export interface TokenLifetimeFees {
  tokenMint: string;
  totalFees: number;
  claimedFees: number;
  unclaimedFees: number;
}

export interface TokenClaimEvent {
  tokenMint: string;
  claimer: string;
  amount: number;
  timestamp: string;
  signature: string;
}

export interface TradeQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageMode: 'auto' | 'manual';
  slippageBps?: number;
}
