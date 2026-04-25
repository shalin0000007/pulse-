import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/squads/[id] — get squad detail with members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: squad, error } = await supabase
      .from('squads')
      .select(`
        *,
        squad_members (
          wallet_address,
          role,
          joined_at
        )
      `)
      .eq('id', id)
      .single();

    if (error || !squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    return NextResponse.json({ squad });
  } catch (error) {
    console.error('GET /api/squads/[id] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/squads/[id] — join a squad
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { wallet } = body;

    if (!wallet) {
      return NextResponse.json({ error: 'wallet is required' }, { status: 400 });
    }

    // Check squad exists and has room
    const { data: squad } = await supabase
      .from('squads')
      .select('*, squad_members(wallet_address)')
      .eq('id', id)
      .single();

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    if ((squad.squad_members?.length || 0) >= (squad.max_members || 10)) {
      return NextResponse.json({ error: 'Squad is full' }, { status: 400 });
    }

    // Ensure user exists
    await supabase
      .from('users')
      .upsert({ wallet_address: wallet }, { onConflict: 'wallet_address' });

    // Add member
    const { error: joinError } = await supabase
      .from('squad_members')
      .insert({ squad_id: id, wallet_address: wallet, role: 'member' });

    if (joinError) {
      if (joinError.code === '23505') {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
      }
      throw joinError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/squads/[id] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
