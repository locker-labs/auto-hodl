import { toCircleSmartAccount, walletClientToLocalAccount } from '@circle-fin/modular-wallets-core';
import type { WalletClient } from 'viem';
import { createCircleClients } from '@/clients/circleClient';

// Create Circle Smart Account
export async function createCircleSmartAccount(walletClient: WalletClient) {
  const { publicClient } = createCircleClients();

  // Convert wallet client to local account
  const localAccount = walletClientToLocalAccount(walletClient);

  // Create Circle Smart Account
  const account = await toCircleSmartAccount({
    client: publicClient,
    owner: localAccount,
  });

  return account;
}
