'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';
import type { ToCircleSmartAccountReturnType } from '@circle-fin/modular-wallets-core';
import { createCircleClients } from '@/clients/circleClient';
import { createCircleSmartAccount } from '@/lib/circle/createSmartAccount';
import type { SmartAccount } from 'viem/account-abstraction';

type CircleSmartAccountContextType = {
  account: SmartAccount<any>;
  error: string | null;
  handleCreateSmartAccount: () => Promise<void>;
  handleSendTransaction: () => Promise<void>;
  loading: boolean;
  transactionHash: string | null;
};

const CircleSmartAccountContext = createContext<CircleSmartAccountContextType | undefined>(undefined);

export const useCircleSmartAccount = () => {
  const context = useContext(CircleSmartAccountContext);
  if (!context) {
    throw new Error('useCircleSmartAccount must be used within a CircleSmartAccountContext');
  }
  return context;
};

type Props = {
  children: ReactNode;
};

export const CircleSmartAccountProvider: FC<Props> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<ToCircleSmartAccountReturnType | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  console.log('CIRCLE ACCOUNT', account);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  console.log('walletClient...', !!walletClient, walletClient);

  const handleCreateSmartAccount = async () => {
    if (!isConnected || !address || !walletClient) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const smartAccount = await createCircleSmartAccount(walletClient);
      setAccount(smartAccount);

      console.log('Circle Smart Account created:', smartAccount);
    } catch (err) {
      console.error('Smart Account creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create Smart Account');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!account) {
      setError('No smart account available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { bundlerClient } = createCircleClients();

      // Example transaction: send 0.001 ETH to self
      const userOpHash = await bundlerClient.sendUserOperation({
        account,
        calls: [
          {
            to: account.address,
            value: parseUnits('0.00001', 18),
            data: '0x',
          },
        ],
        paymaster: true, // Enable gas sponsorship
      });

      setTransactionHash(userOpHash);

      // Wait for transaction receipt
      const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      console.log('Transaction successful:', receipt);
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CircleSmartAccountContext.Provider
      value={{
        account,
        error,
        handleCreateSmartAccount,
        handleSendTransaction,
        loading,
        transactionHash,
      }}
    >
      {children}
    </CircleSmartAccountContext.Provider>
  );
};
