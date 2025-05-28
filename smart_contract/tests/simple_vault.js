const anchor = require("@coral-xyz/anchor");
const { SystemProgram, PublicKey, Keypair } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, MINT_SIZE, createMint, createAccount, mintTo } = require("@solana/spl-token");
const assert = require("assert");

describe("simple_vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SimpleVault;
  const ownerKeypair = anchor.web3.Keypair.generate();
  const mintKeypair = anchor.web3.Keypair.generate();
  const delegateKeypair = anchor.web3.Keypair.generate(); // 委任先のキーペア
  const multisigSigner1 = anchor.web3.Keypair.generate(); // 多重署名者1
  const multisigSigner2 = anchor.web3.Keypair.generate(); // 多重署名者2
  const newOwnerKeypair = anchor.web3.Keypair.generate(); // 新しい所有者のキーペア
  let userTokenAccount;
  let delegateTokenAccount; // 委任先のトークンアカウント
  let multisigSigner1TokenAccount; // 多重署名者1のトークンアカウント
  let newOwnerTokenAccount; // 新しい所有者のトークンアカウント
  let vaultTokenAccount;
  let vaultPDA;
  let vaultBump;

  const depositAmount = new anchor.BN(1000000);
  const withdrawAmount = new anchor.BN(200000);
  const lockDuration = new anchor.BN(10); // 10秒間のロック
  const multisigWithdrawAmount = new anchor.BN(300000);
  const withdrawalLimit = new anchor.BN(250000); // 最大引き出し額の制限
  const exceedingAmount = new anchor.BN(300000); // 制限を超える額

  before(async () => {
    // Airdrop SOL to owner, delegate, multisig signers, and new owner
    await provider.connection.requestAirdrop(ownerKeypair.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(delegateKeypair.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(multisigSigner1.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(multisigSigner2.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(newOwnerKeypair.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);

    // Create new mint
    const mint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9,
      mintKeypair
    );

    // Create token accounts
    userTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      ownerKeypair.publicKey
    );

    delegateTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      delegateKeypair.publicKey
    );

    multisigSigner1TokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      multisigSigner1.publicKey
    );

    newOwnerTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      newOwnerKeypair.publicKey
    );

    // Mint tokens to user
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      mint,
      userTokenAccount,
      provider.wallet.publicKey,
      2000000
    );

    // Derive vault PDA
    [vaultPDA, vaultBump] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), ownerKeypair.publicKey.toBuffer()],
      program.programId
    );

    // Create a new keypair for vault token account
    // Note: In actual implementation, the token account is created during initialization
    // and assigned to the vault PDA as the authority
    vaultTokenAccount = anchor.web3.Keypair.generate();
  });

  it("Initializes the vault", async () => {
    await program.methods
      .initialize()
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount.publicKey,
        mint: mintKeypair.publicKey,
        owner: ownerKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([ownerKeypair, vaultTokenAccount])
      .rpc();

    // Verify vault data
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(vaultAccount.owner.toString(), ownerKeypair.publicKey.toString());
    assert.equal(vaultAccount.tokenAccount.toString(), vaultTokenAccount.publicKey.toString());
    assert.equal(vaultAccount.bump, vaultBump);
    assert.equal(vaultAccount.lockUntil.toNumber(), 0); // 初期状態ではロックなし
    assert.equal(vaultAccount.delegates.length, 0); // 初期状態では委任なし
    assert.equal(vaultAccount.multisigThreshold, 1); // 初期状態では単一署名
    assert.equal(vaultAccount.multisigSigners.length, 0); // 初期状態では追加の署名者なし
    assert.equal(vaultAccount.pendingTransactions.length, 0); // 初期状態では保留中のトランザクションなし
    assert.equal(vaultAccount.maxWithdrawalLimit.toString(), new anchor.BN(2).pow(new anchor.BN(64)).sub(new anchor.BN(1)).toString()); // 初期状態では制限なし
    assert.equal(vaultAccount.transferOwnershipTo, null); // 初期状態では所有権譲渡先なし
  });

  it("Deposits tokens to the vault", async () => {
    const balanceBefore = await provider.connection.getTokenAccountBalance(userTokenAccount);
    
    await program.methods
      .deposit(depositAmount)
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount.publicKey,
        userTokenAccount: userTokenAccount,
        owner: ownerKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([ownerKeypair])
      .rpc();

    // Verify token balances
    const userBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    assert.equal(
      Number(balanceBefore.value.amount) - Number(userBalance.value.amount),
      depositAmount.toNumber()
    );
    assert.equal(Number(vaultBalance.value.amount), depositAmount.toNumber());
  });

  it("Queries the vault balance", async () => {
    const balance = await program.methods
      .queryBalance()
      .accounts({
        vault: vaultPDA,
        tokenAccount: vaultTokenAccount.publicKey,
      })
      .view();

    assert.equal(balance.toNumber(), depositAmount.toNumber());
  });

  it("Sets a timelock on the vault", async () => {
    await program.methods
      .setTimelock(lockDuration)
      .accounts({
        vault: vaultPDA,
        owner: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();

    // Verify the lock was set
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert(vaultAccount.lockUntil.toNumber() > 0, "Timelock should be set");
  });

  it("Cannot withdraw when vault is locked", async () => {
    try {
      await program.methods
        .withdraw(withdrawAmount)
        .accounts({
          vault: vaultPDA,
          vaultTokenAccount: vaultTokenAccount.publicKey,
          userTokenAccount: userTokenAccount,
          owner: ownerKeypair.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([ownerKeypair])
        .rpc();
      
      assert.fail("Should have thrown an error due to timelock");
    } catch (error) {
      assert(error.toString().includes("VaultLocked"), "Expected VaultLocked error");
    }
  });

  it("Can withdraw after timelock expires", async () => {
    // Wait for timelock to expire
    console.log("Waiting for timelock to expire...");
    await new Promise(resolve => setTimeout(resolve, lockDuration.toNumber() * 1000 + 2000)); // Duration in seconds + buffer

    const userBalanceBefore = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalanceBefore = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount.publicKey,
        userTokenAccount: userTokenAccount,
        owner: ownerKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([ownerKeypair])
      .rpc();

    // Verify token balances
    const userBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    assert.equal(
      Number(userBalance.value.amount) - Number(userBalanceBefore.value.amount),
      withdrawAmount.toNumber()
    );
    assert.equal(
      Number(vaultBalanceBefore.value.amount) - Number(vaultBalance.value.amount),
      withdrawAmount.toNumber()
    );
  });

  it("Adds a delegate to the vault", async () => {
    await program.methods
      .addDelegate(delegateKeypair.publicKey)
      .accounts({
        vault: vaultPDA,
        owner: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();

    // Verify delegate was added
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(vaultAccount.delegates.length, 1, "Should have one delegate");
    assert.equal(
      vaultAccount.delegates[0].toString(),
      delegateKeypair.publicKey.toString(),
      "Delegate should match"
    );
  });

  it("Delegate can withdraw from the vault", async () => {
    const delegateBalanceBefore = await provider.connection.getTokenAccountBalance(delegateTokenAccount);
    const vaultBalanceBefore = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    // Delegate withdraws tokens
    await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount.publicKey,
        userTokenAccount: delegateTokenAccount,
        owner: delegateKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([delegateKeypair])
      .rpc();

    // Verify token balances
    const delegateBalance = await provider.connection.getTokenAccountBalance(delegateTokenAccount);
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    assert.equal(
      Number(delegateBalance.value.amount) - Number(delegateBalanceBefore.value.amount),
      withdrawAmount.toNumber()
    );
    assert.equal(
      Number(vaultBalanceBefore.value.amount) - Number(vaultBalance.value.amount),
      withdrawAmount.toNumber()
    );
  });

  it("Removes a delegate from the vault", async () => {
    await program.methods
      .removeDelegate(delegateKeypair.publicKey)
      .accounts({
        vault: vaultPDA,
        owner: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();

    // Verify delegate was removed
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(vaultAccount.delegates.length, 0, "Should have no delegates");
  });

  it("Former delegate cannot withdraw after removal", async () => {
    try {
      await program.methods
        .withdraw(withdrawAmount)
        .accounts({
          vault: vaultPDA,
          vaultTokenAccount: vaultTokenAccount.publicKey,
          userTokenAccount: delegateTokenAccount,
          owner: delegateKeypair.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([delegateKeypair])
        .rpc();
      
      assert.fail("Should have thrown an error due to unauthorized access");
    } catch (error) {
      assert(error.toString().includes("Unauthorized"), "Expected Unauthorized error");
    }
  });

  it("Sets up multisig with 2 signers requirement", async () => {
    // Configure vault as multisig with threshold 2
    // (requires owner + 1 more signature)
    await program.methods
      .setMultisig(2, [multisigSigner1.publicKey, multisigSigner2.publicKey])
      .accounts({
        vault: vaultPDA,
        owner: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();
    
    // Verify multisig setup
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(vaultAccount.multisigThreshold, 2, "Threshold should be 2");
    assert.equal(vaultAccount.multisigSigners.length, 2, "Should have 2 multisig signers");
    assert.equal(
      vaultAccount.multisigSigners[0].toString(),
      multisigSigner1.publicKey.toString(),
      "First signer should match"
    );
    assert.equal(
      vaultAccount.multisigSigners[1].toString(),
      multisigSigner2.publicKey.toString(),
      "Second signer should match"
    );
  });

  it("Creates a pending transaction when withdraw is initiated in multisig mode", async () => {
    // Try to withdraw - this should create a pending transaction
    await program.methods
      .withdraw(multisigWithdrawAmount)
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount.publicKey,
        userTokenAccount: userTokenAccount,
        owner: ownerKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([ownerKeypair])
      .rpc();
    
    // Verify pending transaction was created
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(vaultAccount.pendingTransactions.length, 1, "Should have one pending transaction");
    assert.equal(vaultAccount.pendingTransactions[0].executed, false, "Transaction should not be executed yet");
    assert.equal(vaultAccount.pendingTransactions[0].amount.toNumber(), multisigWithdrawAmount.toNumber(), "Amount should match");
    assert.equal(vaultAccount.pendingTransactions[0].signers.length, 1, "Should have owner's signature");
    assert.equal(
      vaultAccount.pendingTransactions[0].signers[0].toString(),
      ownerKeypair.publicKey.toString(),
      "First signature should be from owner"
    );
  });

  it("Completes the multisig transaction when enough signatures are collected", async () => {
    const txId = 0; // First transaction
    const userBalanceBefore = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalanceBefore = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    // Second signer approves the transaction
    await program.methods
      .approveTransaction(new anchor.BN(txId))
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount.publicKey,
        destinationTokenAccount: userTokenAccount,
        signer: multisigSigner1.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([multisigSigner1])
      .rpc();
    
    // Verify transaction executed
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(vaultAccount.pendingTransactions[0].executed, true, "Transaction should be executed");
    
    // Verify token balances
    const userBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    assert.equal(
      Number(userBalance.value.amount) - Number(userBalanceBefore.value.amount),
      multisigWithdrawAmount.toNumber(),
      "User balance should increase by withdraw amount"
    );
    assert.equal(
      Number(vaultBalanceBefore.value.amount) - Number(vaultBalance.value.amount),
      multisigWithdrawAmount.toNumber(),
      "Vault balance should decrease by withdraw amount"
    );
  });

  it("Sets a withdrawal limit", async () => {
    // Set a withdrawal limit
    await program.methods
      .setWithdrawalLimit(withdrawalLimit)
      .accounts({
        vault: vaultPDA,
        owner: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();
    
    // Verify withdrawal limit was set
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(vaultAccount.maxWithdrawalLimit.toNumber(), withdrawalLimit.toNumber(), "Withdrawal limit should be set");
  });

  it("Cannot withdraw more than the limit", async () => {
    try {
      await program.methods
        .withdraw(exceedingAmount)
        .accounts({
          vault: vaultPDA,
          vaultTokenAccount: vaultTokenAccount.publicKey,
          userTokenAccount: userTokenAccount,
          owner: ownerKeypair.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([ownerKeypair])
        .rpc();
      
      assert.fail("Should have thrown an error due to exceeding withdrawal limit");
    } catch (error) {
      assert(error.toString().includes("ExceedsWithdrawalLimit"), "Expected ExceedsWithdrawalLimit error");
    }
  });

  it("Can withdraw up to the limit", async () => {
    const userBalanceBefore = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalanceBefore = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    await program.methods
      .withdraw(withdrawalLimit)
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount.publicKey,
        userTokenAccount: userTokenAccount,
        owner: ownerKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([ownerKeypair])
      .rpc();

    // Verify token balances
    const userBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    assert.equal(
      Number(userBalance.value.amount) - Number(userBalanceBefore.value.amount),
      withdrawalLimit.toNumber(),
      "User balance should increase by withdraw amount"
    );
    assert.equal(
      Number(vaultBalanceBefore.value.amount) - Number(vaultBalance.value.amount),
      withdrawalLimit.toNumber(),
      "Vault balance should decrease by withdraw amount"
    );
  });

  it("Initiates ownership transfer", async () => {
    // Reset multisig to single signature for simplicity
    await program.methods
      .setMultisig(1, [])
      .accounts({
        vault: vaultPDA,
        owner: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();

    // Initiate ownership transfer
    await program.methods
      .initiateOwnershipTransfer(newOwnerKeypair.publicKey)
      .accounts({
        vault: vaultPDA,
        owner: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();
    
    // Verify pending ownership transfer
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert(vaultAccount.transferOwnershipTo !== null, "Should have pending ownership transfer");
    assert.equal(
      vaultAccount.transferOwnershipTo.toString(),
      newOwnerKeypair.publicKey.toString(),
      "Pending owner should match"
    );
  });

  it("Cannot accept ownership if not the intended new owner", async () => {
    try {
      await program.methods
        .acceptOwnership()
        .accounts({
          vault: vaultPDA,
          newOwner: delegateKeypair.publicKey,
        })
        .signers([delegateKeypair])
        .rpc();
      
      assert.fail("Should have thrown an error due to unauthorized access");
    } catch (error) {
      assert(error.toString().includes("Unauthorized"), "Expected Unauthorized error");
    }
  });

  it("New owner can accept ownership", async () => {
    await program.methods
      .acceptOwnership()
      .accounts({
        vault: vaultPDA,
        newOwner: newOwnerKeypair.publicKey,
      })
      .signers([newOwnerKeypair])
      .rpc();
    
    // Verify ownership transfer completed
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(
      vaultAccount.owner.toString(),
      newOwnerKeypair.publicKey.toString(),
      "Owner should be updated to new owner"
    );
    assert.equal(vaultAccount.transferOwnershipTo, null, "Pending transfer should be cleared");
    assert.equal(vaultAccount.delegates.length, 0, "Delegates should be cleared");
  });

  it("New owner can withdraw from vault", async () => {
    const newOwnerBalanceBefore = await provider.connection.getTokenAccountBalance(newOwnerTokenAccount);
    const vaultBalanceBefore = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    // New owner withdraws tokens
    await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount.publicKey,
        userTokenAccount: newOwnerTokenAccount,
        owner: newOwnerKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([newOwnerKeypair])
      .rpc();

    // Verify token balances
    const newOwnerBalance = await provider.connection.getTokenAccountBalance(newOwnerTokenAccount);
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultTokenAccount.publicKey);
    
    assert.equal(
      Number(newOwnerBalance.value.amount) - Number(newOwnerBalanceBefore.value.amount),
      withdrawAmount.toNumber(),
      "New owner's balance should increase by withdraw amount"
    );
    assert.equal(
      Number(vaultBalanceBefore.value.amount) - Number(vaultBalance.value.amount),
      withdrawAmount.toNumber(),
      "Vault balance should decrease by withdraw amount"
    );
  });

  it("Former owner cannot withdraw from vault anymore", async () => {
    try {
      await program.methods
        .withdraw(withdrawAmount)
        .accounts({
          vault: vaultPDA,
          vaultTokenAccount: vaultTokenAccount.publicKey,
          userTokenAccount: userTokenAccount,
          owner: ownerKeypair.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([ownerKeypair])
        .rpc();
      
      assert.fail("Should have thrown an error due to unauthorized access");
    } catch (error) {
      assert(error.toString().includes("Unauthorized"), "Expected Unauthorized error");
    }
  });

  it("New owner can initiate ownership transfer back to original owner", async () => {
    // Initiate ownership transfer back
    await program.methods
      .initiateOwnershipTransfer(ownerKeypair.publicKey)
      .accounts({
        vault: vaultPDA,
        owner: newOwnerKeypair.publicKey,
      })
      .signers([newOwnerKeypair])
      .rpc();
    
    // Verify pending ownership transfer
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert(vaultAccount.transferOwnershipTo !== null, "Should have pending ownership transfer");
    assert.equal(
      vaultAccount.transferOwnershipTo.toString(),
      ownerKeypair.publicKey.toString(),
      "Pending owner should match original owner"
    );
  });

  it("New owner can cancel ownership transfer", async () => {
    await program.methods
      .cancelOwnershipTransfer()
      .accounts({
        vault: vaultPDA,
        owner: newOwnerKeypair.publicKey,
      })
      .signers([newOwnerKeypair])
      .rpc();
    
    // Verify pending ownership transfer was cancelled
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(vaultAccount.transferOwnershipTo, null, "Pending transfer should be cleared");
  });
});
