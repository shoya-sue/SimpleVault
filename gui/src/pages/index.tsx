import type { NextPage } from 'next';
import Head from 'next/head';
import { WalletConnect } from '../components/WalletConnect';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { DepositForm } from '../components/DepositForm';
import { WithdrawForm } from '../components/WithdrawForm';
import TokenMinter from '../components/TokenMinter';
import TransactionHistory from '../components/TransactionHistory';
import DarkModeToggle from '../components/DarkModeToggle';
import LoadingIndicator from '../components/LoadingIndicator';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';

const Home: NextPage = () => {
  const { connected } = useWallet();
  const [isLoading, setIsLoading] = useState(true);

  // 初期ロード時のローディング処理
  useEffect(() => {
    // アプリケーションの初期ロードを模擬
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingIndicator fullScreen text="SimpleVaultを読み込み中..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg transition-colors">
      <Head>
        <title>SimpleVault - Solana Token Vault</title>
        <meta name="description" content="A simple token vault application on Solana" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="py-4 px-6 bg-white dark:bg-dark-card shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">SimpleVault</h1>
          <DarkModeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text mb-2">SimpleVault</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">A secure way to store your SPL tokens</p>
        </div>

        <div className="flex justify-center mb-8">
          <WalletConnect />
        </div>

        {connected ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
              <div>
                <BalanceDisplay />
              </div>
              <div>
                <DepositForm />
              </div>
              <div>
                <WithdrawForm />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-10">
              <div>
                <TokenMinter />
              </div>
              <div>
                <TransactionHistory />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-8 bg-white dark:bg-dark-card rounded-lg shadow">
            <p>Please connect your wallet to use SimpleVault</p>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-dark-card shadow-inner">
        <p>SimpleVault - SPL Token Storage Solution</p>
      </footer>
    </div>
  );
};

export default Home; 