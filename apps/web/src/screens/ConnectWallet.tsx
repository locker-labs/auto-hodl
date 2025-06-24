import { CircleCheckBig } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { ConnectButton } from '@/components/feature/connect-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

export const ConnectWallet = (): React.ReactNode => {
  return (
    <Card className='rounded-xl border-2 border-solid border-[#fce2d8]'>
      <Image src={'/wallet.png'} alt={'wallet'} width={50} height={50} className={'mx-auto'} />
      <div className='w-full'>
        <h2 className='w-[370px] mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Connect MetaMask
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#5D5D5D] text-base tracking-[0] leading-[normal]'>
          Connect your MetaMask wallet to continue
        </p>
      </div>
      <CardContent className='pb-0 pt-[30px] px-[30px]'>
        <Alert className='flex items-center gap-[30px] bg-[#FFF1ED] border-[#ffa2a2] mb-6'>
          <CircleCheckBig className='size-5 min-w-5 min-h-5 text-[#773410]' />
          <AlertDescription className='font-medium text-[#773410] text-base tracking-[0] leading-[normal]'>
            Please connect your MetaMask wallet to proceed with the setup.
          </AlertDescription>
        </Alert>
        <ConnectButton />
        <p className={'mt-3 text-sm text-[#6B6B6B]'}>
          By connecting your wallet, you agree to the Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
};
