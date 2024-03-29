const web3 = require('@solana/web3.js');
const { PublicKey, Keypair } = web3;
const splToken = require('@solana/spl-token');

(async () => {
  const connection = new web3.Connection("http://localhost:8899", 'confirmed');
  
  // Generate a new wallet for the minting authority (User A) and airdrop some SOL to cover transactions
  const mintAuthority = Keypair.generate();
  await connection.requestAirdrop(mintAuthority.publicKey, web3.LAMPORTS_PER_SOL); // Airdrop 1 SOL
  await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait for the airdrop to complete

  // Create a new mint
  let mint = await splToken.createMint(
    connection, 
    mintAuthority, 
    mintAuthority.publicKey, 
    null, 
    0 // Token decimals
  );

  // Create a token account for the mintAuthority
  let tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    connection, 
    mintAuthority, 
    mint, 
    mintAuthority.publicKey
  );

  // Minting 1 new token to the mintAuthority's token account
  await splToken.mintTo(
    connection, 
    mintAuthority, 
    mint, 
    tokenAccount.address, 
    mintAuthority, 
    1 // Amount to mint
  );

  console.log(`Minted 1 token to ${tokenAccount.address.toString()}`);

  // Create a recipient's associated token account
  const recipient = Keypair.generate();
  let recipientTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    connection, 
    mintAuthority, 
    mint, 
    recipient.publicKey
  );

  // Transfer the token to the recipient
  await splToken.transfer(
    connection, 
    mintAuthority, 
    tokenAccount.address, 
    recipientTokenAccount.address, 
    mintAuthority.publicKey, 
    1, // Amount
    []
  );

  console.log(`Transferred 1 token to ${recipientTokenAccount.address.toString()}`);
})();
