import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAaveCaveats } from './yield/caveats';
import { MetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import { getLifiCaveats } from './lifi/caveats';
import {EChainMode} from '@/enums/chainMode.enums';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCaveats(delegatorAccount:MetaMaskSmartAccount,amount:bigint, mode: string) {
  if (mode === EChainMode.SINGLE_CHAIN) {
    return getAaveCaveats(delegatorAccount, amount);
  } else if (mode === EChainMode.MULTI_CHAIN) {
    return getLifiCaveats(delegatorAccount, amount);
  }
  return [];
}