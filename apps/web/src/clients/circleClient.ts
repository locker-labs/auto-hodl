import { toModularTransport } from '@circle-fin/modular-wallets-core';
import { createPublicClient } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { VIEM_CHAIN, CIRCLE_CLIENT_URL, CIRCLE_CLIENT_KEY } from '@/config';
import { arbitrumSepolia, baseSepolia, sepolia } from 'viem/chains';

const chain = VIEM_CHAIN;

let chainName: string;
if (chain.id === arbitrumSepolia.id) {
  chainName = 'arbitrumSepolia';
} else if (chain.id === baseSepolia.id) {
  chainName = 'baseSepolia';
} else if (chain.id === sepolia.id) {
  chainName = 'sepolia';
} else {
  throw new Error(`Unsupported chain: ${chain.id}`);
}

// Create modular transport
export function createCircleTransport() {
  const modularTransport = toModularTransport(`${CIRCLE_CLIENT_URL}/${chainName}`, CIRCLE_CLIENT_KEY);

  return modularTransport;
}

// Create clients
export function createCircleClients() {
  const transport = createCircleTransport();

  const publicClient = createPublicClient({
    chain,
    transport,
  });

  const bundlerClient = createBundlerClient({
    chain,
    transport,
  });

  return {
    publicClient,
    bundlerClient,
  };
}
