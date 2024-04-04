const web3 = require('@solana/web3.js');
const { Connection, PublicKey, Keypair, SystemProgram, Transaction, TransactionInstruction, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const { Token } = require('@solana/spl-token');
const borsh = require('borsh');

// Define a class for your metadata
class TokenMetadata {
  constructor({ file_id, name, weight, file_parent_id, cid, typ }) {
    this.file_id = file_id;
    this.name = name;
    this.weight = weight;
    this.file_parent_id = file_parent_id;
    this.cid = cid;
    this.typ = typ;
  }
}

// Define a schema for Borsh serialization
const TokenMetadataSchema = new Map([
  [TokenMetadata, {
    kind: 'struct',
    fields: [
      ['file_id', 'string'],
      ['name', 'string'],
      ['weight', 'u64'],
      ['file_parent_id', 'string'],
      ['cid', 'string'],
      ['typ', 'string']
    ]
  }]
]);

async function createTokenWithMetadata(connection, payer, metadata) {
  // Create a new token mint
  let mint = await Token.createMint(
    connection,
    payer,
    payer.publicKey,
    null, // No freeze authority
    0, // Decimals
    Token.TOKEN_PROGRAM_ID
  );

  // Create an associated token account for the payer
  let tokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    payer.publicKey
  );

  // Serialize the metadata
  let serializedMetadata = borsh.serialize(TokenMetadataSchema, new TokenMetadata(metadata));

  // Create a new account to store the metadata
  let metadataAccount = new web3.Account();
  let createAccountIx = web3.SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: metadataAccount.publicKey,
    lamports: await connection.getMinimumBalanceForRentExemption(serializedMetadata.length),
    space: serializedMetadata.length,
    programId: web3.SystemProgram.programId // This example stores metadata in a regular account; adjust as needed
  });

  // Create the transaction and add the instructions
  let transaction = new web3.Transaction().add(createAccountIx);

  // Sign and send the transaction
  await web3.sendAndConfirmTransaction(connection, transaction, [payer, metadataAccount]);

  console.log(`Token created with mint address: ${mint.publicKey.toString()}`);
  console.log(`Metadata stored in account: ${metadataAccount.publicKey.toString()}`);
}

(async () => {
  // Connection to the cluster
  const connection = new Connection('http://localhost:8899', 'confirmed');

  // Generate a new keypair for the payer
  let payer = web3.Keypair.generate();

  // Airdrop some SOL to the payer for transaction fees
  let signature = await connection.requestAirdrop(payer.publicKey, 2 * web3.LAMPORTS_PER_SOL);
  await connection.confirmTransaction(signature);

  // Define your metadata
  let metadata = {
    file_id: 'unique_file_id',
    name: 'Token Name',
    weight: 100,
    file_parent_id: 'parent_file_id',
    cid: 'content_identifier',
    typ: 'file_type'
  };

  // Create the token and attach metadata
  await createTokenWithMetadata(connection, payer, metadata);
})();
