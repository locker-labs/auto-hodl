'use client';

import { CircleCheckBig, Loader2, AlertCircle } from 'lucide-react';
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
  const {
    deployDelegator,
    deployedDelegator,
    deployingDelegator,
    delegatorDeployError,
    delegator,
    creatingDelegator,
    setupDelegator,
  } = useMetaMaskDTK();

  // Setup delegator when component mounts
  useEffect(() => {
    if (setupDelegator && !delegator && !creatingDelegator) {
      setupDelegator();
    }
  }, [setupDelegator, delegator, creatingDelegator]);

  const handleContinue = async () => {
    if (!deployedDelegator) {
      try {
        await deployDelegator();
      } catch {
        return;
      }
    }
    onNext();
  };

  return (
    <Card className='rounded-xl border-2 border-solid border-[#fce2d8]'>
      <Image src={'/wallet.png'} alt={'wallet'} width={50} height={50} className={'mx-auto'} />
      <div className='w-full px-[30px]'>
        <h2 className='mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Fund Your Savings Source
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#5D5D5D] text-base tracking-[0] leading-[normal]'>
          USDC will be transferred from this account every time you spend with your MetaMask Card.
        </p>
        <p className='w-fit mx-auto mt-2 font-medium text-[#5D5D5D] text-base tracking-[0] leading-[normal]'>
          Deploy this new delegator account by signing a mock transaction.
        </p>
        <p className='w-fit mx-auto mt-2 font-medium text-[#5D5D5D] text-base tracking-[0] leading-[normal]'>
          In production the source of funds would be one of the accounts funding your Card.
          </p>
      </div>
      <CardContent className='pb-0 px-[30px]'>
        <Alert className='flex items-center gap-[30px] bg-[#FFF1ED] border-[#ffa2a2] mb-6'>
          <CircleCheckBig className='size-5 min-w-5 min-h-5' color={'#ff6f35'} />
          <AlertDescription className='font-medium text-[#773410] text-base tracking-[0] leading-[normal]'>
            {!delegator ? 'Creating delegator account...' : `Send USDC on ${VIEM_CHAIN.name} to ${delegator.address}`}
          </AlertDescription>
        </Alert>

        {delegatorDeployError && (
          <Alert className='border-red-200 bg-red-50 mb-6'>
            <AlertCircle className='h-4 w-4' color={'#9b2c2c'} />
            <AlertDescription className='text-red-800'>
              <p>Failed to deploy account. Please try again.</p>
              <div className='flex flex-col items-center justify-center'>
                <pre className='mt-2 max-h-[200px] max-w-[60vw] sm:w-100 sm:max-w-100 overflow-scroll'>
                  {delegatorDeployError}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleContinue}
          disabled={creatingDelegator || deployingDelegator}
          className='w-full h-12 bg-[#ff7a45] hover:bg-[#ff6a35] disabled:bg-[#ffb399] disabled:cursor-not-allowed text-white rounded-xl font-bold text-base cursor-pointer'
        >
          {deployingDelegator ? (
            <div className={'flex items-center justify-center gap-2'}>
              <Loader2 className={'animate-spin size-5'} color={'white'} />
              <span>Deploying</span>
            </div>
          ) : creatingDelegator ? (
            <div className={'flex items-center justify-center gap-2'}>
              <Loader2 className={'animate-spin size-5'} color={'white'} />
              <span>Creating Account</span>
            </div>
          ) : deployedDelegator ? (
            'Continue'
          ) : (
            'Deploy account'
          )}
        </Button>
        <p className={'mt-3 text-sm text-[#6B6B6B]'}>
          For demo purposes, you do not need to have a MetaMask Card to use this app.
        </p>
        <p className={'mt-3 text-sm text-[#6B6B6B]'}>
          Linea does not currently support DTK/Gator. We are using {VIEM_CHAIN.name} for demo purposes.
        </p>
        <p className={'mt-3 text-sm text-[#6B6B6B]'}>
          We listen for deposits to the MM Card contract address from the trigger account you'll specify. This simulates usage of MM Card.
        </p>
      </CardContent>
    </Card>
  );
};
