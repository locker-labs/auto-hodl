'use client';

import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import useSteps from '@/hooks/useSteps';
import { CreateDelegation } from '@/screens/CreateDelegation';
import { ConnectWallet } from '@/screens/ConnectWallet';
import LoadingScreen from '@/screens/LoadingScreen';
import { MetaMaskCard } from '@/screens/MetaMaskCard';
import { useMetaMaskDTK } from '@/hooks/useMetaMaskDTK';

function Home() {
  const { step, next, prev, totalSteps, progress } = useSteps();
  const { setupDelegator } = useMetaMaskDTK();

  // Render the appropriate screen based on the current step
  function renderStep() {
    switch (step) {
      case 1:
        return <ConnectWallet />;
      case 2:
        return <MetaMaskCard onNext={next} onBack={prev} />;
      case 3:
        return <CreateDelegation onNext={next} onBack={prev} setupDelegator={setupDelegator} />;
      default:
        return <LoadingScreen />;
    }
  }

  return (
    <div className='max-w-[1440px] w-full'>
      <div
        className={
          'w-full md:mx-16 px-4 md:px-0 md:w-auto flex md:block flex-col items-center justify-center text-center md:text-left'
        }
      >
        <Image
          className='w-[calc(292px*0.75)] h-[calc(67px*0.75)] md:w-[292px] md:h-[67px] mt-[16px] md:mt-[47px] object-cover'
          alt='Autohodl'
          src='/logo.png'
          width='292'
          height='67'
        />

        <div className='hidden md:block md:pl-[16px] font-normal text-[#6b6b6b] text-xl md:text-2xl tracking-[0.24px] leading-[normal]'>
          automatically save cryptocurrency by rounding up your purchases.
        </div>
      </div>

      <Separator className='mt-4 md:mt-8 w-full h-px bg-[#e6e6e6]' />

      <div className='w-full flex items-center justify-center'>
        {step === 0 ? (
          <LoadingScreen />
        ) : (
          <div className='w-full max-w-xl justify-center items-start px-4'>
            {/* Progress bar info */}
            <div className='mt-[48px] flex items-center justify-between'>
              <div className='font-normal text-[#6b6b6b] text-base tracking-[0.16px] leading-[normal] whitespace-nowrap'>
                Step {step} of {totalSteps}
              </div>
              <div className='font-normal text-[#6b6b6b] text-base tracking-[0.16px] leading-[normal] whitespace-nowrap'>
                {progress}% complete
              </div>
            </div>

            {/* Progress bar */}
            <div className='mt-3 h-[11px] w-full'>
              <div className='h-[11px]'>
                <Progress value={progress} className='h-2.5 top-px left-0 bg-[#fef6f2] rounded-xl' />
              </div>
            </div>
            {/* Steps */}
            <div className='mt-6 max-w-xl w-full'>{renderStep()}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
