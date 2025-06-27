import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface PortfolioProps {
  onNext?: () => void;
  onBack?: () => void;
}

export const Portfolio = ({ onNext, onBack }: PortfolioProps): React.ReactNode => {
  return (
    <Card className='w-full rounded-xl border-2 border-solid border-[#fce2d8]'>
      <div className='w-full p-4'>
        <h2 className='w-fit mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Portfolio
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#773410] text-base tracking-[0] leading-[normal] text-center'>
          Your auto-HODL savings portfolio
        </p>
      </div>

      <CardContent className='pb-6 px-[30px]'>
        <div className='flex flex-col items-center justify-center min-h-[200px] space-y-4'>
          <div className='text-center'>
            <p className='text-[#6b6b6b] text-lg font-medium'>
              Coming Soon
            </p>
            <p className='text-[#6b6b6b] text-sm mt-2'>
              Your delegation is active and ready to start saving automatically.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 