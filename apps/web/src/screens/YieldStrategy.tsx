import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const YieldStrategy = ({ onNext, onBack }: Props): React.JSX.Element => {
  // Strategy options data
  const strategies = [
    {
      id: 'low-risk',
      title: 'Low Risk Strategy',
      apy: '~4.2% APY',
      description: 'USDC on Aave',
      benefit: 'Stable returns',
      isSelected: true,
      color: 'text-[#187710]',
      bgColor: 'bg-[#f5fef2]',
      borderColor: 'border-[#197710]',
      disabled: false,
    },
    {
      id: 'high-risk',
      title: 'High Risk Strategy',
      apy: '~12.8% APY',
      description: 'Auto-managed portfolio',
      benefit: 'Higher potential',
      isSelected: false,
      color: 'text-[#771010]',
      bgColor: '',
      borderColor: 'border-[#a0a0a0]',
      disabled: true,
    },
  ];

  return (
    <Card className='w-full px-[30px] rounded-xl border-2 border-solid border-[#fce2d8]'>
      <div className='w-full p-4'>
        <h2 className='w-fit mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Yield Strategy
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#5D5D5D] text-base tracking-[0] leading-[normal]'>
          Choose how you want to grow your crypto
        </p>
      </div>

      <div className='flex flex-col gap-4'>
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className={`w-full py-[18px] px-5 rounded-xl border border-solid
             ${
               strategy.disabled
                 ? 'cursor-not-allowed bg-[#e1e1e2] border-[#a0a0a0]'
                 : `cursor-pointer ${strategy.bgColor} ${strategy.borderColor}`
             }
                relative`}
          >
            <div className='flex justify-between'>
              <h4 className={`font-bold ${strategy.color} text-base`}>{strategy.title}</h4>
              <span className={`font-bold ${strategy.color} text-base`}>{strategy.apy}</span>
            </div>
            <div className='flex justify-between'>
              <span className='font-light text-black text-[12px]'>{strategy.description}</span>
              <span className='font-light text-black text-[12px]'>{strategy.benefit}</span>
            </div>
          </div>
        ))}
      </div>

      <CardContent className={'mt-6 px-0'}>
        <div className='flex flex-col space-y-4'>
          <Button
            onClick={onNext}
            disabled={false}
            className='w-full h-12 bg-[#ff7a45] hover:bg-[#ff6a35] disabled:bg-[#ffb399] disabled:cursor-not-allowed text-white rounded-xl font-bold text-base cursor-pointer'
          >
            Continue
          </Button>
          <Button
            onClick={onBack}
            variant='outline'
            className='w-full h-12 border-[#e0e0e0] text-[#6b6b6b] hover:bg-[#f5f5f5] rounded-xl font-medium text-base cursor-pointer'
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
