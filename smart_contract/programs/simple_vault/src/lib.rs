/*
 * SimpleVault - Solanaブロックチェーン上のSPLトークン保管用スマートコントラクト
 * 
 * このスマートコントラクトは、ユーザーがSPLトークンを安全に保管し、
 * 様々なセキュリティ機能と共に管理するための機能を提供します。
 * 
 * 主な機能:
 * 1. トークンの預け入れと引き出し
 *    - ユーザーは自分のトークンを金庫に預け入れ、必要に応じて引き出すことができます
 * 
 * 2. タイムロック
 *    - 指定した期間、金庫からの引き出しをロックする機能
 *    - 不正アクセスからの保護や、長期保管のセキュリティ向上に役立ちます
 * 
 * 3. 権限委任
 *    - 金庫の所有者が他のアドレスに操作権限を委任できる機能
 *    - チーム運用や緊急時のバックアップアクセスに有用です
 * 
 * 4. 多重署名（マルチシグ）
 *    - 複数の署名者が承認した場合のみ引き出しを許可する機能
 *    - 大きな資金移動に対する追加のセキュリティレイヤーを提供します
 * 
 * 5. 引き出し制限
 *    - 1回の取引で引き出せる最大金額を制限する機能
 *    - 不正アクセスがあった場合のリスク軽減に役立ちます
 * 
 * 6. 所有権譲渡
 *    - 金庫の所有権を別のアドレスに安全に譲渡する機能
 *    - 二段階の承認プロセスにより誤送信のリスクを軽減します
 * 
 * アーキテクチャ:
 * - このコントラクトはAnchorフレームワークを使用して実装されています
 * - 金庫アカウントはPDA（Program Derived Address）として作成され、所有者のアドレスから派生します
 * - 各金庫には関連するSPLトークンアカウントがあり、金庫PDAが権限を持ちます
 * - マルチシグ機能は保留中トランザクションのリストを内部で管理し、必要な署名が集まると実行されます
 */

use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::collections::HashSet;

declare_id!("GGCcGkcUoT1oCbPxkHrxpHDkLDrb9TYN8Hx2ffAEYLaQ");

/**
 * SimpleVaultプログラム
 * 
 * このモジュールはSolana上で動作するSPLトークン金庫の全ての機能を実装しています。
 * 各命令（instruction）は金庫の操作に関連する異なる機能を提供します。
 */
#[program]
pub mod simple_vault {
    use super::*;

