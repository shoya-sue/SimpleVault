#!/bin/bash

# 不要なディレクトリの削除
echo "不要なディレクトリを削除します..."

# app ディレクトリが空なら削除
if [ -d "smart_contract/app" ] && [ -z "$(ls -A smart_contract/app)" ]; then
  echo "空の app ディレクトリを削除します"
  rm -rf smart_contract/app
fi

# simple_vault ディレクトリを削除 (コンテンツは親ディレクトリに移動済み)
if [ -d "smart_contract/simple_vault" ]; then
  echo "不要な simple_vault ディレクトリを削除します"
  rm -rf smart_contract/simple_vault
fi

# node_modules はビルド時に再生成されるので削除
if [ -d "smart_contract/node_modules" ]; then
  echo "node_modules ディレクトリを削除します"
  rm -rf smart_contract/node_modules
fi

# target ディレクトリもビルド成果物なので削除
if [ -d "smart_contract/target" ]; then
  echo "target ディレクトリを削除します"
  rm -rf smart_contract/target
fi

echo "クリーンアップが完了しました。" 