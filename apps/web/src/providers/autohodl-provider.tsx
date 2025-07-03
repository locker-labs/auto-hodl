'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { DEPLOY_SALT } from '@/config';
import { EChainMode } from '@/enums/chainMode.enums';

type AutoHodlContextType = {
  metaMaskCardAddress: string | null;
  setMetaMaskCardAddress: (address: string | null) => void;
  triggerAddress: string | null;
  tokenSourceAddress: string | null;
  circleAddress: string | null;
  chainMode: EChainMode | null;
  setChainMode: (chainMode: EChainMode | null) => void;
  saveChainMode: (chainMode: EChainMode) => Promise<void>;
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
  const [circleAddress, setCircleAddress] = useState<string | null>(null);
  const [chainMode, setChainMode] = useState<EChainMode | null>(null);
  const [loading, setLoading] = useState(false);

  const { address, isConnected } = useAccount();

  // Fetch account data when wallet connects
  useEffect(() => {
    async function fetchAccountData() {
      if (!address || !isConnected) {

        return;
      }

      try {
        setLoading(true);
        console.log('Fetching account data for address:', address);

        const { data, error } = await supabaseClient
          .from('accounts_view')
          .select('triggerAddress, tokenSourceAddress, circleAddress, chainMode')
          .eq('signerAddress', address)
          .eq('deploySalt', DEPLOY_SALT)
          .single();

        console.log('data', data);
        console.log('error', error);
        if (error) {
          if (error.code === 'PGRST116') {
            // No account found
            console.log('No account found for address:', address);
            setTriggerAddress(null);
            setTokenSourceAddress(null);
            setCircleAddress(null);
          } else {
            console.error('Error fetching account data:', error);
            setTriggerAddress(null);
            setTokenSourceAddress(null);
            setCircleAddress(null);
          }
        } else {
          console.log('Found account data:', data);
          setTriggerAddress(data.triggerAddress);
          setTokenSourceAddress(data.tokenSourceAddress);
          setCircleAddress(data.circleAddress);
          setChainMode(data.chainMode);
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        setTriggerAddress(null);
        setTokenSourceAddress(null);
        setCircleAddress(null);
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

  const saveChainMode = async (chainMode: EChainMode) => {
    if (!chainMode) {
      console.error('No chainMode selected');
      throw new Error('No chainMode selected');
    }

    try {
      // TODO: Here you would make an API call to backend to update chain mode (and chain id?)

      console.log('Tx mode saved in db');
    } catch (error) {
      console.error('Failed to save tx mode in db:', error);
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
        circleAddress,
        chainMode,
        setChainMode,
        saveChainMode,
        loading,
        fetchAccountByDeploySalt,
      }}
    >
      {children}
    </AutoHodlContext.Provider>
  );
};
