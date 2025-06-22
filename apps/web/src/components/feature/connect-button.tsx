'use client';

import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const ConnectButton = () => {
  const { address } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const connector = connectors.find((c) => c.id === 'metaMaskSDK' || c.type === 'metaMask');

  if (!connector) {
    return (
      <div>
        <Link
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
      {address ? (
        <button type='button' onClick={() => disconnect()}>
          Disconnect
        </button>
      ) : (
        <button type='button' key={connector.uid} onClick={() => connect({ connector })}>
          Connect
        </button>
      )}
    </div>
  );
};
