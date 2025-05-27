import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

// ウォレット接続ボタンは非同期にインポート（SSRの問題を回避）
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * アプリケーションの共通レイアウト
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'SimpleVault - Solanaトークン管理',
}) => {
  const { connected } = useWallet();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Solana上で動作するSPLトークン管理アプリケーション" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white dark:bg-dark-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-solana-purple">
                SimpleVault
              </Link>
              
              <nav className="ml-8 hidden md:flex space-x-4">
                <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-solana-purple dark:hover:text-solana-purple transition-colors">
                  ホーム
                </Link>
                <Link href="/deposit" className="text-gray-700 dark:text-gray-300 hover:text-solana-purple dark:hover:text-solana-purple transition-colors">
                  預け入れ
                </Link>
                <Link href="/withdraw" className="text-gray-700 dark:text-gray-300 hover:text-solana-purple dark:hover:text-solana-purple transition-colors">
                  引き出し
                </Link>
                <Link href="/mint" className="text-gray-700 dark:text-gray-300 hover:text-solana-purple dark:hover:text-solana-purple transition-colors">
                  トークンミント
                </Link>
                <Link href="/history" className="text-gray-700 dark:text-gray-300 hover:text-solana-purple dark:hover:text-solana-purple transition-colors">
                  履歴
                </Link>
                <Link href="/optimization" className="text-gray-700 dark:text-gray-300 hover:text-solana-purple dark:hover:text-solana-purple transition-colors">
                  最適化デモ
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center">
              <div className="mr-4">
                <WalletMultiButtonDynamic />
              </div>
              
              {/* ウォレット接続状態表示 */}
              <div className={`hidden md:flex items-center px-3 py-1 rounded-full text-sm ${
                connected 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {connected ? '接続済み' : '未接続'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-dark-card shadow-inner mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} SimpleVault. All rights reserved.
            </div>
            
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4">
                <li>
                  <a 
                    href="https://github.com/yourusername/SimpleVault" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-solana-purple dark:hover:text-solana-purple transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a 
                    href="https://solana.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-solana-purple dark:hover:text-solana-purple transition-colors"
                  >
                    Solana
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 