    /**
     * 初期化命令（initialize）
     * 
     * 新しい金庫アカウントを作成し、初期設定を行います。
     * この命令は金庫を使用する前に一度だけ呼び出す必要があります。
     * 
     * @param ctx - 金庫の初期化に必要なアカウント情報を含むコンテキスト
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.token_account = ctx.accounts.vault_token_account.key();
        vault.bump = ctx.bumps.vault;
        vault.lock_until = 0; // デフォルトではロックなし
        vault.delegates = Vec::new(); // デフォルトでは委任なし
        vault.multisig_threshold = 1; // デフォルトでは単一署名
        vault.multisig_signers = Vec::new(); // デフォルトでは追加の署名者なし
        vault.pending_transactions = Vec::new(); // 保留中のトランザクションなし
        vault.max_withdrawal_limit = u64::MAX; // デフォルトでは制限なし
        vault.transfer_ownership_to = None; // 所有権譲渡先はなし
        Ok(())
    }

    /**
     * 預け入れ命令（deposit）
     * 
     * ユーザーのトークンアカウントから金庫のトークンアカウントにトークンを移動します。
     * 
     * @param ctx - 預け入れに必要なアカウント情報を含むコンテキスト
     * @param amount - 預け入れるトークンの量
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        // Transfer tokens from user to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        Ok(())
    }

    /**
     * 引き出し命令（withdraw）
     * 
     * 金庫のトークンアカウントからユーザーのトークンアカウントにトークンを移動します。
     * 多重署名が設定されている場合は、保留中のトランザクションとして記録され、
     * 必要な署名数が集まるまで実行されません。
     * 
     * 引き出しには以下の条件が確認されます：
     * - 呼び出し者が所有者または委任された権限を持っていること
     * - 金庫がタイムロックされていないこと
     * - 引き出し金額が制限を超えていないこと
     * 
     * @param ctx - 引き出しに必要なアカウント情報を含むコンテキスト
     * @param amount - 引き出すトークンの量
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        // Verify owner or delegate
        let vault = &ctx.accounts.vault;
        let is_owner = vault.owner == ctx.accounts.owner.key();
        let is_delegate = vault.delegates.contains(&ctx.accounts.owner.key());
        
        require!(is_owner || is_delegate, VaultError::Unauthorized);
        
        // Check if the vault is locked
        let current_timestamp = Clock::get()?.unix_timestamp as u64;
        require!(current_timestamp >= vault.lock_until, VaultError::VaultLocked);

        // Check withdrawal limit
        require!(amount <= vault.max_withdrawal_limit, VaultError::ExceedsWithdrawalLimit);

        // Check if multisig is required (threshold > 1)
        if vault.multisig_threshold > 1 {
            // This is a multisig vault, so we need to create a pending transaction
            let vault_mut = &mut ctx.accounts.vault;
            let tx_id = vault_mut.pending_transactions.len() as u64;
            
            // Create pending transaction
            let pending_tx = PendingTransaction {
                id: tx_id,
                transaction_type: TransactionType::Withdraw,
                amount,
                destination: ctx.accounts.user_token_account.key(),
                new_owner: None,
                signers: vec![ctx.accounts.owner.key()],
                executed: false,
                created_at: current_timestamp,
            };
            
            // Add to pending transactions
            vault_mut.pending_transactions.push(pending_tx);
            
            // Return early, the transaction is not executed yet
            return Ok(());
        }

        // Single-sig mode, execute immediately
        execute_withdraw(
            ctx.accounts.vault.to_account_info(),
            ctx.accounts.vault_token_account.to_account_info(),
            ctx.accounts.user_token_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            amount,
            ctx.accounts.vault.bump,
        )?;
        
        Ok(())
    }

    /**
     * 残高確認命令（queryBalance）
     * 
     * 金庫内のトークン残高を返します。
     * これは読み取り専用の操作で、ブロックチェーンの状態を変更しません。
     * 
     * @param ctx - 残高確認に必要なアカウント情報を含むコンテキスト
     * @return Result<u64> - 金庫内のトークン残高
     */
    pub fn query_balance(ctx: Context<QueryBalance>) -> Result<u64> {
        Ok(ctx.accounts.token_account.amount)
    }

