import { NextRequest, NextResponse } from 'next/server';
import { getClaimablePositions } from '@/lib/bags';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'wallet parameter required' }, { status: 400 });
    }

    const positions = await getClaimablePositions(wallet);

    const totalEarned = positions.reduce((sum, p) => sum + (p.claimableAmount || 0), 0);
    const bestToken = positions.length > 0
      ? positions.sort((a, b) => (b.claimableAmount || 0) - (a.claimableAmount || 0))[0]
      : null;

    return NextResponse.json({
      totalEarned,
      positions,
      bestToken: bestToken?.tokenMint || null,
      positionCount: positions.length,
    });
  } catch (error) {
    console.error('GET /api/fee-share error:', error);
    return NextResponse.json(
      { totalEarned: 0, positions: [], bestToken: null, positionCount: 0 },
      { status: 200 } // Return empty data, not 500 — graceful fallback
    );
  }
}
