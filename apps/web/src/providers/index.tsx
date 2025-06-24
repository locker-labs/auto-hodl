'use client';

import type { ReactNode } from 'react';
import { AutoHodlProvider } from './autohodl-provider';
import { WalletProvider } from './wallet-provider';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <WalletProvider>
      <AutoHodlProvider>{children}</AutoHodlProvider>
    </WalletProvider>
  );
};
