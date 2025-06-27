import { InfoIcon } from 'lucide-react';
import type React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMetaMaskDTK } from '@/hooks/useMetaMaskDTK';
import { useEffect } from 'react';

export interface BankAccountProps {
  onNext: () => void;
  onBack: () => void;
}

export const CreateDelegation = ({ onNext, onBack }: BankAccountProps): React.ReactNode => {
  const { setupDelegator, delegator, creatingDelegator, createDelegation, creatingDelegation, signedDelegation } = useMetaMaskDTK();

  // Setup delegator when component mounts
  useEffect(() => {
    if (setupDelegator && !delegator && !creatingDelegator) {
      setupDelegator();
    }
  }, [setupDelegator, delegator, creatingDelegator]);

  // Automatically proceed to next step when delegation is successfully created
  useEffect(() => {
    if (signedDelegation && !creatingDelegation) {
      // Small delay to show the "Delegation Created!" state briefly
      const timer = setTimeout(() => {
        onNext();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [signedDelegation, creatingDelegation, onNext]);

  const handleContinue = async () => {
    try {
      if (signedDelegation) {
        console.log('Delegation already exists, proceeding to next step');
        // Delegation already exists, proceed to next step
        onNext();
      } else {
        console.log('Starting delegation creation...');
        // Create the delegation (this will update signedDelegation state)
        await createDelegation();
        console.log('createDelegation() completed - should have signature now');
      }
    } catch (error) {
      console.error('Failed to create delegation:', error);
      // Reset any loading states since delegation failed
      // The error will be handled by the createDelegation function's finally block
    }
  };

  return (
    <Card className='w-full rounded-xl border-2 border-solid border-[#fce2d8]'>
      <div className='w-full p-4'>
        <h2 className='w-fit mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Grant Permission
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#773410] text-base tracking-[0] leading-[normal]'>
          Press the button below and grant permission to enable the following:
        </p>

        <ol className='w-fit mx-auto mt-2 font-medium text-[#773410] text-base tracking-[0] leading-[normal] list-decimal list-inside space-y-1'>
          <li>Use or simulate usage of a MetaMask Card by sending USDC from your wallet.</li>
          <li>We'll withdraw funds from your source of funds and deposit into Aave to earn yield.</li>
        </ol>
      </div>

      <CardContent className='pb-0 px-[30px]'>
        <div className='flex flex-col space-y-4'>
          <Button
            onClick={handleContinue}
            disabled={!delegator || creatingDelegation}
            className='w-full h-12 bg-[#ff7a45] hover:bg-[#ff6a35] disabled:bg-[#ffb399] disabled:cursor-not-allowed text-white rounded-xl font-bold text-base cursor-pointer'
          >
            {creatingDelegation ? 'Creating Delegation...' : signedDelegation ? 'Delegation Created! Proceeding...' : 'Grant Permission'}
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
