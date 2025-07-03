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
import { getCaveats } from "@/lib/utils";
import { pimlicoClient } from "@/clients/pimlicoClient";
import { bundlerClient } from "@/clients/bundlerClient";
import { zeroAddress, type Hex } from "viem";
import { EChainMode } from '@/enums/chainMode.enums';

export function useMetaMaskDTK() {
  const [creatingDelegator, setCreatingDelegator] = useState(false);
  const [delegator, setDelegator] = useState<MetaMaskSmartAccount<Implementation> | null>(null);
  const [deployedDelegator, setDeployedDelegator] = useState(false);
  const [deployingDelegator, setDeployingDelegator] = useState(false);
  const [delegatorDeployError, setDelegatorDeployError] = useState<string | null>(null);
  const [creatingDelegation, setCreatingDelegation] = useState(false);
  const [signedDelegation, setSignedDelegation] = useState<Delegation | null>(null);
  const [checkingExistingAccount, setCheckingExistingAccount] = useState(false);
  const [existingAccount, setExistingAccount] = useState<any | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);
  const [accountSaveError, setAccountSaveError] = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  const { metaMaskCardAddress, chainMode } = useAutoHodl();
  const isMultiChainMode = chainMode === EChainMode.MULTI_CHAIN;
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
    async function checkDelegatorDeployment() {
      if (!address || !isConnected || !delegator) {
        return;
      }
      const isDeployed = await delegator.isDeployed();
      console.log('Delegator is deployed:', isDeployed);
      setDeployedDelegator(isDeployed);
    }
    checkDelegatorDeployment();
    checkExistingAccount();
  }, [address, isConnected, chainId, delegator]);

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

  async function deployDelegator(): Promise<void> {
    if (!delegator) {
      console.error('Delegator not set, skipping deploying delegator');
      setDelegatorDeployError('Delegator smart account not created yet');
      throw new Error('Delegator smart account not created yet');
    }

    // Reset deploy state
    setDelegatorDeployError(null);
    setDeployedDelegator(false);
    setDeployingDelegator(true);

    try {
      console.log('Getting gas price for user operation...');
      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

      const call = {
        to: zeroAddress as Hex,
        value: BigInt(0),
        data: '0x' as Hex,
      };

      console.log('🔒 Delegator Account:', delegator.address);
      console.log('🧠 Delegator Smart Account:', delegator.address);
      console.log('🚀 Deploying delegator smart account...');

      const userOperationHash = await bundlerClient.sendUserOperation({
        account: delegator,
        calls: [call],
        ...fee,
      });

      if (userOperationHash) {
        setDeployedDelegator(true);
        console.log('✅ Delegator deployed successfully:', delegator.address);
      }

      console.log('👨‍💻 User operation sent:', userOperationHash);
    } catch (error) {
      console.error('Error deploying delegator:', error);
      setDelegatorDeployError(error instanceof Error ? error.message : 'Failed to deploy delegator');
      throw error; // Re-throw to handle in calling function
    } finally {
      setDeployingDelegator(false);
    }
  }

  async function createDelegation(circleAddress: string | undefined): Promise<void> {
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

      if (!chainMode) {
        throw new Error('Chain mode not selected');
      }

      if (isMultiChainMode && !circleAddress) {
        throw new Error('Circle Smart Account not available in multi-chain mode');
      }

      setCreatingDelegation(true);
      console.log('📜 Creating delegation...');
      // Update to savings roundUpTo value
      const caveats = getCaveats(delegator, BigInt(1000000), chainMode);
      // Create delegation
      const delegation = createDelegationToolkit({
        to: DELEGATE_ADDRESS,
        from: delegator.address,
        caveats,
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
          chainId: String(VIEM_CHAIN.id),
          chainMode,
          circleAddress,
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
    deployDelegator,
    deployedDelegator,
    deployingDelegator,
    delegatorDeployError,
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
