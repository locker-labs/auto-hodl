import { toCircleSmartAccount, walletClientToLocalAccount } from '@circle-fin/modular-wallets-core';
import type { WalletClient } from 'viem';
import { createCircleClients } from '@/clients/circleClient';
import { base } from 'viem/chains';

// Create Circle Smart Account
export async function createCircleSmartAccount(walletClient: WalletClient) {
  const baseWalletClient = { ...walletClient, chain: base } as WalletClient;

  const { publicClient } = createCircleClients();

  // Convert wallet client to local account
  const localAccount = walletClientToLocalAccount(baseWalletClient);

  // Create Circle Smart Account
  const account = await toCircleSmartAccount({
    client: publicClient,
    owner: localAccount,
  });

  return account;
}
