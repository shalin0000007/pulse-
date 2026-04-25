import { NextResponse } from 'next/server';

// Stub leaderboard — real data in Week 2
export async function GET() {
  const stubLeaderboard = Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    walletAddress: `${randomAddress()}`,
    username: null,
    curatorScore: parseFloat((Math.random() * 100).toFixed(2)),
    topPick: ['MAISON', 'PULSE', 'ALPHA', 'OMEGA', 'SIGMA'][Math.floor(Math.random() * 5)],
    weekPerformance: parseFloat((Math.random() * 0.5 - 0.1).toFixed(4)),
    badges: [],
  }));

  return NextResponse.json({
    leaderboard: stubLeaderboard,
    updatedAt: new Date().toISOString(),
  });
}

function randomAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
