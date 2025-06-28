'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useMetaMaskDTK } from './useMetaMaskDTK';
import { useCheckChain } from '@/hooks/useCheckChain';
import { EStep } from '@/enums/step.enums';

export default function useSteps() {
  const { isConnected, isConnecting } = useAccount();
  const { shouldSwitchChain } = useCheckChain();
  const { checkingExistingAccount, existingAccount } = useMetaMaskDTK();

  const [step, setStep] = useState(EStep.LOADING);
  console.log({
    step,
    isConnected,
    isConnecting,
    checkingExistingAccount,
    existingAccount,
    shouldSwitchChain,
  });

  const totalSteps = EStep.PORTFOLIO;
  const progress: number = step === EStep.LOADING ? EStep.LOADING : Math.round(((step - 1) / totalSteps) * 100);

  const next = () => setStep((prevStep) => prevStep + 1);
  const prev = () => setStep((prevStep) => prevStep - 1);

  useEffect(() => {
    if (checkingExistingAccount) {
      setStep(EStep.LOADING);
    } else if (!isConnecting && !checkingExistingAccount) {
      if (!isConnected || shouldSwitchChain) {
        setStep(EStep.CONNECT_WALLET);
      } else {
        // If user has existing account, go directly to Portfolio
        if (existingAccount) {
          setStep(EStep.PORTFOLIO);
        } else {
          setStep(EStep.FUND_SAVINGS_SOURCE);
        }
      }
    }
  }, [isConnected, isConnecting, existingAccount, checkingExistingAccount, shouldSwitchChain]);

  return { step, next, prev, totalSteps, progress };
}
