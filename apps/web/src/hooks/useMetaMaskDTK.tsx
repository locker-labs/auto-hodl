'use client';

import { useEffect, useState } from 'react';
import { useAccount, useSignMessage, useSignTypedData } from 'wagmi';
import type { MetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import { toMetaMaskSmartAccount, Implementation, createDelegation as createDelegationToolkit, type Delegation } from '@metamask/delegation-toolkit';
import { createWalletClient, custom, type SignableMessage } from 'viem';
import { VIEM_CHAIN, DELEGATE_ADDRESS, DEPLOY_SALT } from '@/config';
import { publicClient } from '@/clients/publicClient';
import { privateKeyToAccount } from 'viem/accounts';
import { createAccountWithSignature, getAccountBySignerAddress } from '@/lib/supabase/createAccount';
import { useAutoHodl } from '@/providers/autohodl-provider';

export function useMetaMaskDTK() {
  const [creatingDelegator, setCreatingDelegator] = useState(false);
  const [delegator, setDelegator] = useState<MetaMaskSmartAccount<Implementation> | null>(null);
  const [creatingDelegation, setCreatingDelegation] = useState(false);
  const [signedDelegation, setSignedDelegation] = useState<Delegation | null>(null);
  const [checkingExistingAccount, setCheckingExistingAccount] = useState(false);
  // const [delegate, setDelegate] = useState(null);
  // const [creatingDelegate, setCreatingDelegate] = useState(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  const { metaMaskCardAddress } = useAutoHodl();
  console.log('delegator', delegator);

  // Check for existing account when wallet connects
  useEffect(() => {
    async function checkExistingAccount() {
      if (!address || !isConnected || checkingExistingAccount) return;

      try {
        setCheckingExistingAccount(true);
        const existingAccount = await getAccountBySignerAddress(address);
        
        if (existingAccount && existingAccount.delegation) {
          console.log('✅ Found existing delegation for user:', address);
          setSignedDelegation(existingAccount.delegation);
        }
      } catch (error) {
        console.error('Error checking existing account:', error);
      } finally {
        setCheckingExistingAccount(false);
      }
    }

    checkExistingAccount();
  }, [address, isConnected]);

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
            deploySalt: DEPLOY_SALT as `0x${string}`,
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

      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!metaMaskCardAddress) {
        throw new Error('MetaMask Card address not provided');
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

      // Save account to database after successful delegation creation using secure API
      try {
        await createAccountWithSignature({
          signerAddress: address,
          tokenSourceAddress: delegator.address,
          triggerAddress: metaMaskCardAddress,
          delegation: newSignedDelegation,
        });
        console.log('✅ Account saved to database via secure API');
      } catch (dbError) {
        console.error('❌ Failed to save account to database:', dbError);
        // Don't throw here - delegation was successful, DB save is secondary
      }
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
    checkingExistingAccount,
    // delegate,
    delegator,
    signedDelegation,
    setupDelegator,
    createDelegation,
  };
}
