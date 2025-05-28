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
  let userTokenAccount;
  let delegateTokenAccount; // 委任先のトークンアカウント
  let vaultTokenAccount;
  let vaultPDA;
  let vaultBump;

  const depositAmount = new anchor.BN(1000000);
  const withdrawAmount = new anchor.BN(500000);
  const lockDuration = new anchor.BN(10); // 10秒間のロック

  before(async () => {
    // Airdrop SOL to owner and delegate
    await provider.connection.requestAirdrop(ownerKeypair.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(delegateKeypair.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);

    // Create new mint
    const mint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9,
      mintKeypair
    );

    // Create user token account
    userTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      ownerKeypair.publicKey
    );

    // Create delegate token account
    delegateTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      delegateKeypair.publicKey
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
});
