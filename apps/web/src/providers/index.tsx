'use client';

import type { ReactNode } from 'react';
import { WalletProvider } from './wallet-provider';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return <WalletProvider>{children}</WalletProvider>;
};
