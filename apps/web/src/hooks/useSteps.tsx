'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export default function useSteps() {
  const { isConnected, isConnecting } = useAccount();
  const [step, setStep] = useState(0);

  const totalSteps = 4;
  const progress: number = step === 0 ? 0 : Math.round(((step - 1) / totalSteps) * 100);

  const next = () => setStep((prevStep) => prevStep + 1);
  const prev = () => setStep((prevStep) => prevStep - 1);

  useEffect(() => {
    if (!isConnecting) {
      if (!isConnected) {
        setStep(1);
      } else {
        setStep(2);
      }
    }
  }, [isConnected, isConnecting]);

  return { step, next, prev, totalSteps, progress };
}
