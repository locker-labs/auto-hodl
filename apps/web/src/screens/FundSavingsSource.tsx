'use client';

import { CircleCheckBig } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMetaMaskDTK } from '@/hooks/useMetaMaskDTK';
import { VIEM_CHAIN } from '@/config';

export interface FundSavingsSourceProps {
  onNext: () => void;
  onBack: () => void;
}

export const FundSavingsSource = ({ onNext }: FundSavingsSourceProps): React.ReactNode => {
  const { delegator, creatingDelegator, setupDelegator } = useMetaMaskDTK();

  // Setup delegator when component mounts
  useEffect(() => {
    if (setupDelegator && !delegator && !creatingDelegator) {
      setupDelegator();
    }
  }, [setupDelegator, delegator, creatingDelegator]);

  const handleContinue = () => {
    onNext();
  };

  return (
    <Card className='rounded-xl border-2 border-solid border-[#fce2d8]'>
      <Image src={'/wallet.png'} alt={'wallet'} width={50} height={50} className={'mx-auto'} />
      <div className='w-full px-[30px]'>
        <h2 className='w-[370px] mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Fund Savings Source
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#5D5D5D] text-base tracking-[0] leading-[normal]'>
          USDC will be transferred from this account every time you spend with your MetaMask Card.
        </p>
      </div>
      <CardContent className='pb-0 px-[30px]'>
        <Alert className='flex items-center gap-[30px] bg-[#FFF1ED] border-[#ffa2a2] mb-6'>
          <CircleCheckBig className='size-5 min-w-5 min-h-5' color={'#ff6f35'} />
          <AlertDescription className='font-medium text-[#773410] text-base tracking-[0] leading-[normal]'>
            {delegator ? (
              <>
                Send USDC on {VIEM_CHAIN.name} to {delegator.address}
              </>
            ) : (
              <>Creating delegator account...</>
            )}
          </AlertDescription>
        </Alert>
        <Button
          onClick={handleContinue}
          disabled={creatingDelegator}
          className='w-full h-12 bg-[#ff7a45] hover:bg-[#ff6a35] disabled:bg-[#ffb399] disabled:cursor-not-allowed text-white rounded-xl font-bold text-base cursor-pointer'
        >
          {creatingDelegator ? 'Creating Account...' : 'Continue'}
        </Button>
        <p className={'mt-3 text-sm text-[#6B6B6B]'}>
          This account will hold USDC that gets transferred to Aave for savings.
        </p>
      </CardContent>
    </Card>
  );
};
