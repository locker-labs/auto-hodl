import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/supabaseServer';
import { EChainMode } from '@/enums/chainMode.enums';

interface UpdateAccountRequest {
  timestamp: number;
  chainId: string;
  chainMode: EChainMode;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ accountId: string }> }) {
  try {
    const { accountId } = await params;

    console.log('accountId', accountId);

    // Validate account id
    const supabase = supabaseServer;

    const { data: accountData, error: fetchAccountError } = await supabase
      .from('accounts')
      .select('chainId, chainMode')
      .eq('id', accountId);

    if (fetchAccountError) {
      console.error('Database error:', fetchAccountError);
      return NextResponse.json({ error: 'Invalid account id' }, { status: 404 });
    }

    const body: UpdateAccountRequest = await request.json();
    const { timestamp, chainId, chainMode } = body;

    console.log('accountData', accountData, 'body', body);

    // Validate required fields
    if (!chainId || !chainMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check timestamp is recent (within 5 minutes)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (Math.abs(now - timestamp) > fiveMinutes) {
      return NextResponse.json({ error: 'Request timestamp too old or invalid' }, { status: 400 });
    }

    // TODO: Assuming the destination chain protection will managed by caveats, skipping signature verification for now

    // Update the account in the database using server client
    const { data, error } = await supabase
      .from('accounts')
      .update({
        chainId,
        chainMode,
      })
      .eq('id', accountId)
      .select();
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
    }

    console.log('Account updated successfully via API:', data);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
