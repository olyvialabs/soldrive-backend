const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    Transaction,
    TransactionInstruction,
} = require('@solana/web3.js');
const { serialize } = require('borsh');
const { Buffer } = require('buffer');
const bs58 = require('bs58');

// Program ID must match the deployed program
const PROGRAM_ID = new PublicKey('uxL7YQPPJgb2RFCASV9pHLdMKhiky3wanamybNd9ko8');

// Matching the Rust struct with JavaScript class
class TokenMetadata {
    constructor({ file_id, name, weight, file_parent_id, cid, typ, from, to }) {
        this.file_id = file_id;
        this.name = name;
        this.weight = BigInt(weight);
        this.file_parent_id = file_parent_id;
        this.cid = cid;
        this.typ = typ;
        this.from = from;
        this.to = to;
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
            ['from', 'string'],
            ['to', 'string'],
        ],
    }],
]);

async function main() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Replace these with the actual private key strings
    const payerPrivateKeyString = 'mRnBem6E8vLjKuQtEsGu7tsfjCdrjoKxLNB5dhzt4gi2fDicZcZ2zbbFUNsY4MemGQtob1C5mjRw9v5J55RpGpp';
    const initiatorPrivateKeyString = '4g6ic2r7v1JpoyQGEJnM9XVFK7aDiyQyhae5MJY8crxtRMes6DAwQ5CT7tRKGhf7pbwLk9xmRta2MMgw3sR62VJf';

    const payer = Keypair.fromSecretKey(bs58.decode(payerPrivateKeyString));
    const initiator = Keypair.fromSecretKey(bs58.decode(initiatorPrivateKeyString));

    // Example user metadata
    const metadata = new TokenMetadata({
        file_id: '1',
        name: 'Ejemplo',
        weight: 100,
        file_parent_id: '0',
        cid: 'cid',
        typ: 'file',
        from: 'example_from',
        to: 'example_to'
    });

    // Serialize the user metadata
    const userMetadataBuffer = Buffer.from(serialize(TokenMetadataSchema, metadata));

    // Define the instruction for sending the user metadata
    const customInstruction = new TransactionInstruction({
        keys: [
            { pubkey: initiator.publicKey, isSigner: true, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: userMetadataBuffer, // Serialized user metadata
    });

    let transaction = new Transaction().add(customInstruction);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = payer.publicKey;

    console.log('Signing and sending transaction...');
    const signedTransaction = await connection.sendTransaction(transaction, [payer, initiator], { skipPreflight: false, preflightCommitment: "confirmed" });
    console.log(`Transaction confirmed with signature: ${signedTransaction}`);
}

main().then(() => console.log('Script finished successfully')).catch(console.error);
