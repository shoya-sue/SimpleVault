@echo off
echo 不要なディレクトリを削除します...

REM app ディレクトリが空なら削除
if exist "smart_contract\app" (
  echo 空の app ディレクトリを削除します
  rmdir /s /q "smart_contract\app"
)

REM simple_vault ディレクトリを削除 (コンテンツは親ディレクトリに移動済み)
if exist "smart_contract\simple_vault" (
  echo 不要な simple_vault ディレクトリを削除します
  rmdir /s /q "smart_contract\simple_vault"
)

REM node_modules はビルド時に再生成されるので削除
if exist "smart_contract\node_modules" (
  echo node_modules ディレクトリを削除します
  rmdir /s /q "smart_contract\node_modules"
)

REM target ディレクトリもビルド成果物なので削除
if exist "smart_contract\target" (
  echo target ディレクトリを削除します
  rmdir /s /q "smart_contract\target"
)

echo クリーンアップが完了しました。 