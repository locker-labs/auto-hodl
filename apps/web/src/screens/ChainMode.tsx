import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAutoHodl } from '@/providers/autohodl-provider';
import { EChainMode } from '@/enums/chainMode.enums';
import { useEffect } from 'react';
import { VIEM_CHAIN } from '@/config';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const chainName: string = VIEM_CHAIN.name;

export const ChainMode = ({ onNext, onBack }: Props): React.JSX.Element => {
  const { chainMode, setChainMode } = useAutoHodl();

  // ChainMode options data
  const modes = [
    {
      id: EChainMode.SINGLE_CHAIN,
      title: `Single Chain (${chainName})`,
      description: `Simulate MM Card on ${chainName}, savings on ${chainName}`,
      color: 'text-[#2d2d2d]',
      bgColor: 'hover:bg-[#ff7a45]/15 active:bg-[#ff7a45]/20',
      borderColor: '',
      disabled: false,
    },
    {
      id: EChainMode.MULTI_CHAIN,
      title: 'Multi Chain',
      description: `Simulate MM Card on ${chainName}, savings on chain with best yield`,
      color: 'text-[#2d2d2d]',
      bgColor: 'hover:bg-[#ff7a45]/15 active:bg-[#ff7a45]/20',
      borderColor: '',
      disabled: false,
    },
  ];

  const handleContinue = async () => {
    onNext();
  };

  // choose default option as single chain
  useEffect(() => {
    if (!chainMode) {
      setChainMode(EChainMode.SINGLE_CHAIN);
    }
  }, [chainMode, setChainMode]);

  return (
    <Card className='w-full px-[30px] rounded-xl border-2 border-solid border-[#fce2d8]'>
      <div className='w-full p-4'>
        <h2 className='w-fit mx-auto mt-[14px] font-bold text-[#773410] text-[26px] text-center tracking-[0] leading-[normal]'>
          Chain Mode
        </h2>
        <p className='w-fit mx-auto mt-2 font-medium text-[#5D5D5D] text-base tracking-[0] leading-[normal]'>
          Choose chain configuration
        </p>
      </div>

      <div className='flex flex-col gap-4'>
        {modes.map((mode) => (
          <button
            type={'button'}
            key={mode.id}
            onClick={() => !mode.disabled && setChainMode(mode.id)}
            className={`w-full py-[18px] px-5 rounded-xl
             border border-solid transition-colors duration-200
             ${
               mode.disabled
                 ? 'cursor-not-allowed bg-[#a0a0a0]/10 hover:bg-[#a0a0a0]/30 border-[#a0a0a0]'
                 : `cursor-pointer
                 ${mode.id === chainMode ? 'text-[#773410] bg-[#fef6f2]  border-[#ff7a45]' : 'text-[#5D5D5D] border-[#a0a0a0] hover:bg-[#a0a0a0]/30'}
                 ${mode.bgColor}`
             }
                relative`}
          >
            <div className='flex justify-between'>
              <h4 className={`font-bold ${mode.id === chainMode ? 'text-[#773410]' : mode.color} text-base`}>
                {mode.title}
              </h4>
              {/*<span className={`font-bold ${mode.color} text-base`}>{mode.apy}</span>*/}
            </div>
            <div className='flex justify-between'>
              <span className='font-light text-[#6b6b6b] text-[12px]'>{mode.description}</span>
              {/*<span className='font-light text-black text-[12px]'>{mode.benefit}</span>*/}
            </div>
          </button>
        ))}
      </div>

      <CardContent className={'mt-6 px-0'}>
        <div className='flex flex-col space-y-4'>
          <Button
            onClick={handleContinue}
            disabled={!chainMode}
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
