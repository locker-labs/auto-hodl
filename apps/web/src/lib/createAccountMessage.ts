// Helper function to create consistent message for account creation signature
import type { EChainMode } from '@/enums/chainMode.enums';

export function createAccountMessage(account: {
  signerAddress: string;
  tokenSourceAddress: string;
  triggerAddress: string;
  delegation: any;
  savingsAddress?: string;
  deploySalt: string;
  timestamp: number;
  chainId: string;
  chainMode: EChainMode;
}): string {
  const messageObject = {
    type: 'create',
    signerAddress: account.signerAddress,
    tokenSourceAddress: account.tokenSourceAddress,
    triggerAddress: account.triggerAddress,
    delegation: JSON.stringify(account.delegation),
    savingsAddress: account.savingsAddress || 'undefined',
    deploySalt: account.deploySalt,
    timestamp: account.timestamp,
    chainId: account.chainId,
    chainMode: account.chainMode,
  };

  return JSON.stringify(messageObject);
}
