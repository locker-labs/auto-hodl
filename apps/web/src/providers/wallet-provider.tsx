import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { VIEM_CHAIN } from '@/config';
import { arbitrum, base, baseSepolia } from 'viem/chains';

// Set up your configuration with the desired chains and connectors.
export const wagmiConfig = createConfig({
  ssr: true, // Make sure to enable this for server-side rendering (SSR) applications.
  chains: [VIEM_CHAIN, arbitrum, base, baseSepolia],
  connectors: [metaMask()],
  transports: {
    [VIEM_CHAIN.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Set up providers
const client = new QueryClient();

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
