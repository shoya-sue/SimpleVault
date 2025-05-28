use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::collections::HashSet;

declare_id!("GGCcGkcUoT1oCbPxkHrxpHDkLDrb9TYN8Hx2ffAEYLaQ");

#[program]
pub mod simple_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.token_account = ctx.accounts.vault_token_account.key();
        vault.bump = *ctx.bumps.get("vault").unwrap();
        vault.lock_until = 0; // デフォルトではロックなし
        vault.delegates = Vec::new(); // デフォルトでは委任なし
        vault.multisig_threshold = 1; // デフォルトでは単一署名
        vault.multisig_signers = Vec::new(); // デフォルトでは追加の署名者なし
        vault.pending_transactions = Vec::new(); // 保留中のトランザクションなし
        Ok(())
    }

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

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        // Verify owner or delegate
        let vault = &ctx.accounts.vault;
        let is_owner = vault.owner == ctx.accounts.owner.key();
        let is_delegate = vault.delegates.contains(&ctx.accounts.owner.key());
        
        require!(is_owner || is_delegate, VaultError::Unauthorized);
        
        // Check if the vault is locked
        let current_timestamp = Clock::get()?.unix_timestamp as u64;
        require!(current_timestamp >= vault.lock_until, VaultError::VaultLocked);

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
            vault.bump,
        )?;
        
        Ok(())
    }

    pub fn query_balance(ctx: Context<QueryBalance>) -> Result<u64> {
        Ok(ctx.accounts.token_account.amount)
    }

    pub fn set_timelock(ctx: Context<SetTimelock>, lock_duration: u64) -> Result<()> {
        // Verify owner
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
        
        // Set the lock until timestamp (current time + duration)
        let current_timestamp = Clock::get()?.unix_timestamp as u64;
        vault.lock_until = current_timestamp + lock_duration;
        
        Ok(())
    }

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

    pub fn approve_transaction(ctx: Context<ApproveTransaction>, tx_id: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let current_signer = ctx.accounts.signer.key();
        
        // Verify signer is owner or in multisig_signers
        let is_owner = vault.owner == current_signer;
        let is_multisig_signer = vault.multisig_signers.contains(&current_signer);
        
        require!(is_owner || is_multisig_signer, VaultError::Unauthorized);
        
        // Find the pending transaction
        if let Some(tx_index) = vault.pending_transactions.iter().position(|tx| tx.id == tx_id && !tx.executed) {
            let tx = &mut vault.pending_transactions[tx_index];
            
            // Check if signer has already signed
            if !tx.signers.contains(&current_signer) {
                tx.signers.push(current_signer);
            }
            
            // Check if we have enough signatures
            if tx.signers.len() as u8 >= vault.multisig_threshold {
                // Execute the transaction based on its type
                match tx.transaction_type {
                    TransactionType::Withdraw => {
                        execute_withdraw(
                            ctx.accounts.vault.to_account_info(),
                            ctx.accounts.vault_token_account.to_account_info(),
                            ctx.accounts.destination_token_account.to_account_info(),
                            ctx.accounts.token_program.to_account_info(),
                            tx.amount,
                            vault.bump,
                        )?;
                    },
                }
                
                // Mark as executed
                tx.executed = true;
            }
        } else {
            return Err(VaultError::TransactionNotFound.into());
        }
        
        Ok(())
    }
}

// Helper function to execute withdraw
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

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 1 + 8 + 4 + (10 * 32) + 1 + 4 + (5 * 32) + 4 + (10 * (8 + 1 + 8 + 32 + 4 + (5 * 32) + 1 + 8)), // Added space for multisig and pending transactions
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

#[derive(Accounts)]
pub struct QueryBalance<'info> {
    pub vault: Account<'info, Vault>,
    
    #[account(
        constraint = token_account.key() == vault.token_account,
    )]
    pub token_account: Account<'info, TokenAccount>,
}

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

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub token_account: Pubkey,
    pub bump: u8,
    pub lock_until: u64, // タイムロック期限のUNIXタイムスタンプ
    pub delegates: Vec<Pubkey>, // 委任されたアドレスのリスト
    pub multisig_threshold: u8, // 必要な署名者数
    pub multisig_signers: Vec<Pubkey>, // 追加の署名者リスト（所有者は含まない）
    pub pending_transactions: Vec<PendingTransaction>, // 保留中のトランザクション
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PendingTransaction {
    pub id: u64,
    pub transaction_type: TransactionType,
    pub amount: u64,
    pub destination: Pubkey,
    pub signers: Vec<Pubkey>,
    pub executed: bool,
    pub created_at: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TransactionType {
    Withdraw,
}

#[error_code]
pub enum VaultError {
    #[msg("Only the vault owner can perform this action")]
    Unauthorized,
    #[msg("Vault is locked until the specified time")]
    VaultLocked,
    #[msg("Invalid multisig threshold")]
    InvalidThreshold,
    #[msg("Transaction not found")]
    TransactionNotFound,
}
