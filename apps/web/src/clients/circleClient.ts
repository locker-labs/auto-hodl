import { toModularTransport } from '@circle-fin/modular-wallets-core';
import { createPublicClient } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { CIRCLE_CLIENT_URL, CIRCLE_CLIENT_KEY } from '@/config';
import { base } from 'viem/chains';

const chain = base;
const chainName = 'base';
// For demo purposes, recipient will always be Base.

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
