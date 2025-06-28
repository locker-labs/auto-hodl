'use server';

import { NextRequest, NextResponse } from 'next/server';
import { handleStream } from '@/lib/handleStream';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text for signature verification
    const body = await request.text();

    // Get signature from headers
    const signature = request.headers.get('x-signature');

    // Get webhook secret from environment variables
    const streamSecret = process.env.MORALIS_STREAM_SECRET;

    if (!streamSecret) {
      console.error('MORALIS_STREAM_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify signature
    if (!signature) {
      console.error('No signature provided in webhook');
      return NextResponse.json({ error: 'No signature provided' }, { status: 401 });
    }

    return await handleStream(body, signature, streamSecret);
  } catch (error) {
    console.error('Error processing Moralis webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Moralis webhook endpoint' });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
