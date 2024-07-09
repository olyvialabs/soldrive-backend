const {
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl,
    sendAndConfirmTransaction,
} = require('@solana/web3.js');
const {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');

// Initialize connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// User keypair (sender)
const user = Keypair.fromSecretKey(Uint8Array.from([
    79, 245, 161, 127, 74, 192, 138, 89, 36, 245, 172, 228, 48, 15, 105, 35, 242, 97, 8, 188, 165, 248, 95, 241, 115,
    196, 175, 89, 3, 185, 254, 216, 194, 191, 77, 41, 238, 137, 12, 47, 63, 105, 125, 55, 252, 78, 21, 205, 50, 50,
    133, 200, 92, 195, 192, 129, 191, 247, 115, 181, 184, 192, 176, 182
]));

// Token mint address
const tokenMint = new PublicKey("9GBNjXFfsuoTrrQDRVaV9xCDQwzpWSGJuwMjLwb8RXAY");

// Receiving user public key
const receivingUser = new PublicKey("Bt34eqhc7RK857JozPKpcAjj9G21w4UY3mYozrDz6N7J");

async function mintAndSendTokens() {
    try {
        // Get or create an associated token account for the receiver
        const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            user,
            tokenMint,
            receivingUser
        );

        // Mint tokens to the receiver's associated token account
        const mintAmount = 1000000; // Adjust the amount to mint as needed
        await mintTo(
            connection,
            user,
            tokenMint,
            receiverTokenAccount.address,
            user,
            mintAmount
        );

        console.log(`Minted ${mintAmount} tokens to receiver's associated token account ${receiverTokenAccount.address.toBase58()} public address ${receivingUser} `,);
    } catch (err) {
        console.error('Error during mint and send tokens:', err);
    }
}

mintAndSendTokens();