    /**
     * タイムロック設定命令（setTimelock）
     * 
     * 金庫に一定期間のロックをかけます。ロック期間中は引き出しができなくなります。
     * 長期保管や不正引き出しの防止に有効です。
     * 
     * @param ctx - タイムロック設定に必要なアカウント情報を含むコンテキスト
     * @param lock_duration - ロック期間（秒）
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn set_timelock(ctx: Context<SetTimelock>, lock_duration: u64) -> Result<()> {
        // Verify owner
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
        
        // Set the lock until timestamp (current time + duration)
        let current_timestamp = Clock::get()?.unix_timestamp as u64;
        vault.lock_until = current_timestamp + lock_duration;
        
        Ok(())
    }

    /**
     * 委任者追加命令（addDelegate）
     * 
     * 金庫の操作権限を他のアドレスに委任します。
     * 委任された権限を持つアドレスは引き出し操作を行うことができます。
     * 
     * @param ctx - 委任者追加に必要なアカウント情報を含むコンテキスト
     * @param delegate - 委任するアドレス
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn add_delegate(ctx: Context<ManageDelegate>, delegate: Pubkey) -> Result<()> {
        // Verify owner
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
        
        // Check if already a delegate
        if !vault.delegates.contains(&delegate) {
            // Add the delegate
            vault.delegates.push(delegate);
        }
        
        Ok(())
    }

    /**
     * 委任者削除命令（removeDelegate）
     * 
     * 委任した操作権限を削除します。
     * 削除されたアドレスは引き出し操作を行うことができなくなります。
     * 
     * @param ctx - 委任者削除に必要なアカウント情報を含むコンテキスト
     * @param delegate - 削除する委任アドレス
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn remove_delegate(ctx: Context<ManageDelegate>, delegate: Pubkey) -> Result<()> {
        // Verify owner
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
        
        // Remove the delegate if it exists
        if let Some(index) = vault.delegates.iter().position(|&d| d == delegate) {
            vault.delegates.remove(index);
        }
        
        Ok(())
    }

    /**
     * 多重署名設定命令（setMultisig）
     * 
     * 金庫に多重署名（マルチシグ）の設定を行います。
     * 設定後は、指定した閾値以上の署名者が承認しなければ引き出し等の操作が実行されなくなります。
     * 
     * @param ctx - 多重署名設定に必要なアカウント情報を含むコンテキスト
     * @param threshold - 必要な署名者数の閾値
     * @param signers - 署名者のアドレスリスト
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn set_multisig(ctx: Context<SetMultisig>, threshold: u8, signers: Vec<Pubkey>) -> Result<()> {
        // Verify owner
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
        
        // Validate threshold
        require!(threshold > 0, VaultError::InvalidThreshold);
        require!(
            threshold <= signers.len() as u8 + 1, // +1 for owner
            VaultError::InvalidThreshold
        );
        
        // Set multisig configuration
        vault.multisig_threshold = threshold;
        vault.multisig_signers = signers;
        
        Ok(())
    }

    /**
     * トランザクション承認命令（approveTransaction）
     * 
     * 保留中のトランザクションを承認します。
     * 多重署名が設定されている場合、必要な署名数に達すると実際のトランザクションが実行されます。
     * 
     * @param ctx - トランザクション承認に必要なアカウント情報を含むコンテキスト
     * @param tx_id - 承認するトランザクションのID
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn approve_transaction(ctx: Context<ApproveTransaction>, tx_id: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let current_signer = ctx.accounts.signer.key();
        
        // Verify signer is owner or in multisig_signers
        let is_owner = vault.owner == current_signer;
        let is_multisig_signer = vault.multisig_signers.contains(&current_signer);
        
        require!(is_owner || is_multisig_signer, VaultError::Unauthorized);
        
        // Find the pending transaction
        if let Some(tx_index) = vault.pending_transactions.iter().position(|tx| tx.id == tx_id && !tx.executed) {
            // Add the signer if not already added
            if !vault.pending_transactions[tx_index].signers.contains(&current_signer) {
                vault.pending_transactions[tx_index].signers.push(current_signer);
            }
            
            // Check if we have enough signatures
            let has_enough_signatures = vault.pending_transactions[tx_index].signers.len() as u8 >= vault.multisig_threshold;
            let transaction_type = vault.pending_transactions[tx_index].transaction_type;
            
            if has_enough_signatures {
                match transaction_type {
                    TransactionType::Withdraw => {
                        // Get the required values before modifying the transaction
                        let amount = vault.pending_transactions[tx_index].amount;
                        let max_limit = vault.max_withdrawal_limit;
                        let bump = vault.bump;

                        // Check withdrawal limit
                        require!(amount <= max_limit, VaultError::ExceedsWithdrawalLimit);

                        // Drop mutable reference to vault before calling execute_withdraw
                        drop(vault);

                        execute_withdraw(
                            ctx.accounts.vault.to_account_info(),
                            ctx.accounts.vault_token_account.to_account_info(),
                            ctx.accounts.destination_token_account.to_account_info(),
                            ctx.accounts.token_program.to_account_info(),
                            amount,
                            bump,
                        )?;
                        
                        // Get vault reference again
                        let vault = &mut ctx.accounts.vault;
                        vault.pending_transactions[tx_index].executed = true;
                    },
                    TransactionType::TransferOwnership => {
                        // Get the new owner before modifying the transaction
                        if let Some(new_owner) = vault.pending_transactions[tx_index].new_owner {
                            // Update the owner
                            vault.owner = new_owner;
                            // Clear pending transfer
                            vault.transfer_ownership_to = None;
                            // Clear delegates as they were for the previous owner
                            vault.delegates.clear();
                            // Mark as executed
                            vault.pending_transactions[tx_index].executed = true;
                        }
                    },
                }
            }
        } else {
            return Err(VaultError::TransactionNotFound.into());
        }
        
        Ok(())
    }

    /**
     * 引き出し制限設定命令（setWithdrawalLimit）
     * 
     * 1回の取引で引き出せる最大金額を設定します。
     * セキュリティ対策として、不正な大量引き出しのリスクを軽減します。
     * 
     * @param ctx - 引き出し制限設定に必要なアカウント情報を含むコンテキスト
     * @param limit - 最大引き出し可能額
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn set_withdrawal_limit(ctx: Context<SetWithdrawalLimit>, limit: u64) -> Result<()> {
        // Verify owner
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
        
        // Set the withdrawal limit
        vault.max_withdrawal_limit = limit;
        
        Ok(())
    }

    /**
     * 所有権譲渡開始命令（initiateOwnershipTransfer）
     * 
     * 金庫の所有権を別のアドレスに譲渡する手続きを開始します。
     * 多重署名が設定されている場合は、保留中のトランザクションとして記録されます。
     * 
     * @param ctx - 所有権譲渡開始に必要なアカウント情報を含むコンテキスト
     * @param new_owner - 新しい所有者のアドレス
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn initiate_ownership_transfer(ctx: Context<InitiateOwnershipTransfer>, new_owner: Pubkey) -> Result<()> {
        // Verify owner
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
        
        // Set the new owner as pending
        vault.transfer_ownership_to = Some(new_owner);
        
        // If multisig is enabled, create a pending transaction
        if vault.multisig_threshold > 1 {
            let current_timestamp = Clock::get()?.unix_timestamp as u64;
            let tx_id = vault.pending_transactions.len() as u64;
            
            // Create pending transaction
            let pending_tx = PendingTransaction {
                id: tx_id,
                transaction_type: TransactionType::TransferOwnership,
                amount: 0, // Not relevant for ownership transfer
                destination: Pubkey::default(), // Not relevant for ownership transfer
                new_owner: Some(new_owner),
                signers: vec![ctx.accounts.owner.key()],
                executed: false,
                created_at: current_timestamp,
            };
            
            // Add to pending transactions
            vault.pending_transactions.push(pending_tx);
        }
        
        Ok(())
    }

    /**
     * 所有権譲渡承認命令（acceptOwnership）
     * 
     * 所有権譲渡を承認します。新しい所有者が実行する必要があります。
     * 多重署名が設定されていない場合は、この命令で所有権が即時に移転します。
     * 
     * @param ctx - 所有権譲渡承認に必要なアカウント情報を含むコンテキスト
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn accept_ownership(ctx: Context<AcceptOwnership>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        // Verify that the new owner is the one accepting
        match vault.transfer_ownership_to {
            Some(pending_owner) => {
                require!(pending_owner == ctx.accounts.new_owner.key(), VaultError::Unauthorized);
                
                // If multisig is not enabled, transfer ownership immediately
                if vault.multisig_threshold <= 1 {
                    // Update the owner
                    vault.owner = pending_owner;
                    // Clear pending transfer
                    vault.transfer_ownership_to = None;
                    // Clear delegates as they were for the previous owner
                    vault.delegates.clear();
                }
                
                Ok(())
            },
            None => Err(VaultError::NoOwnershipTransferPending.into()),
        }
    }

    /**
     * 所有権譲渡キャンセル命令（cancelOwnershipTransfer）
     * 
     * 進行中の所有権譲渡をキャンセルします。
     * 現在の所有者のみが実行できます。
     * 
     * @param ctx - 所有権譲渡キャンセルに必要なアカウント情報を含むコンテキスト
     * @return Result<()> - 操作の成功または失敗
     */
    pub fn cancel_ownership_transfer(ctx: Context<CancelOwnershipTransfer>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        // Verify owner
        require!(vault.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
        
        // Check if there's a pending transfer
        require!(vault.transfer_ownership_to.is_some(), VaultError::NoOwnershipTransferPending);
        
        // Clear pending transfer
        vault.transfer_ownership_to = None;
        
        // Remove any pending ownership transfer transactions
        vault.pending_transactions.retain(|tx| 
            tx.transaction_type != TransactionType::TransferOwnership || tx.executed
        );
        
        Ok(())
    }
}

/**
 * 引き出し実行ヘルパー関数
 * 
 * 金庫のトークンアカウントからユーザーのトークンアカウントにトークンを移動する
 * 実際の転送処理を行います。金庫のPDA（Program Derived Address）を使用して
 * 署名し、トークン転送のCPI（Cross-Program Invocation）を実行します。
 * 
 * @param vault - 金庫アカウント情報
 * @param vault_token_account - 金庫のトークンアカウント情報
 * @param destination_token_account - 宛先のトークンアカウント情報
 * @param token_program - SPLトークンプログラム情報
 * @param amount - 引き出すトークンの量
 * @param bump - 金庫PDAのバンプシード
 * @return Result<()> - 操作の成功または失敗
 */
fn execute_withdraw<'info>(
    vault: AccountInfo<'info>,
    vault_token_account: AccountInfo<'info>,
    destination_token_account: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    amount: u64,
    bump: u8,
) -> Result<()> {
    let vault_data = Vault::try_from_slice(&vault.try_borrow_data()?)?;
    
    // Create signer seeds for PDA
    let seeds = &[
        b"vault".as_ref(),
        vault_data.owner.as_ref(),
        &[bump],
    ];
    let signer = &[&seeds[..]];
    
    // Execute the transfer
    let cpi_accounts = Transfer {
        from: vault_token_account,
        to: destination_token_account,
        authority: vault,
    };
    
    let cpi_ctx = CpiContext::new_with_signer(token_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount)?;
    
    Ok(())
}

