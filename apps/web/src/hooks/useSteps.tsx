'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useMetaMaskDTK } from './useMetaMaskDTK';
import { useCheckChain } from '@/hooks/useCheckChain';
import { EStep } from '@/enums/step.enums';

export default function useSteps() {
  const { isConnected, isConnecting } = useAccount();
  const { shouldSwitchChain } = useCheckChain();
  const { signedDelegation, checkingExistingAccount } = useMetaMaskDTK();

  const [step, setStep] = useState(EStep.CONNECT_WALLET);

  const totalSteps = EStep.PORTFOLIO;
  const progress: number = step === EStep.LOADING ? EStep.LOADING : Math.round(((step - 1) / totalSteps) * 100);

  const next = () => setStep((prevStep) => prevStep + 1);
  const prev = () => setStep((prevStep) => prevStep - 1);

  useEffect(() => {
    if (!isConnecting && !checkingExistingAccount) {
      if (!isConnected || shouldSwitchChain) {
        setStep(EStep.CONNECT_WALLET);
      } else {
        // If user has existing delegation, go directly to Portfolio
        if (signedDelegation) {
          setStep(EStep.PORTFOLIO);
        } else {
          setStep(EStep.FUND_SAVINGS_SOURCE);
        }
      }
    }
  }, [isConnected, isConnecting, signedDelegation, checkingExistingAccount, shouldSwitchChain]);

  return { step, next, prev, totalSteps, progress };
}
