import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { linea, lineaSepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

// Set up your configuration with the desired chains and connectors.
const config = createConfig({
  ssr: true, // Make sure to enable this for server-side rendering (SSR) applications.
  chains: [linea, lineaSepolia],
  connectors: [metaMask()],
  transports: {
    [linea.id]: http(),
    [lineaSepolia.id]: http(),
  },
});

// Set up providers
const client = new QueryClient();

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
