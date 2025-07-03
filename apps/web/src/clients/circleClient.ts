import { toModularTransport } from '@circle-fin/modular-wallets-core';
import { createPublicClient } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { VIEM_CHAIN as chain, CIRCLE_CLIENT_URL, CIRCLE_CLIENT_KEY } from '@/config';

// For demo purposes, recipient will always be Base.
const chainName: string = 'base';

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
