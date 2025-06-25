// Helper function to get chain name from chainId
export function getChainName(chainId: string): string {
  const chains: Record<string, string> = {
    // '0x1': 'ethereum',
    // '0x89': 'polygon',
    '0xe708': 'linea', // Linea mainnet
    '0xe705': 'linea-sepolia', // Linea testnet
    // '0xa': 'optimism',
    // '0xa4b1': 'arbitrum',
  };

  return chains[chainId] || 'unknown';
}
