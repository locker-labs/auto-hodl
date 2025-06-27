import { VIEM_CHAIN } from '@/config';

const chainId = VIEM_CHAIN.id;

const chainIdToBlockExplorer: Record<number, string> = {
  8453: 'https://basescan.org',
  84532: 'https://sepolia.basescan.org',
  11155111: 'https://sepolia.etherscan.io',
};

export const getTransactionLink = (txHash: string): string => {
  return `${chainIdToBlockExplorer[chainId]}/tx/${txHash}`;
};

export const getAddressLink = (address: string): string => {
  return `${chainIdToBlockExplorer[chainId]}/address/${address}`;
};