/**
 * 金庫初期化用のアカウント構造体
 * 
 * 金庫の初期化時に必要な全てのアカウント情報を定義します。
 * この構造体はinitialize命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 1 + 8 + 4 + (10 * 32) + 1 + 4 + (5 * 32) + 4 + (10 * (8 + 1 + 8 + 32 + 4 + (5 * 32) + 1 + 8 + 1 + 32)) + 8 + 33, // Added space for ownership transfer
        seeds = [b"vault", owner.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        init,
        payer = owner,
        token::mint = mint,
        token::authority = vault,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, token::Mint>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

/**
 * トークン預け入れ用のアカウント構造体
 * 
 * トークンを金庫に預け入れる際に必要な全てのアカウント情報を定義します。
 * この構造体はdeposit命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        constraint = vault_token_account.key() == vault.token_account,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_token_account.owner == owner.key(),
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

/**
 * トークン引き出し用のアカウント構造体
 * 
 * トークンを金庫から引き出す際に必要な全てのアカウント情報を定義します。
 * この構造体はwithdraw命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.owner.as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        constraint = vault_token_account.key() == vault.token_account,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_token_account.owner == owner.key(),
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

/**
 * 残高確認用のアカウント構造体
 * 
 * 金庫内のトークン残高を確認する際に必要なアカウント情報を定義します。
 * この構造体はquery_balance命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct QueryBalance<'info> {
    pub vault: Account<'info, Vault>,
    
    #[account(
        constraint = token_account.key() == vault.token_account,
    )]
    pub token_account: Account<'info, TokenAccount>,
}

/**
 * タイムロック設定用のアカウント構造体
 * 
 * 金庫にタイムロックを設定する際に必要なアカウント情報を定義します。
 * この構造体はset_timelock命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct SetTimelock<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

/**
 * 委任者管理用のアカウント構造体
 * 
 * 委任者の追加・削除に必要なアカウント情報を定義します。
 * この構造体はadd_delegate命令とremove_delegate命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct ManageDelegate<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

/**
 * 多重署名設定用のアカウント構造体
 * 
 * 多重署名（マルチシグ）設定に必要なアカウント情報を定義します。
 * この構造体はset_multisig命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct SetMultisig<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetWithdrawalLimit<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

/**
 * 所有権譲渡開始用のアカウント構造体
 * 
 * 所有権譲渡を開始する際に必要なアカウント情報を定義します。
 * この構造体はinitiate_ownership_transfer命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct InitiateOwnershipTransfer<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

/**
 * 所有権譲渡承認用のアカウント構造体
 * 
 * 所有権譲渡を承認する際に必要なアカウント情報を定義します。
 * この構造体はaccept_ownership命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct AcceptOwnership<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.owner.as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub new_owner: Signer<'info>,
}

/**
 * 所有権譲渡キャンセル用のアカウント構造体
 * 
 * 所有権譲渡をキャンセルする際に必要なアカウント情報を定義します。
 * この構造体はcancel_ownership_transfer命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct CancelOwnershipTransfer<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

/**
 * トランザクション承認用のアカウント構造体
 * 
 * 保留中のトランザクションを承認する際に必要なアカウント情報を定義します。
 * この構造体はapprove_transaction命令の実行時に使用されます。
 */
