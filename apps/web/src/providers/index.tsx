'use client';

import type { ReactNode } from 'react';
import { AutoHodlProvider } from './autohodl-provider';
import { WalletProvider } from './wallet-provider';
import { CircleSmartAccountProvider } from './circle-smart-account-provider';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <WalletProvider>
      <CircleSmartAccountProvider>
        <AutoHodlProvider>{children}</AutoHodlProvider>
      </CircleSmartAccountProvider>
    </WalletProvider>
  );
};
