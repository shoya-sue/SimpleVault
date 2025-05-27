import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FC } from 'react';

export const WalletConnect: FC = () => {
  const { publicKey } = useWallet();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="my-4">
        <WalletMultiButton />
      </div>
      {publicKey && (
        <div className="text-sm text-gray-600">
          Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </div>
      )}
    </div>
  );
}; 