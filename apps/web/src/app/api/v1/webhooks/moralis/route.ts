import { NextRequest, NextResponse } from 'next/server';
import { Web3 } from 'web3';
import { MM_CARD_ADDRESSES } from '@/lib/constants';
import { IWebhook, InternalTransaction } from "@moralisweb3/streams-typings";

interface ProcessedTransfer {
    transactionHash: string;
    from: string;
    to: string;
    tokenAddress: string;
    amount: string;
    tokenSymbol: string;
    tokenDecimals: string;
    chain: string;
    blockNumber: string;
    timestamp: string;
}

// Helper function to verify webhook signature
function verifySignature(body: string, signature: string, secret: string): boolean {
    console.log("verifySignature", body, signature, secret);
    if (!signature) {
        throw new Error('Signature not provided');
    }

    // Generate signature using the same method as Moralis
    // Use web3.utils.sha3 (which is actually keccak256) as per Moralis documentation
    const web3 = new Web3();
    const generatedSignature = web3.utils.sha3(body + secret);

    // Both signatures should include the '0x' prefix
    const cleanSignature = signature.startsWith('0x') ? signature : `0x${signature}`;

    return generatedSignature === cleanSignature;
}

// Helper function to get chain name from chainId
function getChainName(chainId: string): string {
    const chains: Record<string, string> = {
        // '0x1': 'ethereum',
        // '0x89': 'polygon',
        '0xe708': 'linea', // Linea mainnet
        '0xe705': 'linea-sepolia', // Linea testnet
        // '0xa': 'optimism',
        '0xa4b1': 'arbitrum',
    };

    return chains[chainId] || 'unknown';
}

// Helper function to check if address is a MetaMask Card address
function isMetaMaskCardAddress(address: string): boolean {
    return MM_CARD_ADDRESSES.some(
        cardAddress => cardAddress.toLowerCase() === address.toLowerCase()
    );
}

// Helper function to process ERC20 transfers
function processERC20Transfers(payload: IWebhook): ProcessedTransfer[] {
    const relevantTransfers: ProcessedTransfer[] = [];

    for (const transfer of payload.erc20Transfers) {
        // Check if the transfer is TO one of the MM_CARD_ADDRESSES
        if (isMetaMaskCardAddress(transfer.to)) {
            relevantTransfers.push({
                transactionHash: transfer.transactionHash,
                from: transfer.from,
                to: transfer.to,
                tokenAddress: transfer.contract,
                amount: transfer.value,
                tokenSymbol: transfer.tokenSymbol,
                tokenDecimals: transfer.tokenDecimals,
                chain: getChainName(payload.chainId),
                blockNumber: payload.block.number,
                timestamp: payload.block.timestamp,
            });
        }
    }

    return relevantTransfers;
}

export async function POST(request: NextRequest) {
    try {
        // Get the raw body as text for signature verification
        const body = await request.text();

        // Get signature from headers
        const signature = request.headers.get('x-signature');

        // Get webhook secret from environment variables
        const webhookSecret = process.env.MORALIS_STREAM_SECRET;

        if (!webhookSecret) {
            console.error('MORALIS_STREAM_SECRET not configured');
            return NextResponse.json(
                { error: 'Webhook secret not configured' },
                { status: 500 }
            );
        }

        // Verify signature
        if (!signature) {
            console.error('No signature provided in webhook');
            return NextResponse.json(
                { error: 'No signature provided' },
                { status: 401 }
            );
        }

        try {
            if (!verifySignature(body, signature, webhookSecret)) {
                console.error('Invalid webhook signature');
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        } catch (error) {
            console.error('Error verifying signature:', error);
            return NextResponse.json(
                { error: 'Signature verification failed' },
                { status: 401 }
            );
        }

        // Parse the JSON payload
        let payload: IWebhook;
        try {
            payload = JSON.parse(body);
        } catch (error) {
            console.error('Error parsing webhook payload:', error);
            return NextResponse.json(
                { error: 'Invalid JSON payload' },
                { status: 400 }
            );
        }

        // Log incoming webhook for debugging
        console.log('Received Moralis webhook:', {
            chainId: payload.chainId,
            streamId: payload.streamId,
            tag: payload.tag,
            confirmed: payload.confirmed,
            transferCount: payload.erc20Transfers.length,
        });

        // Only process confirmed transactions
        if (!payload.confirmed) {
            console.log('Skipping unconfirmed transaction');
            return NextResponse.json({ message: 'Transaction not confirmed yet' });
        }

        // Process ERC20 transfers
        const relevantTransfers = processERC20Transfers(payload);

        if (relevantTransfers.length === 0) {
            console.log('No relevant transfers found (not to MM Card addresses)');
            return NextResponse.json({ message: 'No relevant transfers found' });
        }

        // Log relevant transfers
        console.log('Found relevant transfers:', relevantTransfers.length);

        // Process each relevant transfer
        for (const transfer of relevantTransfers) {
            console.log('Processing transfer:', {
                hash: transfer.transactionHash,
                from: transfer.from,
                to: transfer.to,
                token: transfer.tokenSymbol,
                amount: transfer.amount,
                chain: transfer.chain,
            });

            // TODO: Add your business logic here
            // Examples:
            // - Store transfer in database
            // - Calculate round-up amount
            // - Trigger savings transaction
            // - Send notifications
            // - Update user balances

            // Example: Save to database (you'll need to implement this)
            // await saveTransferToDatabase(transfer);

            // Example: Calculate round-up and trigger savings
            // await processRoundUpSavings(transfer);
        }

        return NextResponse.json({
            message: 'Webhook processed successfully',
            processedTransfers: relevantTransfers.length,
        });

    } catch (error) {
        console.error('Error processing Moralis webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
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
