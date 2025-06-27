// Helper function to create consistent message for account creation signature
export function createAccountMessage(account: {
  signerAddress: string;
  tokenSourceAddress: string;
  triggerAddress: string;
  delegation: any;
  savingsAddress?: string;
  deploySalt: string;
  timestamp: number;
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
  };

  return JSON.stringify(messageObject);
}
