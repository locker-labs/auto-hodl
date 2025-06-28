import Web3 from 'web3';
import { MM_CARD_ADDRESSES, USDC_ADDRESSES } from './constants';
import { IWebhook } from '@moralisweb3/streams-typings';
import { IAutoHodlTx } from '../types/auto-hodl.types';

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
export function adaptWebhook2AutoHodlTxs(payload: IWebhook): IAutoHodlTx[] {
  const relevantTransfers: IAutoHodlTx[] = [];

  for (const transfer of payload.erc20Transfers) {
    // Check if the transfer is TO one of the MM_CARD_ADDRESSES
    const shouldProcess = isMetaMaskCardAddress(transfer.to) && isUSDC(transfer.contract);

    if (shouldProcess) {
      relevantTransfers.push({
        createdAt: new Date().toISOString(),
        spendAmount: transfer.value,
        spendFrom: transfer.from,
        spendTo: transfer.to,
        spendToken: transfer.contract,
        spendTxHash: transfer.transactionHash,
        spendChainId: Number(payload.chainId),
        spendAt: new Date(Number(payload.block.timestamp) * 1000).toISOString(),
      });
    }
  }

  return relevantTransfers;
}

/**
 * Add an address to the Moralis stream to monitor transactions
 * @param streamId - The Moralis stream ID
 * @param address - The address to monitor (triggerAddress)
 * @returns Promise<boolean> - Success status
 */
export async function addAddressToMoralisStream(streamId: string, address: string): Promise<boolean> {
  try {
    // Import Moralis dynamically to avoid issues if not installed
    const Moralis = await import('moralis');

    // Initialize Moralis if not already done
    if (!Moralis.default.Core.isStarted) {
      await Moralis.default.start({
        apiKey: process.env.MORALIS_API_KEY,
      });
    }

    // Add the address to the stream
    await Moralis.default.Streams.addAddress({
      id: streamId,
      address: [address],
    });

    console.log(`Successfully added address ${address} to Moralis stream ${streamId}`);
    return true;
  } catch (error) {
    console.error('Error adding address to Moralis stream:', error);
    return false;
  }
}
