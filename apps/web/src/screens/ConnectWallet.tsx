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
      <div className='w-full px-[30px]'>
        <h2 className='w-[370px] mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Connect Your Wallet
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#5D5D5D] text-base tracking-[0] leading-[normal]'>
          We'll create a new DeleGator account for you derived from your connected wallet.
        </p>
      </div>
      <CardContent className='pb-0 px-[30px]'>
        <Alert className='flex items-center gap-[30px] bg-[#FFF1ED] border-[#ffa2a2] mb-6'>
          <CircleCheckBig className='size-5 min-w-5 min-h-5 text-[#773410]' />
          <AlertDescription className='font-medium text-[#773410] text-base tracking-[0] leading-[normal]'>
            In production, this would be the EOA that is funding your MetaMask Card and we'd use 7715 to request delegation permissions from the 7702 linked account.
          </AlertDescription>
        </Alert>
        <ConnectButton />
        <p className={'mt-3 text-sm text-[#6B6B6B]'}>
          For demo purposes, you do not need to have a MetaMask Card to use this app.
        </p>
      </CardContent>
    </Card>
  );
};
