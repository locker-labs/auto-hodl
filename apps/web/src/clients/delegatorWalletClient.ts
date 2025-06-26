import { createWalletClient, custom } from 'viem';
import { VIEM_CHAIN } from '@/config';

export function createDelegatorWalletClient(ethereum: any) {
  return createWalletClient({
    chain: VIEM_CHAIN,
    transport: custom(ethereum),
  });
}
