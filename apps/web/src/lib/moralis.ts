import Web3 from 'web3';
import { MM_CARD_ADDRESSES, USDC_ADDRESSES } from './constants';
import { IWebhook } from '@moralisweb3/streams-typings';
import { getChainName } from './evm';
import { ITransfer } from './types';

// Helper function to verify webhook signature
export function verifySignature(body: string, signature: string, secret: string): boolean {
  console.log('verifySignature', body, signature, secret);
  if (!signature) {
    throw new Error('Signature not provided');
  }

  // Generate signature using the same method as Moralis
  // Use web3.utils.sha3 (which is actually keccak256) as per Moralis documentation
  const web3 = new Web3();
  const generatedSignature = web3.utils.sha3(body + secret);

  // Both signatures should include the '0x' prefix
  const cleanSignature = signature.startsWith('0x') ? signature : `0x${signature}`;

  return generatedSignature === cleanSignature;
}

// Helper function to check if address is a MetaMask Card address
export function isMetaMaskCardAddress(address: string): boolean {
  return MM_CARD_ADDRESSES.some((cardAddress) => cardAddress.toLowerCase() === address.toLowerCase());
}

// Helper function to check if token is USDC
export function isUSDC(tokenAddress: string): boolean {
  return USDC_ADDRESSES.some((usdcAddress) => usdcAddress.toLowerCase() === tokenAddress.toLowerCase());
}

// Helper function to process ERC20 transfers
export function getTransfersForRoundUp(payload: IWebhook): ITransfer[] {
  const relevantTransfers: ITransfer[] = [];

  for (const transfer of payload.erc20Transfers) {
    // Check if the transfer is TO one of the MM_CARD_ADDRESSES
    const shouldProcess = isMetaMaskCardAddress(transfer.to) && isUSDC(transfer.contract);

    if (shouldProcess) {
      relevantTransfers.push({
        transactionHash: transfer.transactionHash,
        from: transfer.from,
        to: transfer.to,
        tokenAddress: transfer.contract,
        amount: transfer.value,
        tokenSymbol: transfer.tokenSymbol,
        tokenDecimals: transfer.tokenDecimals,
        chain: getChainName(payload.chainId),
        blockNumber: payload.block.number,
        timestamp: payload.block.timestamp,
      });
    }
  }

  return relevantTransfers;
}
