import { supabaseServer } from '@/lib/supabase/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  try {
    const supabase = supabaseServer;

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    const {
      data,
      error: supabaseError,
      count,
    } = await supabase
      .from('txs')
      .select('*', { count: 'exact' })
      .eq('accountId', accountId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (supabaseError) {
      console.error('Supabase error details:', {
        code: supabaseError.code,
        message: supabaseError.message,
        details: supabaseError.details,
        hint: supabaseError.hint,
      });
      return NextResponse.json({ error: 'Database error', details: supabaseError.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
