import { NextRequest, NextResponse } from 'next/server';
import { getAllTokensWithMomentum } from '@/lib/token-aggregator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'momentum';
    const limit = parseInt(searchParams.get('limit') || '250', 10);

    let tokens = await getAllTokensWithMomentum();

    // Sort
    switch (sort) {
      case 'volume':
        tokens.sort((a, b) => b.volume24h - a.volume24h);
        break;
      case 'holders':
        tokens.sort((a, b) => b.holders - a.holders);
        break;
      case 'change24h':
        tokens.sort((a, b) => b.change24h - a.change24h);
        break;
      case 'momentum':
      default:
        tokens.sort((a, b) => b.momentum - a.momentum);
        break;
    }

    // Limit
    tokens = tokens.slice(0, Math.min(limit, 500));

    return NextResponse.json({
      tokens,
      updatedAt: new Date().toISOString(),
      totalTokens: tokens.length,
    });
  } catch (error) {
    console.error('GET /api/tokens error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens', tokens: [], totalTokens: 0 },
      { status: 500 }
    );
  }
}
