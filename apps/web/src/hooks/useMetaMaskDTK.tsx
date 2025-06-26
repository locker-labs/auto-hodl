'use client';

import { useEffect, useState } from 'react';
import { useAccount, useSignMessage, useSignTypedData } from 'wagmi';
import type { MetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import { toMetaMaskSmartAccount, Implementation, createDelegation as createDelegationToolkit, type Delegation } from '@metamask/delegation-toolkit';
import { createWalletClient, custom, type SignableMessage } from 'viem';
import { VIEM_CHAIN, DELEGATE_ADDRESS } from '@/config';
import { publicClient } from '@/clients/publicClient';
import { privateKeyToAccount } from 'viem/accounts';

export function useMetaMaskDTK() {
  const [creatingDelegator, setCreatingDelegator] = useState(false);
  const [delegator, setDelegator] = useState<MetaMaskSmartAccount<Implementation> | null>(null);
  const [creatingDelegation, setCreatingDelegation] = useState(false);
  const [signedDelegation, setSignedDelegation] = useState<Delegation | null>(null);
  // const [delegate, setDelegate] = useState(null);
  // const [creatingDelegate, setCreatingDelegate] = useState(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  console.log('delegator', delegator);

  async function setupDelegator(): Promise<void> {
    try {
      if (!!address && isConnected && !!window.ethereum) {
        if (!delegator && !creatingDelegator) {
          // start creating delegator
          setCreatingDelegator(true);
          console.log('creating delegator');

          // Manually construct an object that conforms to viem's Account interface.
          // This is the "real fix" to make browser wallet signing work.
          const connectedAccount = {
            address,
            type: 'json-rpc' as const,
            async signMessage({ message }: { message: any }) {
              return await signMessageAsync({ message });
            },
            async signTypedData(typedData: any) {
              return await signTypedDataAsync(typedData);
            },
          };

          // create delegator smart account
          const delegatorSmartAccount = await toMetaMaskSmartAccount({
            client: publicClient,
            implementation: Implementation.Hybrid,
            deployParams: [address, [], [], []],
            deploySalt: '0x',
            signatory: { account: connectedAccount },
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

  async function createDelegation(): Promise<void> {
    try {
      if (!delegator) {
        throw new Error('Delegator smart account not created yet');
      }

      setCreatingDelegation(true);
      console.log('📜 Creating delegation...');

      // Create delegation
      const delegation = createDelegationToolkit({
        to: DELEGATE_ADDRESS,
        from: delegator.address,
        caveats: [], // Root delegation with no restrictions
      });

      console.log('✍️ Signing delegation...');
      console.log('About to call signDelegation - MetaMask popup should appear');

      // Sign delegation using the smart account
      const signature = await delegator.signDelegation({
        delegation,
      });

      console.log('✅ Signature received:', signature);

      // Validate that we actually got a signature
      if (!signature || signature === undefined) {
        throw new Error('Signature was cancelled or failed - no signature received');
      }

      const newSignedDelegation = {
        ...delegation,
        signature,
      };

      console.log('✅ Delegation created and signed!', newSignedDelegation);
      setSignedDelegation(newSignedDelegation);
    } catch (err) {
      console.error('Error creating delegation:', err);
      throw err;
    } finally {
      setCreatingDelegation(false);
    }
  }

  useEffect(() => {
    // TODO: uncomment this to create delegator after connecting wallet in step 1
    // setupDelegator();
  }, [address, isConnected]);

  return {
    // creatingDelegate,
    creatingDelegator,
    creatingDelegation,
    // delegate,
    delegator,
    signedDelegation,
    setupDelegator,
    createDelegation,
  };
}
