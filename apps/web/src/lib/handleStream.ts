import { NextResponse } from 'next/server';
import { IWebhook } from '@moralisweb3/streams-typings';
import { adaptWebhook2AutoHodlTxs, verifySignature } from './moralis';
import { processTransfersForRoundUp } from './processTransfersForRoundUp';
import { supabaseServer } from './supabase/supabaseServer';
import { IAutoHodlTx, IAutoHodlAccount } from '../types/auto-hodl.types';

/**
 * Helper method to match a transaction's spendFrom address to an account's triggerAddress
 * @param spendFrom - The address that initiated the spending transaction
 * @returns The full account data if found, null otherwise
 */
async function findAccountByTriggerAddress(spendFrom: string): Promise<IAutoHodlAccount | null> {
  try {
    // Convert spendFrom to lowercase for case-insensitive comparison
    const spendFromLower = spendFrom.toLowerCase();

    console.log('Looking for account with triggerAddress matching:', spendFromLower);

    // Fetch all accounts and do case-insensitive comparison in JavaScript
    const { data: allAccounts, error: queryError } = await supabaseServer.from('accounts').select('*');

    if (queryError) {
      console.error('Error querying accounts for triggerAddress:', spendFrom, queryError);
      return null;
    }

    // Find account with matching triggerAddress (case-insensitive)
    const matchingAccount = allAccounts?.find((account) => account.triggerAddress.toLowerCase() === spendFromLower);

    if (matchingAccount) {
      console.log('Found matching account:', matchingAccount.id, 'for triggerAddress:', spendFromLower);
    } else {
      console.log('No matching account found for triggerAddress:', spendFromLower);
      console.log(
        'Available triggerAddresses:',
        allAccounts?.map((acc) => acc.triggerAddress.toLowerCase()),
      );
    }

    return matchingAccount ? (matchingAccount as IAutoHodlAccount) : null;
  } catch (error) {
    console.error('Unexpected error finding account by triggerAddress:', spendFrom, error);
    return null;
  }
}

/**
 * Helper method to add account data to transactions based on spendFrom matching
 * @param transactions - Array of transactions to process
 * @returns Array of transactions with accountId and account data added
 */
async function addAccountDataToTransactions(
  transactions: IAutoHodlTx[],
): Promise<Array<IAutoHodlTx & { accountId: string | null }>> {
  return Promise.all(
    transactions.map(async (tx) => {
      const account = await findAccountByTriggerAddress(tx.spendFrom);
      return {
        ...tx,
        accountId: account?.id || null,
        account: account || undefined,
      };
    }),
  );
}

export async function handleStream(body: string, signature: string, webhookSecret: string): Promise<NextResponse> {
  try {
    if (!verifySignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
  }

  // Parse the JSON payload
  let payload: IWebhook;
  try {
    payload = JSON.parse(body);
  } catch (error) {
    console.error('Error parsing webhook payload:', error);
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // Log incoming webhook for debugging
  console.log('Received Moralis webhook:', {
    chainId: payload.chainId,
    streamId: payload.streamId,
    tag: payload.tag,
    confirmed: payload.confirmed,
    transferCount: payload.erc20Transfers.length,
  });

  // Only process unconfirmed transactions for faster processing in hackathon
  if (payload.confirmed) {
    console.log('Skipping confirmed transaction for faster processing.');
    return NextResponse.json({ message: 'Confirmed transactions are ignored.' });
  }

  // Process ERC20 transfers
  const roundUpEligibleTxs = adaptWebhook2AutoHodlTxs(payload);

  if (roundUpEligibleTxs.length === 0) {
    console.log('No relevant transfers found (not to MM Card addresses)');
    return NextResponse.json({ message: 'No relevant transfers found' });
  }

  // Log relevant transfers
  console.log('Found relevant transfers:', roundUpEligibleTxs.length);

  // Save roundUpEligibleTxs to Supabase
  try {
    // Match transactions to accounts using helper method
    const txsWithAccountId = await addAccountDataToTransactions(roundUpEligibleTxs);

    // Prepare data for database insertion (exclude the 'account' property)
    const txsForDatabase = txsWithAccountId.map(({ account, ...tx }) => tx);

    const { data: insertedTxs, error } = await supabaseServer.from('txs').insert(txsForDatabase).select();

    if (error) {
      console.error('Error inserting transactions to database:', error);
      return NextResponse.json({ error: 'Database insertion failed' }, { status: 500 });
    }

    console.log('Successfully inserted transactions:', insertedTxs?.length);
    console.log('Transactions with account matches:', txsWithAccountId.filter((tx) => tx.accountId).length);

    // Process transfers for round-up (delegations fetched from account data)
    await processTransfersForRoundUp(txsWithAccountId);
  } catch (error) {
    console.error('Error processing transfer for round up savings:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Webhook processed successfully',
    processedTransfers: roundUpEligibleTxs.length,
  });
}
