'use client';

import { useEffect, useState } from 'react';
import { useAccount, useSignMessage, useSignTypedData } from 'wagmi';
import type { MetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import {
  toMetaMaskSmartAccount,
  Implementation,
  createDelegation as createDelegationToolkit,
  type Delegation,
} from '@metamask/delegation-toolkit';
import { VIEM_CHAIN, DELEGATE_ADDRESS, DEPLOY_SALT } from '@/config';
import { publicClient } from '@/clients/publicClient';
import { createAccountWithSignature, getAccountBySignerAddress } from '@/lib/supabase/createAccount';
import { useAutoHodl } from '@/providers/autohodl-provider';

export function useMetaMaskDTK() {
  const [creatingDelegator, setCreatingDelegator] = useState(false);
  const [delegator, setDelegator] = useState<MetaMaskSmartAccount<Implementation> | null>(null);
  const [creatingDelegation, setCreatingDelegation] = useState(false);
  const [signedDelegation, setSignedDelegation] = useState<Delegation | null>(null);
  const [checkingExistingAccount, setCheckingExistingAccount] = useState(false);
  const [existingAccount, setExistingAccount] = useState<any | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);
  const [accountSaveError, setAccountSaveError] = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  const { metaMaskCardAddress } = useAutoHodl();
  console.log('delegator', delegator);

  // Check for existing account when wallet connects
  useEffect(() => {
    async function checkExistingAccount() {
      if (!address || !isConnected || !chainId || chainId !== VIEM_CHAIN.id) {
        return;
      }

      try {
        setCheckingExistingAccount(true);
        const accountData = await getAccountBySignerAddress(address);

        if (accountData) {
          console.log('✅ Found existing account for user:', address);
          setExistingAccount(accountData);

          if (accountData.delegation) {
            console.log('✅ Found existing delegation for user:', address);
            setSignedDelegation(accountData.delegation);
          }
        } else {
          setExistingAccount(null);
        }
      } catch (error) {
        console.error('Error checking existing account:', error);
        setExistingAccount(null);
      } finally {
        setCheckingExistingAccount(false);
      }
    }

    checkExistingAccount();
  }, [address, isConnected, chainId]);

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

      // Clear any previous errors
      setAccountSaveError(null);
      setAccountSaved(false);

      // Save account to database after successful delegation creation using secure API
      try {
        await createAccountWithSignature({
          signerAddress: address,
          tokenSourceAddress: delegator.address,
          triggerAddress: metaMaskCardAddress,
          delegation: newSignedDelegation,
        });
        console.log('✅ Account saved to database via secure API');
        setAccountSaved(true);
        setSignedDelegation(newSignedDelegation); // Only set this after successful save
      } catch (dbError) {
        console.error('❌ Failed to save account to database:', dbError);
        const errorMessage = dbError instanceof Error ? dbError.message : 'Failed to save account';
        setAccountSaveError(errorMessage);
        // Don't set signedDelegation if account save fails
        throw new Error(`Account creation failed: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error creating delegation:', err);
      throw err;
    } finally {
      setCreatingDelegation(false);
    }
  }

  return {
    creatingDelegator,
    creatingDelegation,
    checkingExistingAccount,
    existingAccount,
    delegator,
    signedDelegation,
    accountSaved,
    accountSaveError,
    setupDelegator,
    createDelegation,
  };
}
