import { Loader2, AlertCircle } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMetaMaskDTK } from '@/hooks/useMetaMaskDTK';
import { useEffect } from 'react';

export interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const CreateDelegation = ({ onNext, onBack }: Props): React.ReactNode => {
  const { 
    setupDelegator, 
    delegator, 
    creatingDelegator, 
    createDelegation, 
    creatingDelegation, 
    signedDelegation,
    accountSaved,
    accountSaveError
  } = useMetaMaskDTK();

  // Setup delegator when component mounts
  useEffect(() => {
    if (setupDelegator && !delegator && !creatingDelegator) {
      setupDelegator();
    }
  }, [setupDelegator, delegator, creatingDelegator]);

  // Automatically proceed to next step when delegation is successfully created AND account is saved
  useEffect(() => {
    if (signedDelegation && accountSaved && !creatingDelegation && !accountSaveError) {
      // Small delay to show the "Account Created!" state briefly
      const timer = setTimeout(() => {
        onNext();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [signedDelegation, accountSaved, creatingDelegation, accountSaveError, onNext]);

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
    <Card className='w-full rounded-xl border-2 border-solid border-[#fce2d8] px-[30px]'>
      <div className='w-full py-4'>
        <h2 className='w-fit mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Grant Permission
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#773410] text-base tracking-[0] leading-[normal]'>
          Press the button below and grant permission to enable the following:
        </p>

        <ol className='w-fit mx-auto mt-8 font-medium text-[#773410] text-base tracking-[0] leading-[normal] list-decimal list-inside space-y-4'>
          <li>Use or simulate usage of a MetaMask Card by sending USDC from your wallet.</li>
          <li>We'll withdraw funds from your source of funds and deposit into Aave to earn yield.</li>
        </ol>
      </div>

      <CardContent className='p-0'>
        <div className='flex flex-col space-y-4'>
          {accountSaveError && (
            <Alert className='border-red-200 bg-red-50'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-800'>
                Failed to create account: {accountSaveError}. Please try again.
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleContinue}
            disabled={!delegator || creatingDelegation}
            className='w-full h-12 bg-[#ff7a45] hover:bg-[#ff6a35] disabled:bg-[#ffb399] disabled:cursor-not-allowed text-white rounded-xl font-bold text-base cursor-pointer'
          >
            {creatingDelegation ? (
              <div className={'flex items-center justify-center gap-2'}>
                <Loader2 className={'animate-spin size-5'} color={'white'} />
                <span>Creating Account</span>
              </div>
            ) : signedDelegation && accountSaved ? (
              <div className={'flex items-center justify-center gap-2'}>
                <Loader2 className={'animate-spin size-5'} color={'white'} />
                <span>Account Created! Proceeding</span>
              </div>
            ) : accountSaveError ? (
              'Retry Account Creation'
            ) : (
              'Grant Permission'
            )}
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
