import React, { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// デフォルトスタイルをインポート
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletAdapterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ネットワークを選択（devnet, testnet, mainnet-beta）
  const network = WalletAdapterNetwork.Devnet;

  // エンドポイントを取得
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // ウォレットを設定
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 