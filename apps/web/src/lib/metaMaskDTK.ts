'use client';

import type { Address, WalletClient } from 'viem';
import { publicClient } from '@/clients/publicClient';
import { Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import { createDelegatorWalletClient } from '@/clients/delegatorWalletClient';

export async function createDelegatorAccount(address: Address, ethereum: any) {
  const delegatorWalletClient: WalletClient = createDelegatorWalletClient(ethereum);

  return await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [address, [], [], []],
    deploySalt: '0x',
    // @ts-ignore
    signatory: delegatorWalletClient,
  });
}
