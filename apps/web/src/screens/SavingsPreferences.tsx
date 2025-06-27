import { CalendarIcon, CreditCardIcon, WalletIcon } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const SavingsPreferences = ({ onNext, onBack }: Props): React.JSX.Element => {
  // Transaction options data
  const transactionOptions = [
    {
      id: 'card-only',
      title: 'Card Only',
      description: 'Round up your card transactions',
      icon: <CreditCardIcon className='w-7 h-7' color={'#ff6f35'} />,
      selected: true,
      disabled: false,
    },
    {
      id: 'all-transactions',
      title: 'All Transactions',
      description: 'Round up all your purchases',
      icon: <WalletIcon className='w-7 h-7' />,
      selected: false,
      disabled: true,
    },
    {
      id: 'monthly-savings',
      title: 'Monthly Savings',
      description: 'Save a fixed amount monthly',
      icon: <CalendarIcon className='w-7 h-7' />,
      selected: false,
      disabled: true,
    },
  ];

  // Rounding options data
  const roundingOptions = [
    { value: '$1', selected: true, disabled: false, example: '$4.30 purchase → Save $0.70' },
    { value: '$10', selected: false, disabled: true, example: '$43 purchase → Save $7' },
    { value: '$100', selected: false, disabled: true, example: '$430 purchase → Save $70' },
  ];

  const selectedRoundingOption = roundingOptions[0];

  return (
    <Card className='w-full px-[30px] rounded-xl border-2 border-solid border-[#fce2d8]'>
      <div className='w-full p-4'>
        <h2 className='w-fit mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Savings Preferences
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#5D5D5D] text-base tracking-[0] leading-[normal]'>
          Choose how you want to save automatically
        </p>
      </div>

      <div className='mb-[-8px] font-medium text-[#2d2d2d] text-base tracking-[0] leading-[normal] whitespace-nowrap'>
        What transactions should we round up?
      </div>

      <div className='flex gap-4'>
        {transactionOptions.map((option) => (
          <div
            key={option.id}
            className={`flex flex-col w-full items-start gap-2.5 pt-[25px] pb-[19px] px-[18px] rounded-xl border border-solid ${
              option.selected ? 'bg-[#fef6f2] border-[#ff7a45]' : 'border-[#a0a0a0] bg-[#e1e1e2]'
            }
            ${option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className='flex flex-col w-full items-center gap-[8px] relative flex-[0_0_auto]'>
              <div className='relative w-7 h-7'>{option.icon}</div>

              <div className='flex flex-col items-center gap-1 relative self-stretch w-full flex-[0_0_auto]'>
                <div
                  className={`relative self-stretch  text-base text-center tracking-[0] leading-[normal] ${
                    option.selected ? 'font-bold text-[#773410]' : 'font-semibold text-[#2d2d2d]'
                  }`}
                >
                  {option.title}
                </div>

                <div className='relative self-stretch light text-[#6b6b6b] text-xs text-center tracking-[0] leading-[normal]'>
                  {option.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-[12px] mb-[-8px] font-medium text-[#2d2d2d] text-base tracking-[0] leading-[normal] whitespace-nowrap'>
        Round up to the nearest:
      </div>

      <div className='flex gap-4'>
        {roundingOptions.map((option) => (
          <div
            key={`rounding-${option.value}`}
            className={`flex flex-col w-full items-start gap-2.5 pt-[18px] pb-[19px] px-[18px] rounded-xl border border-solid
            ${option.selected ? 'bg-[#fef6f2] border-[#ff7a45]' : 'border-[#a0a0a0] bg-[#e1e1e2]'}
            
            ${option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className='flex flex-col w-full items-center gap-[23px] relative flex-[0_0_auto] mb-[-1.00px]'>
              <div className='flex flex-col items-center gap-1 relative self-stretch w-full flex-[0_0_auto]'>
                <div
                  className={`relative self-stretch mt-[-1.00px] text-[32px] text-center tracking-[0] leading-[normal] font-bold ${
                    option.selected ? 'text-[#773410]' : 'text-[#a0a0a0]'
                  }`}
                >
                  {option.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='font-normal text-[#6b6b6b] text-base text-center tracking-[0] leading-[normal] whitespace-nowrap'>
        Example: {selectedRoundingOption.example}
      </div>

      <CardContent className={'px-0'}>
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