#[derive(Accounts)]
pub struct ApproveTransaction<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.owner.as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        constraint = vault_token_account.key() == vault.token_account,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub destination_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

/**
 * 金庫アカウントのデータ構造体
 * 
 * 金庫の全ての状態を保存するためのメインデータ構造体です。
 * 所有者情報、トークンアカウント、セキュリティ設定、トランザクション情報などを含みます。
 */
#[account]
pub struct Vault {
    pub owner: Pubkey,                         // 金庫の所有者
    pub token_account: Pubkey,                 // 金庫のトークンアカウント
    pub bump: u8,                              // PDAのバンプシード
    pub lock_until: u64,                       // タイムロック期限のUNIXタイムスタンプ
    pub delegates: Vec<Pubkey>,                // 委任されたアドレスのリスト
    pub multisig_threshold: u8,                // 必要な署名者数
    pub multisig_signers: Vec<Pubkey>,         // 追加の署名者リスト（所有者は含まない）
    pub pending_transactions: Vec<PendingTransaction>, // 保留中のトランザクション
    pub max_withdrawal_limit: u64,             // 最大引き出し可能金額
    pub transfer_ownership_to: Option<Pubkey>, // 所有権譲渡先
}

/**
 * 保留中トランザクションのデータ構造体
 * 
 * 多重署名が必要なトランザクションの情報を保存します。
 * トランザクションの種類、金額、送信先、署名者リストなどを含みます。
 */
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PendingTransaction {
    pub id: u64,                        // トランザクションID
    pub transaction_type: TransactionType, // トランザクションの種類
    pub amount: u64,                    // 引き出し量（引き出しの場合）
    pub destination: Pubkey,            // 送金先（引き出しの場合）
    pub new_owner: Option<Pubkey>,      // 所有権譲渡先（TransferOwnershipの場合のみ使用）
    pub signers: Vec<Pubkey>,           // 署名者リスト
    pub executed: bool,                 // 実行済みフラグ
    pub created_at: u64,                // 作成時刻
}

/**
 * トランザクション種類の列挙型
 * 
 * 保留中トランザクションの種類を定義します。
 */
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Copy)]
pub enum TransactionType {
    Withdraw,           // トークン引き出し
    TransferOwnership,  // 所有権譲渡
}

/**
 * エラーコードの列挙型
 * 
 * プログラム内で発生する可能性のあるエラーを定義します。
 */
#[error_code]
pub enum VaultError {
    #[msg("Only the vault owner can perform this action")]
    Unauthorized,                   // 権限エラー
    #[msg("Vault is locked until the specified time")]
    VaultLocked,                    // タイムロックエラー
    #[msg("Invalid multisig threshold")]
    InvalidThreshold,               // 無効な閾値エラー
    #[msg("Transaction not found")]
    TransactionNotFound,            // トランザクション未検出エラー
    #[msg("Withdrawal amount exceeds the limit")]
    ExceedsWithdrawalLimit,         // 引き出し制限超過エラー
    #[msg("No ownership transfer is pending")]
    NoOwnershipTransferPending,     // 所有権譲渡未保留エラー
}
