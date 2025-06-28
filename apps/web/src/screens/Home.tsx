'use client';

import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import useSteps from '@/hooks/useSteps';
import { CreateDelegation } from '@/screens/CreateDelegation';
import { ConnectWallet } from '@/screens/ConnectWallet';
import { FundSavingsSource } from '@/screens/FundSavingsSource';
import LoadingScreen from '@/screens/LoadingScreen';
import { MetaMaskCard } from '@/screens/MetaMaskCard';
import { SavingsPreferences } from '@/screens/SavingsPreferences';
import { YieldStrategy } from '@/screens/YieldStrategy';
import { Portfolio } from '@/screens/Portfolio';
import { EStep } from '@/enums/step.enums';
import { ConnectButton } from '@/components/feature/connect-button';

function Home() {
  const { step, next, prev, totalSteps, progress } = useSteps();

  const isPortfolioStep = step === EStep.PORTFOLIO;

  // Render the appropriate screen based on the current step
  function renderStep() {
    switch (step) {
      case EStep.CONNECT_WALLET:
        return <ConnectWallet />;
      case EStep.FUND_SAVINGS_SOURCE:
        return <FundSavingsSource onNext={next} onBack={prev} />;
      case EStep.METAMASK_CARD:
        return <MetaMaskCard onNext={next} onBack={prev} />;
      case EStep.SAVING_PREFERENCES:
        return <SavingsPreferences onNext={next} onBack={prev} />;
      case EStep.YIELD_STRATEGY:
        return <YieldStrategy onNext={next} onBack={prev} />;
      case EStep.CREATE_DELEGATION:
        return <CreateDelegation onNext={next} onBack={prev} />;
      case EStep.PORTFOLIO:
        return <Portfolio />;
      default:
        return <LoadingScreen />;
    }
  }

  return (
    <div className='max-w-[1440px] w-full'>
      <div
        className={`mt-[16px] md:mt-[47px] px-2 sm:px-4 lg:px-16 w-full flex flex-row gap-5 items-start ${isPortfolioStep ? 'justify-between' : 'justify-center'}`}
      >
        <div>
          <Image
            className='w-[calc(292px*0.75)] h-[calc(67px*0.75)] md:w-[292px] md:h-[67px] object-cover'
            alt='Autohodl'
            src='/logo.png'
            width='292'
            height='67'
          />
          <div className='hidden md:block md:pl-[16px] font-normal text-[#6b6b6b] text-xl md:text-2xl tracking-[0.24px] leading-[normal]'>
            automatically save USDC by rounding up your purchases
          </div>
        </div>
        {isPortfolioStep ? <ConnectButton className='w-30 md:w-40 min-w-30' /> : null}
      </div>

      <Separator className='mt-4 md:mt-8 w-full h-px bg-[#e6e6e6]' />

      <div className='w-full flex items-center justify-center'>
        {step === EStep.LOADING ? (
          <LoadingScreen />
        ) : step === EStep.PORTFOLIO ? (
          <Portfolio />
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
