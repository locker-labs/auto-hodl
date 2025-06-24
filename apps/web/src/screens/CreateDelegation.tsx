import { InfoIcon } from 'lucide-react';
import type React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface BankAccountProps {
  onNext: () => void;
  onBack: () => void;
}

export const CreateDelegation = ({ onNext, onBack }: BankAccountProps): React.ReactNode => {
  const handleContinue = () => {
    onNext();
  };

  return (
    <Card className='w-full rounded-xl border-2 border-solid border-[#fce2d8]'>
      <div className='w-full p-4'>
        <h2 className='w-fit mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Sign Delegation
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#773410] text-base tracking-[0] leading-[normal]'>
          Allow us to save on your behalf by signing a delegation
        </p>
      </div>

      <CardContent className='pb-0 px-[30px]'>
        <Alert className='flex items-center gap-[30px] bg-[#fff1ed63] border-[#ffa2a2] mb-6'>
          <InfoIcon className='w-5 h-5 text-[#773410]' />
          <AlertDescription className='font-medium text-[#773410] text-base tracking-[0] leading-[normal]'>
            TODO: Create delegator account, delegate account, create delegation, save signed delegation
          </AlertDescription>
        </Alert>

        <div className='flex flex-col space-y-4'>
          <Button
            onClick={handleContinue}
            disabled={false}
            className='w-full h-12 bg-[#ff7a45] hover:bg-[#ff6a35] disabled:bg-[#ffb399] disabled:cursor-not-allowed text-white rounded-xl font-bold text-base'
          >
            Complete Setup
          </Button>
          <Button
            onClick={onBack}
            variant='outline'
            className='w-full h-12 border-[#e0e0e0] text-[#6b6b6b] hover:bg-[#f5f5f5] rounded-xl font-medium text-base'
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
