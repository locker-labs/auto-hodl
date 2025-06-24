'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const ConnectButton = () => {
  const { isConnected, isConnecting } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const connector = connectors.find((c) => c.id === 'metaMaskSDK' || c.type === 'metaMask');

  if (!connector) {
    return (
      <div>
        <Link
          // metamask chrome extension
          href='https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en'
          target='_blank'
        >
          Install MetaMask
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        className='w-full h-12 bg-[#ff7a45] hover:bg-[#ff6a35] disabled:bg-[#ffb399] text-white rounded-xl font-bold text-base'
        type='button'
        onClick={isConnected ? () => disconnect() : () => connect({ connector })}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <div className={'flex items-center justify-center gap-2'}>
            <Loader2 className={'animate-spin size-5'} color={'white'} />
            <span>Connecting</span>
          </div>
        ) : isConnected ? (
          'Disconnect'
        ) : (
          'Connect'
        )}
      </button>
    </div>
  );
};
