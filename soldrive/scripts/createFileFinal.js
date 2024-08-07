const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    Transaction,
    TransactionInstruction,
} = require('@solana/web3.js');
const borsh = require('borsh');
const { Buffer } = require('buffer');
const bs58 = require('bs58');

const PROGRAM_ID = new PublicKey('7i64BS8nZE3bx7CJypK2T4SPfvGauBDLTX1UvkWX1qo');

class TokenMetadata {
    constructor(properties) {
        Object.assign(this, properties);
    }
}

class Assignable {
    constructor(properties) {
        Object.assign(this, properties);
    }
}

class InstructionPayload extends Assignable {}

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
            ['version', 'string']  // Added version field
        ]
    }]
]);

const InstructionPayloadSchema = new Map([
    [InstructionPayload, {
        kind: 'struct',
        fields: [
            ['variant', 'u8'],
            ['token_metadata', TokenMetadata]
        ]
    }],
    ...TokenMetadataSchema
]);

async function main() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Replace these with the actual private key strings
    const payerPrivateKeyString = '3AE8ZwU4xQGiv6r9vdYEAv5z92vT9qnHYE7gnmyb5oDZr5JH6N5b3jfGdEX3aJ6V4Qn8CLUs6CrUDYGigi9Hb1Uu';
    const initiatorPrivateKeyString = '3AE8ZwU4xQGiv6r9vdYEAv5z92vT9qnHYE7gnmyb5oDZr5JH6N5b3jfGdEX3aJ6V4Qn8CLUs6CrUDYGigi9Hb1Uu';

    const payer = Keypair.fromSecretKey(bs58.decode(payerPrivateKeyString));
    const initiator = Keypair.fromSecretKey(bs58.decode(initiatorPrivateKeyString));

    // Example token metadata
    const tokenMetadata = new TokenMetadata({
        file_id: 'ExampleFileID',
        name: 'ExampleFileName',
        weight: BigInt(1000), // Use BigInt for u64
        file_parent_id: 'ExampleParentFileID',
        cid: 'ExampleCID',
        typ: 'ExampleType',
        from: 'ExampleFromAddress',
        to: 'ExampleToAddress',
        version: 'ExampleVersion'  // Added version field
    });

    // Create the instruction payload
    const instructionPayload = new InstructionPayload({
        variant: 1, // 1 for TokenMetadata
        token_metadata: tokenMetadata
    });

    // Serialize the instruction payload
    const serializedData = borsh.serialize(InstructionPayloadSchema, instructionPayload);
    const instructionBuffer = Buffer.from(serializedData);

    // Define the instruction for sending the token metadata
    const customInstruction = new TransactionInstruction({
        keys: [
            { pubkey: initiator.publicKey, isSigner: true, isWritable: true },
            // Add more keys as needed by your instruction
        ],
        programId: PROGRAM_ID,
        data: instructionBuffer,
    });

    let transaction = new Transaction().add(customInstruction);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = payer.publicKey;

    console.log('Signing and sending transaction...');
    try {
        const signature = await connection.sendTransaction(transaction, [payer, initiator], { skipPreflight: false, preflightCommitment: "confirmed" });
        console.log('Transaction sent. Signature:', signature);
        
        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        if (confirmation.value.err) {
            throw new Error('Transaction failed to confirm');
        }
        console.log('Transaction confirmed');
    } catch (error) {
        console.error('Error sending transaction:', error);
        if (error.logs) {
            console.error('Transaction logs:', error.logs);
        }
    }
}

main().then(() => console.log('Script finished successfully')).catch(console.error);