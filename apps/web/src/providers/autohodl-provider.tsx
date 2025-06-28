'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabaseClient } from '@/lib/supabase/supabaseClient';

type AutoHodlContextType = {
  metaMaskCardAddress: string | null;
  setMetaMaskCardAddress: (address: string | null) => void;
  triggerAddress: string | null;
  loading: boolean;
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
  const [triggerAddress, setTriggerAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { address, isConnected } = useAccount();

  // Fetch account data when wallet connects
  useEffect(() => {
    async function fetchAccountData() {
      if (!address || !isConnected) {
        setTriggerAddress(null);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching account data for address:', address);

        const { data, error } = await supabaseClient
          .from('accounts_view')
          .select('triggerAddress')
          .eq('signerAddress', address)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No account found
            console.log('No account found for address:', address);
            setTriggerAddress(null);
          } else {
            console.error('Error fetching account data:', error);
            setTriggerAddress(null);
          }
        } else {
          console.log('Found account data:', data);
          setTriggerAddress(data.triggerAddress);
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        setTriggerAddress(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAccountData();
  }, [address, isConnected]);

  if (process.env.NODE_ENV === 'development') {
    console.log('AutoHodl context:', { metaMaskCardAddress, triggerAddress, loading });
  }

  return (
    <AutoHodlContext.Provider value={{ 
      metaMaskCardAddress, 
      setMetaMaskCardAddress, 
      triggerAddress, 
      loading 
    }}>
      {children}
    </AutoHodlContext.Provider>
  );
};
