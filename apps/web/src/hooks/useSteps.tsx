'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useMetaMaskDTK } from './useMetaMaskDTK';
import { useCheckChain } from '@/hooks/useCheckChain';

export default function useSteps() {
  const { isConnected, isConnecting } = useAccount();
  const { shouldSwitchChain } = useCheckChain();
  const { signedDelegation, checkingExistingAccount } = useMetaMaskDTK();

  const [step, setStep] = useState(0);

  const totalSteps = 5;
  const progress: number = step === 0 ? 0 : Math.round(((step - 1) / totalSteps) * 100);

  const next = () => setStep((prevStep) => prevStep + 1);
  const prev = () => setStep((prevStep) => prevStep - 1);

  useEffect(() => {
    if (!isConnecting && !checkingExistingAccount) {
      if (!isConnected || shouldSwitchChain) {
        setStep(1);
      } else {
        // If user has existing delegation, go directly to Portfolio
        if (signedDelegation) {
          setStep(5);
        } else {
          setStep(2);
        }
      }
    }
  }, [isConnected, isConnecting, signedDelegation, checkingExistingAccount, shouldSwitchChain]);

  return { step, next, prev, totalSteps, progress };
}
