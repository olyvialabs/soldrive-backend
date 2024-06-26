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

const PROGRAM_ID = new PublicKey('6QnLoMCJV2quAy4GuEsDzH7ubN5vW9NN9zwVNgXNEhYo');

// Matching the Rust struct with JavaScript class
class UserMetadata {
    constructor({ user_solana, did_public_address }) {
        this.user_solana = user_solana;
        this.did_public_address = did_public_address;
    }
}

const UserMetadataSchema = new Map([
    [UserMetadata, {
        kind: 'struct',
        fields: [
            ['user_solana', 'string'],
            ['did_public_address', 'string'],
        ],
    }],
]);

async function main() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Replace 'YourPayerPrivateKeyStringHere' with the actual private key string
    const payerPrivateKeyString = 'mRnBem6E8vLjKuQtEsGu7tsfjCdrjoKxLNB5dhzt4gi2fDicZcZ2zbbFUNsY4MemGQtob1C5mjRw9v5J55RpGpp';
    const payer = Keypair.fromSecretKey(bs58.decode(payerPrivateKeyString));

    // Example user metadata
    const userMetadata = new UserMetadata({
        user_solana: 'ExampleSolanaAddress',
        did_public_address: 'ExampleDIDPublicAddress',
    });

    // Serialize the user metadata
    const userMetadataBuffer = Buffer.from(serialize(UserMetadataSchema, userMetadata));

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
