'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { DEPLOY_SALT } from '@/config';

type AutoHodlContextType = {
  metaMaskCardAddress: string | null;
  setMetaMaskCardAddress: (address: string | null) => void;
  triggerAddress: string | null;
  tokenSourceAddress: string | null;
  loading: boolean;
  // Function to fetch account data for a specific deploySalt
  fetchAccountByDeploySalt: (
    signerAddress: string,
    deploySalt: string,
  ) => Promise<{ triggerAddress: string | null; tokenSourceAddress: string | null } | null>;
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
  const [tokenSourceAddress, setTokenSourceAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { address, isConnected } = useAccount();

  // Fetch account data when wallet connects
  useEffect(() => {
    async function fetchAccountData() {
      if (!address || !isConnected) {
        setTriggerAddress(null);
        setTokenSourceAddress(null);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching account data for address:', address);

        const { data, error } = await supabaseClient
          .from('accounts_view')
          .select('triggerAddress, tokenSourceAddress')
          .eq('signerAddress', address)
          .eq('deploySalt', DEPLOY_SALT)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No account found
            console.log('No account found for address:', address);
            setTriggerAddress(null);
            setTokenSourceAddress(null);
          } else {
            console.error('Error fetching account data:', error);
            setTriggerAddress(null);
            setTokenSourceAddress(null);
          }
        } else {
          console.log('Found account data:', data);
          setTriggerAddress(data.triggerAddress);
          setTokenSourceAddress(data.tokenSourceAddress);
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        setTriggerAddress(null);
        setTokenSourceAddress(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAccountData();
  }, [address, isConnected]);

  // Function to fetch account data for a specific deploySalt
  const fetchAccountByDeploySalt = async (signerAddress: string, deploySalt: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('accounts_view')
        .select('triggerAddress, tokenSourceAddress')
        .eq('signerAddress', signerAddress)
        .eq('deploySalt', deploySalt)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No account found
          return null;
        } else {
          console.error('Error fetching account data:', error);
          return null;
        }
      }

      return {
        triggerAddress: data.triggerAddress,
        tokenSourceAddress: data.tokenSourceAddress,
      };
    } catch (error) {
      console.error('Error fetching account data:', error);
      return null;
    }
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('AutoHodl context:', { metaMaskCardAddress, triggerAddress, tokenSourceAddress, loading });
  }

  return (
    <AutoHodlContext.Provider
      value={{
        metaMaskCardAddress,
        setMetaMaskCardAddress,
        triggerAddress,
        tokenSourceAddress,
        loading,
        fetchAccountByDeploySalt,
      }}
    >
      {children}
    </AutoHodlContext.Provider>
  );
};
