import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { supabaseServer } from '@/lib/supabase/supabaseServer';
import { createAccountMessage } from '@/lib/createAccountMessage';
import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit';
import { publicClient } from '@/clients/publicClient';
import { DEPLOY_SALT, MORALIS_STREAM_ID } from '@/config';
import { addAddressToMoralisStream } from '@/lib/moralis';

interface CreateAccountRequest {
  signerAddress: string;
  tokenSourceAddress: string;
  triggerAddress: string;
  delegation: any;
  savingsAddress?: string;
  signature: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAccountRequest = await request.json();
    const { signerAddress, tokenSourceAddress, triggerAddress, delegation, savingsAddress, signature, timestamp } =
      body;

    // Validate required fields
    if (!signerAddress || !tokenSourceAddress || !triggerAddress || !delegation || !signature || !timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check timestamp is recent (within 5 minutes)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (Math.abs(now - timestamp) > fiveMinutes) {
      return NextResponse.json({ error: 'Request timestamp too old or invalid' }, { status: 400 });
    }

    // Verify that tokenSourceAddress matches the expected smart account address
    try {
      const expectedSmartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [signerAddress as `0x${string}`, [], [], []],
        deploySalt: DEPLOY_SALT as `0x${string}`,
        signatory: {
          account: {
            address: signerAddress as `0x${string}`,
            signMessage: async () => '0x' as `0x${string}`,
            signTypedData: async () => '0x' as `0x${string}`,
          },
        }, // Minimal signatory for address computation
      });

      if (tokenSourceAddress.toLowerCase() !== expectedSmartAccount.address.toLowerCase()) {
        return NextResponse.json(
          {
            error: 'Invalid tokenSourceAddress: does not match expected smart account address',
            expected: expectedSmartAccount.address,
            received: tokenSourceAddress,
          },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error('Error verifying smart account address:', error);
      return NextResponse.json({ error: 'Failed to verify smart account address' }, { status: 500 });
    }

    // Create the message that should have been signed using helper
    const message = createAccountMessage({
      signerAddress,
      tokenSourceAddress,
      triggerAddress,
      delegation,
      savingsAddress,
      deploySalt: DEPLOY_SALT,
      timestamp,
    });

    // Verify the signature
    const isValid = await verifyMessage({
      address: signerAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Create the account in the database using server client
    const supabase = supabaseServer;
    const { data, error } = await supabase
      .from('accounts')
      .upsert(
        [
          {
            signerAddress,
            tokenSourceAddress,
            triggerAddress,
            delegation,
            savingsAddress,
            deploySalt: DEPLOY_SALT,
          },
        ],
        {
          onConflict: 'signerAddress,deploySalt',
          ignoreDuplicates: false,
        },
      )
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    console.log('Account created successfully via API:', data);

    // Add the triggerAddress to the Moralis stream for monitoring
    try {
      const streamUpdateSuccess = await addAddressToMoralisStream(MORALIS_STREAM_ID, triggerAddress);
      if (!streamUpdateSuccess) {
        console.warn('Failed to add address to Moralis stream, but account was created successfully');
      } else {
        console.log(`Successfully added ${triggerAddress} to Moralis stream`);
      }
    } catch (error) {
      console.error('Error updating Moralis stream:', error);
      // Don't fail the account creation if stream update fails
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
