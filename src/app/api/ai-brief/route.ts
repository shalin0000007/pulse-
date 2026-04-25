import { NextRequest, NextResponse } from 'next/server';
import { cache, CACHE_TTL } from '@/lib/cache';

// POST /api/ai-brief — generate AI market briefing using Gemini
export async function POST(request: NextRequest) {
  try {
    const { tokenAddress, tokenName, symbol, price, change24h, volume24h, momentum } =
      await request.json();

    if (!tokenAddress) {
      return NextResponse.json({ error: 'tokenAddress required' }, { status: 400 });
    }

    // Check cache
    const cacheKey = `ai_brief_${tokenAddress}`;
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({ brief: cached, cached: true });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return a generated stub brief when no API key is available
      const stub = generateStubBrief(tokenName || symbol, price, change24h, momentum);
      return NextResponse.json({ brief: stub, cached: false, model: 'stub' });
    }

    // Use Google Generative AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a concise crypto market analyst. Generate a 3-sentence market brief for this Bags.fm creator token:

Token: ${tokenName} ($${symbol})
Price: ${price ? `${price} SOL` : 'Unknown'}
24h Change: ${change24h ? `${(change24h * 100).toFixed(1)}%` : 'Unknown'}
24h Volume: ${volume24h ? `$${volume24h.toFixed(0)}` : 'Unknown'}
Momentum Score: ${momentum?.toFixed(2) || 'Unknown'} (scale: -1 bearish to +1 bullish)

Rules:
- Exactly 3 sentences. No bullet points.
- Sentence 1: Current price action and trend.
- Sentence 2: Key signal (volume, momentum, or holder activity).
- Sentence 3: One-line outlook (bullish/bearish/neutral) with a specific reason.
- Be direct, no hedging. Use plain language.`;

    const result = await model.generateContent(prompt);
    const brief = result.response.text().trim();

    // Cache for 6 hours
    cache.set(cacheKey, brief, CACHE_TTL.AI_BRIEF);

    return NextResponse.json({ brief, cached: false, model: 'gemini-2.0-flash' });
  } catch (error) {
    console.error('POST /api/ai-brief error:', error);
    // Fallback to stub
    const stub = 'AI briefing is temporarily unavailable. Check back shortly for market analysis powered by Gemini.';
    return NextResponse.json({ brief: stub, cached: false, model: 'fallback' });
  }
}

function generateStubBrief(
  name: string,
  price: number | undefined,
  change24h: number | undefined,
  momentum: number | undefined
): string {
  const changeStr = change24h !== undefined
    ? change24h >= 0 ? `up ${(change24h * 100).toFixed(1)}%` : `down ${Math.abs(change24h * 100).toFixed(1)}%`
    : 'stable';

  const trend = (momentum || 0) > 0.2
    ? 'bullish momentum is building'
    : (momentum || 0) < -0.2
    ? 'bearish pressure continues'
    : 'trading in a neutral range';

  const outlook = (momentum || 0) > 0
    ? 'The short-term outlook favors buyers if volume sustains.'
    : 'Caution is warranted until momentum shifts positive.';

  return `${name} is currently ${changeStr} in the last 24 hours as ${trend}. ${price ? `Trading at ${price.toFixed(6)} SOL with` : 'With'} the current momentum profile, the token shows ${(momentum || 0) > 0 ? 'accumulation' : 'distribution'} patterns. ${outlook}`;
}
