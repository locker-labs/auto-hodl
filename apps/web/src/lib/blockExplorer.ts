import { VIEM_CHAIN } from '@/config';
import type { IAutoHodlTx } from '@/types/auto-hodl.types';

const chainId = VIEM_CHAIN.id;

const chainIdToBlockExplorer: Record<number, string> = {
  8453: 'https://basescan.org',
  84532: 'https://sepolia.basescan.org',
  11155111: 'https://sepolia.etherscan.io',
  42161: 'https://arbiscan.io',
};

export const getTransactionLink = (tx: IAutoHodlTx): string => {
  // Check if this is a multi-chain transaction by comparing chain IDs
  const isMultiChain = tx.yieldDepositChainId && tx.yieldDepositChainId !== tx.spendChainId;

  // Use LiFi scan for multi-chain transactions
  if (isMultiChain) {
    const txHash = tx.yieldDepositTxHash || tx.spendTxHash;
    return `https://scan.li.fi/tx/${txHash}`;
  }

  // Use regular block explorer for single-chain transactions
  const txHash = tx.yieldDepositTxHash || tx.spendTxHash;
  return `${chainIdToBlockExplorer[chainId]}/tx/${txHash}`;
};

export const getAddressLink = (address: string): string => {
  return `${chainIdToBlockExplorer[chainId]}/address/${address}`;
};
