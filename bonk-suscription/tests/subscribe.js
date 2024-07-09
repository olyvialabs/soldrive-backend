const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  TransactionInstruction
} = require('@solana/web3.js');
const {
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID
} = require('@solana/spl-token');
const { BN } = require('bn.js');
const anchor = require('@project-serum/anchor');
const bs58 = require('bs58');

// IDL for the bonk_suscription program
const idl = {
  "version": "0.1.0",
  "name": "bonk_suscription",
  "instructions": [
    {
      "name": "transferLamports",
      "accounts": [
        {
          "name": "from",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferSplTokens",
      "accounts": [
        {
          "name": "from",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fromAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "toAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "metadata": {
    "address": "DQozU1hdPhGKPPL3dWonTmfe6w6uydqudrbspmkpfaVW"
  }
};

const PROGRAM_ID = new PublicKey(idl.metadata.address);

const user = Keypair.fromSecretKey(Uint8Array.from([
  79, 245, 161, 127, 74, 192, 138, 89, 36, 245, 172, 228, 48, 15, 105, 35, 242, 97, 8, 188, 165, 248, 95, 241, 115,
  196, 175, 89, 3, 185, 254, 216, 194, 191, 77, 41, 238, 137, 12, 47, 63, 105, 125, 55, 252, 78, 21, 205, 50, 50,
  133, 200, 92, 195, 192, 129, 191, 247, 115, 181, 184, 192, 176, 182
]));  // SUSCRIBER

const payerPrivateKeyString = 'mRnBem6E8vLjKuQtEsGu7tsfjCdrjoKxLNB5dhzt4gi2fDicZcZ2zbbFUNsY4MemGQtob1C5mjRw9v5J55RpGpp';
const payer = Keypair.fromSecretKey(bs58.decode(payerPrivateKeyString));

async function main() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(payer), { preflightCommitment: 'confirmed' });
  anchor.setProvider(provider);

  const program = new anchor.Program(idl, PROGRAM_ID, provider);

  const toPublicKey = new PublicKey("FYMwG2PmdjMaqq1PS92TmH5ntb6UgCENZALywNCKK4XT");
  const tokenMint = new PublicKey("9GBNjXFfsuoTrrQDRVaV9xCDQwzpWSGJuwMjLwb8RXAY");

  // Create associated token accounts for the new accounts
  const fromAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    user.publicKey
  );
  const toAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    toPublicKey
  );

  console.log(`From Public Key: ${user.publicKey.toBase58()}`);
  console.log(`To Public Key: ${toPublicKey.toBase58()}`);
  console.log(`From ATA: ${fromAta.address.toBase58()}`);
  console.log(`To ATA: ${toAta.address.toBase58()}`);

  // Transfer SPL tokens using the program
  const transferAmount = new BN(500);
  const txHash = await program.methods
    .transferSplTokens(transferAmount)
    .accounts({
      from: user.publicKey,
      fromAta: fromAta.address,
      toAta: toAta.address,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
    })
    .signers([user])
    .rpc();

  console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
  await connection.confirmTransaction(txHash, "finalized");

  const toTokenAccount = await connection.getTokenAccountBalance(toAta.address);
  console.log('The "to" token account balance:', toTokenAccount.value.uiAmount);
}

main().catch(err => {
  console.error(err);
});
