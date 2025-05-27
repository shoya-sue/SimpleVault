@echo off
echo SimpleVault GUI Commit Script
echo ============================

REM 型定義ファイルの追加
git add gui/src/types/global.d.ts gui/src/react-app-env.d.ts
git commit -m "chore: TypeScript型定義ファイルの追加"

REM IDLファイルの追加
git add gui/src/utils/idl.ts 
git commit -m "feat: アプリケーションで使用するIDL定義の追加"

REM Vaultフックの更新
git add gui/src/hooks/useVault.ts
git commit -m "fix: useVaultフックをIDLを使用するよう修正"

REM npmrc設定の追加
git add gui/.npmrc
git commit -m "chore: npm設定ファイルの追加"

REM faviconの追加
git add gui/public/favicon.ico gui/public/favicon.ico.meta
git commit -m "chore: faviconファイルの追加"

REM README更新
git add gui/README.md
git commit -m "docs: GUI READMEを更新"

echo ============================
echo Commit completed!
echo Run this file to commit changes to the git repository.
pause 