const bs58 = require('bs58');
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
} = require('@solana/web3.js');
const {
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');

async function mintMoreTokens(mintAuthorityPrivateKeyString, mintPublicKey, recipientPublicKey, amount) {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
  // Decode the base58 string to Uint8Array and create the mint authority keypair
  const mintAuthoritySecretKey = bs58.decode(mintAuthorityPrivateKeyString);
  const mintAuthorityKeypair = Keypair.fromSecretKey(mintAuthoritySecretKey);
  
  // Get or create the recipient's associated token account
  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    mintAuthorityKeypair,
    new PublicKey(mintPublicKey),
    new PublicKey(recipientPublicKey),
    true, // Create the account if it does not exist
    mintAuthorityKeypair,
    mintAuthorityKeypair
  );

  // Mint the tokens directly to the recipient's token account
  const signature = await mintTo(
    connection,
    mintAuthorityKeypair, // Payer of the transaction; also the mint authority in this case
    new PublicKey(mintPublicKey), // Mint account public key
    recipientTokenAccount.address, // Recipient token account address
    mintAuthorityKeypair.publicKey, // Mint authority
    amount, // Amount to mint
    [], // Signers in addition to the payer
  );

  console.log(`Successfully minted ${amount} tokens to ${recipientTokenAccount.address.toString()}`);
  console.log(`Transaction signature: ${signature}`);
}

// Example usage
const mintAuthorityPrivateKeyString = 'mRnBem6E8vLjKuQtEsGu7tsfjCdrjoKxLNB5dhzt4gi2fDicZcZ2zbbFUNsY4MemGQtob1C5mjRw9v5J55RpGpp';
const mintPublicKey = 'FGrZu7VXoTPW1Tqj2ykpFvccYHCBfwqUMtYPNDb4uiCw'; // Replace with your actual mint account public key
const recipientPublicKey = '9cszqoEoZfK3SC9teDf7brCzja3FPjNgUZkwoNWfAPUu'; // Assuming this is the wallet address of the recipient
const amount = 1; // Amount to mint

mintMoreTokens(mintAuthorityPrivateKeyString, mintPublicKey, recipientPublicKey, amount)
  .then(() => console.log('Minting complete.'))
  .catch((err) => console.error('Error minting tokens:', err));
