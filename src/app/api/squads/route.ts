import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/squads — list all squads or filter by wallet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    let query = supabase
      .from('squads')
      .select(`
        *,
        squad_members (wallet_address, role, joined_at)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (wallet) {
      // Get squads where this wallet is a member
      const { data: memberships } = await supabase
        .from('squad_members')
        .select('squad_id')
        .eq('wallet_address', wallet);

      const squadIds = memberships?.map(m => m.squad_id) || [];
      if (squadIds.length === 0) {
        return NextResponse.json({ squads: [] });
      }
      query = query.in('id', squadIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ squads: [] });
    }

    const squads = (data || []).map(squad => ({
      ...squad,
      memberCount: squad.squad_members?.length || 0,
    }));

    return NextResponse.json({ squads });
  } catch (error) {
    console.error('GET /api/squads error:', error);
    return NextResponse.json({ squads: [] });
  }
}

// POST /api/squads — create a new squad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, wallet } = body;

    if (!name || !wallet) {
      return NextResponse.json(
        { error: 'name and wallet are required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    // Ensure user exists
    await supabase
      .from('users')
      .upsert({ wallet_address: wallet }, { onConflict: 'wallet_address' });

    // Create squad
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .insert({ name, slug, created_by: wallet })
      .select()
      .single();

    if (squadError) {
      console.error('Create squad error:', squadError);
      return NextResponse.json({ error: 'Failed to create squad' }, { status: 500 });
    }

    // Add creator as owner member
    await supabase
      .from('squad_members')
      .insert({ squad_id: squad.id, wallet_address: wallet, role: 'owner' });

    return NextResponse.json({ squad }, { status: 201 });
  } catch (error) {
    console.error('POST /api/squads error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
