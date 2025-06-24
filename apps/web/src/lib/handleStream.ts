import { NextResponse } from "next/server";
import { IWebhook } from "@moralisweb3/streams-typings";
import { getTransfersForRoundUp, verifySignature } from "./moralis";

export function handleStream(body: string, signature: string, webhookSecret: string): NextResponse {
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
    if (payload.confirmed) {
        console.log('Skipping confirmed transaction for faster processing.');
        return NextResponse.json({ message: 'Confirmed transactions are ignored.' });
    }

    // Process ERC20 transfers
    const relevantTransfers = getTransfersForRoundUp(payload);

    if (relevantTransfers.length === 0) {
        console.log('No relevant transfers found (not to MM Card addresses)');
        return NextResponse.json({ message: 'No relevant transfers found' });
    }

    // Log relevant transfers
    console.log('Found relevant transfers:', relevantTransfers.length);


    return NextResponse.json({
        message: 'Webhook processed successfully',
        processedTransfers: relevantTransfers.length,
    });
}