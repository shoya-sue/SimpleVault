@echo off
echo SimpleVault GUI Improvements Commit Script
echo ======================================

REM トークンアカウント管理フックの追加
git add gui/src/hooks/useTokenAccount.ts
git commit -m "feat: SPLトークンアカウント自動作成機能の追加"

REM 定数ファイルの更新
git add gui/src/utils/constants.ts
git commit -m "feat: テスト用MINTアドレスの定数を追加"

REM useVaultフックの改善
git add gui/src/hooks/useVault.ts
git commit -m "feat: useVaultフックをuseTokenAccountと統合して機能拡張"

REM 開発計画ドキュメントの追加
git add next-dev-steps.md project-issues.md
git commit -m "docs: 次の開発ステップと問題点・改善案を追加"

echo ======================================
echo Improvements committed!
echo Run this file to commit your improvements to the git repository.
pause 