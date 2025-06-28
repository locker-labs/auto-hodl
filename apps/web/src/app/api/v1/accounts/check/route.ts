import { type NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/supabaseServer';
import { DEPLOY_SALT } from '@/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signerAddress = searchParams.get('signerAddress');

    if (!signerAddress) {
      return NextResponse.json({ error: 'signerAddress is required' }, { status: 400 });
    }

    console.log('Checking for existing account with signerAddress:', signerAddress, 'and deploySalt:', DEPLOY_SALT);

    const supabase = supabaseServer;

    // Query the main accounts table to include deploySalt in the filter
    const { data: allData, error: allError } = await supabase
      .from('accounts')
      .select(
        'signerAddress, createdAt, triggerAddress, delegation, id, tokenSourceAddress, roundUpToDollar, roundUpMode',
      )
      .eq('signerAddress', signerAddress)
      .eq('deploySalt', DEPLOY_SALT);

    if (allError) {
      console.error('Supabase error details:', {
        code: allError.code,
        message: allError.message,
        details: allError.details,
        hint: allError.hint,
      });
      return NextResponse.json({ error: 'Database error', details: allError.message }, { status: 500 });
    }

    // Return the first match if any, otherwise null
    const data = allData && allData.length > 0 ? allData[0] : null;
    console.log('Existing account found:', !!data);

    return NextResponse.json({
      success: true,
      data,
      exists: !!data,
    });
  } catch (error) {
    console.error('Error checking account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
