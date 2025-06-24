'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

type AutoHodlContextType = {
  metaMaskCardAddress: string | null;
  setMetaMaskCardAddress: (address: string | null) => void;
};

const AutoHodlContext = createContext<AutoHodlContextType | undefined>(undefined);

export const useAutoHodl = () => {
  const context = useContext(AutoHodlContext);
  if (!context) {
    throw new Error('useAutoHodl must be used within a AutoHodlProvider');
  }
  return context;
};

type Props = {
  children: ReactNode;
};

export const AutoHodlProvider: FC<Props> = ({ children }) => {
  const [metaMaskCardAddress, setMetaMaskCardAddress] = useState<string | null>(null);
  if (process.env.NODE_ENV === 'development') {
    console.log('metaMaskCardAddress', metaMaskCardAddress);
  }

  return (
    <AutoHodlContext.Provider value={{ metaMaskCardAddress, setMetaMaskCardAddress }}>
      {children}
    </AutoHodlContext.Provider>
  );
};
