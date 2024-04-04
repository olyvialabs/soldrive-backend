const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    Transaction,
    TransactionInstruction,
} = require('@solana/web3.js');
const {
    createMint,
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');
const { serialize } = require('borsh');
const { Buffer } = require('buffer');
const bs58 = require('bs58');

const PROGRAM_ID = new PublicKey('CYLp1vYEbkebAtUqcLXkMfkTuAvvzGcPrkv8U5Dd5GNb');

class TokenMetadata {
    constructor({ file_id, name, weight, file_parent_id, cid, typ }) {
        this.file_id = file_id;
        this.name = name;
        this.weight = BigInt(weight);
        this.file_parent_id = file_parent_id;
        this.cid = cid;
        this.typ = typ;
    }
}

const TokenMetadataSchema = new Map([
    [TokenMetadata, {
        kind: 'struct',
        fields: [
            ['file_id', 'string'],
            ['name', 'string'],
            ['weight', 'u64'],
            ['file_parent_id', 'string'],
            ['cid', 'string'],
            ['typ', 'string'],
        ],
    }],
]);

async function main() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payerPrivateKeyString = 'mRnBem6E8vLjKuQtEsGu7tsfjCdrjoKxLNB5dhzt4gi2fDicZcZ2zbbFUNsY4MemGQtob1C5mjRw9v5J55RpGpp';

    const payer = Keypair.fromSecretKey(bs58.decode(payerPrivateKeyString));
    // Ledger account is only used for data storage and should not need to sign transactions

    // Skipping the account creation part for the ledger account if it's already created and funded

    const mintAuthority = payer;
    const mintPublicKey = await createMint(connection, payer, mintAuthority.publicKey, null, 9);
    const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mintPublicKey, payer.publicKey);

    const metadata = new TokenMetadata({
        file_id: '1',
        name: 'Test Token',
        weight: 100,
        file_parent_id: '0',
        cid: 'test-cid',
        typ: 'test-type',
    });

    const metadataBuffer = Buffer.from(serialize(TokenMetadataSchema, metadata));

    const customInstruction = new TransactionInstruction({
        keys: [
            { pubkey: mintPublicKey, isSigner: false, isWritable: true }, // mint_account
            { pubkey: tokenAccount.address, isSigner: false, isWritable: true }, // token_account
            { pubkey: mintAuthority.publicKey, isSigner: true, isWritable: false }, // mint_authority
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
            // Assuming the ledger account is correctly set up to be writable
            // { pubkey: ledgerAccount.publicKey, isSigner: false, isWritable: true }, // ledger_account
        ],
        programId: PROGRAM_ID,
        data: metadataBuffer, // Your serialized metadata
    });
    

    let transaction = new Transaction().add(customInstruction);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = payer.publicKey;

    console.log('Signing and sending transaction...');
    // Since the ledger account is not signing, it's not included in the signers array
    await connection.sendTransaction(transaction, [payer], { skipPreflight: false, preflightCommitment: "confirmed" });
    console.log('Transaction confirmed');
}

main().then(() => console.log('Script finished successfully')).catch(console.error);
