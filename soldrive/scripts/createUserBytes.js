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

// Helper function to convert string to bytes (Uint8Array)
function stringToBytes(str) {
    return new TextEncoder().encode(str);
}

// Updated UserMetadata class to use bytes
class UserMetadata {
    constructor(properties) {
        this.user_solana = properties.user_solana;
        this.did_public_address = properties.did_public_address;
    }
}

// Assignable class for structuring properties
class Assignable {
    constructor(properties) {
        Object.assign(this, properties);
    }
}

class InstructionPayload extends Assignable {}

// Updated schema to use 'vec<u8>' for bytes
const UserMetadataSchema = new Map([
    [UserMetadata, { 
        kind: 'struct', 
        fields: [
            ['user_solana', ['u8']],
            ['did_public_address', ['u8']]
        ]
    }]
]);

const InstructionPayloadSchema = new Map([
    [InstructionPayload, {
        kind: 'struct',
        fields: [
            ['variant', 'u8'],
            ['user_metadata', UserMetadata]
        ]
    }],
    ...UserMetadataSchema
]);

async function main() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Replace these with the actual private key strings
    const payerPrivateKeyString = '3AE8ZwU4xQGiv6r9vdYEAv5z92vT9qnHYE7gnmyb5oDZr5JH6N5b3jfGdEX3aJ6V4Qn8CLUs6CrUDYGigi9Hb1Uu';
    const initiatorPrivateKeyString = '3AE8ZwU4xQGiv6r9vdYEAv5z92vT9qnHYE7gnmyb5oDZr5JH6N5b3jfGdEX3aJ6V4Qn8CLUs6CrUDYGigi9Hb1Uu';

    const payer = Keypair.fromSecretKey(bs58.decode(payerPrivateKeyString));
    const initiator = Keypair.fromSecretKey(bs58.decode(initiatorPrivateKeyString));

    // Example user metadata using bytes
    const userMetadata = new UserMetadata({
        user_solana: stringToBytes('ExampleSolanaAddress'),
        did_public_address: stringToBytes('ExampleDIDPublicAddress'),
    });

    // Create the instruction payload
    const instructionPayload = new InstructionPayload({
        variant: 0, // 0 for UserMetadata
        user_metadata: userMetadata
    });

    // Serialize the instruction payload
    const serializedData = borsh.serialize(InstructionPayloadSchema, instructionPayload);
    const instructionBuffer = Buffer.from(serializedData);

    // Define the instruction for sending the user metadata
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
