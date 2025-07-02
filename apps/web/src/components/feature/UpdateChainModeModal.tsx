'use client';

import { Cog, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAutoHodl } from '@/providers/autohodl-provider';
import { EChainMode } from '@/enums/chainMode.enums';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { updateAccountWithChainMode } from '@/lib/supabase/updateAccount';
import { useMetaMaskDTK } from '@/hooks/useMetaMaskDTK';
import { VIEM_CHAIN } from '@/config';

export function UpdateChainModeModal() {
  const [switchingMode, setSwitchingMode] = useState(false);
  const { chainMode, setChainMode } = useAutoHodl();
  const { existingAccount } = useMetaMaskDTK();

  const isMultiChainMode = chainMode === EChainMode.MULTI_CHAIN;

  const handleSwitchMode = async () => {
    if (!existingAccount) {
      throw new Error('Account is not available!');
    }

    if (!chainMode) {
      throw new Error('Chain Mode is not available!');
    }

    try {
      setSwitchingMode(true);

      //   TODO: update caveat enforcers, sign delegation by connected eoa, save delegation to db

      //   Api call to database to update chain mode
      const newChainMode: EChainMode = isMultiChainMode ? EChainMode.SINGLE_CHAIN : EChainMode.MULTI_CHAIN;

      await updateAccountWithChainMode(existingAccount.id, {
        chainId: String(VIEM_CHAIN.id),
        chainMode: newChainMode,
      });

      setChainMode(newChainMode);
    } catch (e) {
      console.error('Failed to switch chain:', e);
    } finally {
      setSwitchingMode(false);
    }
  };

  // Derived states for UI
  const description =
    chainMode === EChainMode.MULTI_CHAIN
      ? 'Switch to single chain mode to disable sending savings cross-chain'
      : 'Switch to multi chain mode to enable cross-chain savings';

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          {/* bg-[#ffc8b2] hover:bg-[#cc927f] */}
          <Button className='mt-5 w-full group rounded-xl hover:shadow-[0px_2px_1.1px_#00000040] h-12 font-bold text-base cursor-pointer bg-[#ff7a45] hover:bg-[#ff6a35] disabled:bg-[#ffb399] text-white'>
            {/* Icon */}
            <Cog
              className='group-hover:rotate-45 transition-transform duration-300 min-w-5 min-h-5'
              size={20}
              color='white'
            />
            Switch chain mode
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Switch chain mode</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            {isMultiChainMode === null ? (
              <div className='w-full flex items-center justify-center gap-2 p-4'>
                <Loader2 className={'animate-spin size-8'} color={'#ff7a45'} />
              </div>
            ) : (
              <div className='w-full flex items-center justify-between gap-2'>
                <div className={'flex items-center justify-start gap-2'}>
                  <p>{isMultiChainMode ? 'Multi chain' : 'Single chain'}</p>
                  {switchingMode ? <Loader2 className={'animate-spin size-5'} color={'#ff7a45'} /> : null}
                </div>

                <Switch
                  checked={isMultiChainMode}
                  onCheckedChange={() => {
                    handleSwitchMode();
                  }}
                />
              </div>
            )}
          </div>
          {/*<DialogFooter>*/}
          {/*<DialogClose asChild>*/}
          {/*  <Button variant='outline'>Cancel</Button>*/}
          {/*</DialogClose>*/}
          {/*<Button type='submit'>Save changes</Button>*/}
          {/*</DialogFooter>*/}
        </DialogContent>
      </form>
    </Dialog>
  );
}
