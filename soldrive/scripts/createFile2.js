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

const PROGRAM_ID = new PublicKey('4v3uT7y6RHLCJLSwAjWg59tJFhZG1rpa6Q9u6NsZrgUu');

// Matching the Rust struct with JavaScript class
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

    // Replace 'YourPayerPrivateKeyStringHere' with the actual private key string
    const payerPrivateKeyString = 'mRnBem6E8vLjKuQtEsGu7tsfjCdrjoKxLNB5dhzt4gi2fDicZcZ2zbbFUNsY4MemGQtob1C5mjRw9v5J55RpGpp';
    const payer = Keypair.fromSecretKey(bs58.decode(payerPrivateKeyString));

    // Example user metadata
    const metadata = new TokenMetadata({
        file_id: '1',
        name: 'Ejemplo',
        weight: 100,
        file_parent_id: '0',
        cid: 'cid',
        typ: 'file',
    });

    // Serialize the user metadata
    const userMetadataBuffer = Buffer.from(serialize(TokenMetadataSchema, metadata));

    // Define the instruction for sending the user metadata
    const customInstruction = new TransactionInstruction({
        keys: [
            // Specify the required accounts here, for example:
            // { pubkey: userAccountPublicKey, isSigner: false, isWritable: true },
            // Add more keys as needed by your instruction
        ],
        programId: PROGRAM_ID,
        data: userMetadataBuffer, // Serialized user metadata
    });
    
    let transaction = new Transaction().add(customInstruction);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = payer.publicKey;

    console.log('Signing and sending transaction...');
    await connection.sendTransaction(transaction, [payer], { skipPreflight: false, preflightCommitment: "confirmed" });
    console.log('Transaction confirmed');
}

main().then(() => console.log('Script finished successfully')).catch(console.error);
