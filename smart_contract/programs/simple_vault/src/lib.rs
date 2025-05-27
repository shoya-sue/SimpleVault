use anchor_lang::prelude::*;

// SimpleVaultプログラムの宣言
#[program]
pub mod simple_vault {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        // TODO: SPLトークンの預け入れロジック
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        // TODO: SPLトークンの引き出しロジック
        Ok(())
    }

    pub fn query_balance(ctx: Context<QueryBalance>) -> Result<u64> {
        // TODO: 残高確認ロジック
        Ok(0)
    }
}

// 各Contextの定義（雛形）
#[derive(Accounts)]
pub struct Deposit<'info> {
    // TODO: 必要なアカウント情報
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    // TODO: 必要なアカウント情報
}

#[derive(Accounts)]
pub struct QueryBalance<'info> {
    // TODO: 必要なアカウント情報
}
