const anchor = require("@coral-xyz/anchor");
const { SystemProgram, PublicKey, Keypair } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, MINT_SIZE, createMint, createAccount, mintTo } = require("@solana/spl-token");

describe("simple_vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SimpleVault;
  const ownerKeypair = anchor.web3.Keypair.generate();
  const mintKeypair = anchor.web3.Keypair.generate();
  let userTokenAccount;
  let vaultTokenAccount;
  let vaultPDA;
  let vaultBump;

  const depositAmount = new anchor.BN(1000000);
  const withdrawAmount = new anchor.BN(500000);

  before(async () => {
    // Airdrop SOL to owner
    await provider.connection.requestAirdrop(ownerKeypair.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);

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

    // Derive vault token account
    vaultTokenAccount = await PublicKey.findProgramAddress(
      [Buffer.from("token-account"), vaultPDA.toBuffer()],
      program.programId
    );
  });

  it("Initializes the vault", async () => {
    await program.methods
      .initialize()
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount,
        mint: mintKeypair.publicKey,
        owner: ownerKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([ownerKeypair])
      .rpc();

    // Verify vault data
    const vaultAccount = await program.account.vault.fetch(vaultPDA);
    assert.equal(vaultAccount.owner.toString(), ownerKeypair.publicKey.toString());
    assert.equal(vaultAccount.tokenAccount.toString(), vaultTokenAccount.toString());
    assert.equal(vaultAccount.bump, vaultBump);
  });

  it("Deposits tokens to the vault", async () => {
    const balanceBefore = await provider.connection.getTokenAccountBalance(userTokenAccount);
    
    await program.methods
      .deposit(depositAmount)
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount,
        userTokenAccount: userTokenAccount,
        owner: ownerKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([ownerKeypair])
      .rpc();

    // Verify token balances
    const userBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultTokenAccount);
    
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
        tokenAccount: vaultTokenAccount,
      })
      .view();

    assert.equal(balance.toNumber(), depositAmount.toNumber());
  });

  it("Withdraws tokens from the vault", async () => {
    const userBalanceBefore = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalanceBefore = await provider.connection.getTokenAccountBalance(vaultTokenAccount);
    
    await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount: vaultTokenAccount,
        userTokenAccount: userTokenAccount,
        owner: ownerKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([ownerKeypair])
      .rpc();

    // Verify token balances
    const userBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultTokenAccount);
    
    assert.equal(
      Number(userBalance.value.amount) - Number(userBalanceBefore.value.amount),
      withdrawAmount.toNumber()
    );
    assert.equal(
      Number(vaultBalanceBefore.value.amount) - Number(vaultBalance.value.amount),
      withdrawAmount.toNumber()
    );
  });
});
