export interface ITransfer {
  transactionHash: string;
  from: string;
  to: string;
  tokenAddress: string;
  amount: string;
  tokenSymbol: string;
  tokenDecimals: string;
  chain: string;
  blockNumber: string;
  timestamp: string;
}
