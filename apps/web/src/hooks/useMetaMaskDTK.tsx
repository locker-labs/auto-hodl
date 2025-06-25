'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import type { MetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit';
import { createWalletClient, custom } from 'viem';
import { VIEM_CHAIN } from '@/config';
import { publicClient } from '@/clients/publicClient';

export function useMetaMaskDTK() {
  const [creatingDelegator, setCreatingDelegator] = useState(false);
  const [delegator, setDelegator] = useState<MetaMaskSmartAccount<Implementation> | null>(null);
  // const [delegate, setDelegate] = useState(null);
  // const [creatingDelegate, setCreatingDelegate] = useState(false);

  const { address, isConnected } = useAccount();

  console.log('delegator', delegator);

  async function setupDelegator(): Promise<void> {
    try {
      if (!!address && isConnected && !!window.ethereum) {
        if (!delegator) {
          // start creating delegator
          setCreatingDelegator(true);
          console.log('creating delegator');

          // create wallet client
          const delegatorWalletClient = createWalletClient({
            chain: VIEM_CHAIN,
            transport: custom(window.ethereum),
          });

          // create delegator smart account
          const delegatorSmartAccount = await toMetaMaskSmartAccount({
            client: publicClient,
            implementation: Implementation.Hybrid,
            deployParams: [address, [], [], []],
            deploySalt: '0x',
            // @ts-ignore
            signatory: delegatorWalletClient,
          });

          // end creating delegator
          console.log('created delegator');
          setDelegator(delegatorSmartAccount);
        }
      } else {
        setDelegator(null);
      }
    } catch (err) {
      console.error('Error creating Delegator account:', err);
    } finally {
      setCreatingDelegator(false);
    }
  }

  useEffect(() => {
    // TODO: uncomment this to create delegator after connecting wallet in step 1
    // setupDelegator();
  }, [address, isConnected]);

  return {
    // creatingDelegate,
    creatingDelegator,
    // delegate,
    delegator,
    setupDelegator,
  };
}
