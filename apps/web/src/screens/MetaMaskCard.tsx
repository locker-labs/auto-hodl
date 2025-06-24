'use client';

import { InfoIcon, WalletIcon } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { isAddress } from 'viem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAutoHodl } from '@/providers/autohodl-provider';

export interface MetaMaskCardProps {
  onNext: () => void;
  onBack: () => void;
}

export const MetaMaskCard = ({ onNext }: MetaMaskCardProps): React.ReactNode => {
  const { metaMaskCardAddress, setMetaMaskCardAddress } = useAutoHodl();

  const isValidAddress: boolean = isAddress(metaMaskCardAddress ?? '');

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const address: string = e.target.value;
    setMetaMaskCardAddress(address);
  };

  const handleContinue = () => {
    if (isValidAddress) {
      onNext();
    }
  };

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMetaMaskCardAddress(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  return (
    <Card className='w-full rounded-xl border-2 border-solid border-[#fce2d8] pt-0 overflow-hidden'>
      <div className={'relative w-full h-[250px] pt-[30px]  bg-[#f9bba2]'}>
        <Image src={'/metamask-card4x.webp'} alt={'metamask-card'} className={'mx-auto object-cover'} fill />

        {/*<div className={'absolute top-16 w-full h-full flex items-center justify-center text-white'}>*/}
        {/*  <div className='w-full p-4'>*/}
        {/*    <h2 className='w-fit mx-auto mt-[14px] font-bold  text-[26px] text-center tracking-[0] leading-[normal]'>*/}
        {/*      MetaMask Card*/}
        {/*    </h2>*/}
        {/*    <p className='w-fit mx-auto mt-2 font-medium text-base tracking-[0] leading-[normal]'>*/}
        {/*      Please enter your MetaMask wallet address*/}
        {/*    </p>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>

      <CardContent className='py-0 px-[30px]'>
        <Alert className='flex items-center gap-[30px] bg-[#fff1ed63] border-[#ffa2a2] mb-6'>
          <div className='flex flex-col w-[30px] h-[30px] items-center justify-center rounded-[15px] border-[2.5px] border-solid border-[#773410]'>
            <InfoIcon className='w-5 h-5 text-[#773410]' />
          </div>
          <AlertDescription className='font-medium text-[#773410] text-base tracking-[0] leading-[normal]'>
            Enter your MetaMask wallet address to set up automatic roundup savings.
          </AlertDescription>
        </Alert>

        <Card className='border border-solid border-[#e0e0e0] p-[33px] py-[18px] mb-6'>
          <CardContent className='p-0'>
            <h3 className='font-bold text-black text-[22px] tracking-[0] leading-[normal] mb-4'>Wallet Address:</h3>

            <div className='space-y-4'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <WalletIcon className='h-5 w-5 text-[#6b6b6b]' />
                </div>
                <input
                  type='text'
                  value={metaMaskCardAddress ?? ''}
                  onChange={handleAddressChange}
                  placeholder='0x1234567890abcdef1234567890abcdef12345678'
                  className={`w-full pl-10 pr-20 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7a45] focus:border-transparent ${
                    !isValidAddress && !!metaMaskCardAddress ? 'border-red-500 bg-red-50' : 'border-[#e0e0e0] bg-white'
                  }`}
                />
                <button
                  type='button'
                  onClick={handlePasteAddress}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-[#ff7a45] hover:text-[#ff6a35] font-medium text-sm'
                >
                  Paste
                </button>
              </div>

              {!isValidAddress && !!metaMaskCardAddress && (
                <p className='text-red-500 text-sm font-medium'>
                  Please enter a valid Ethereum wallet address (42 characters starting with 0x)
                </p>
              )}

              <div className='bg-[#f8f9fa] p-3 rounded-lg'>
                <p className='text-[#6b6b6b] text-sm font-normal leading-relaxed'>
                  <strong>Note:</strong> Make sure this is your correct MetaMask wallet address. This address will be
                  used to receive your rounded-up cryptocurrency savings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleContinue}
          disabled={!isValidAddress}
          className='w-full h-12 bg-[#ff7a45] hover:bg-[#ff6a35] disabled:bg-[#ffb399] disabled:cursor-not-allowed text-white rounded-xl font-bold text-base'
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};
