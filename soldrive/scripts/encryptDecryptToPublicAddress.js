const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

// Simulating recipient's key pair (In practice, the recipient shares their public key)
const recipientKeyPair = nacl.box.keyPair();

// wallet = tx // publicaddress  
// Simulating sender's key pair
const senderKeyPair = nacl.box.keyPair();

// Function to encrypt a message
function encryptMessage(message, recipientPublicKey, senderSecretKey) {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = naclUtil.decodeUTF8(message);
    const encryptedMessage = nacl.box(messageUint8, nonce, recipientPublicKey, senderSecretKey);
    // call solana contract 
    return { encryptedMessage, nonce };
}

// Function to decrypt the message
function decryptMessage(encryptedMessage, nonce, senderPublicKey, recipientSecretKey) {
    const decryptedMessage = nacl.box.open(encryptedMessage, nonce, senderPublicKey, recipientSecretKey);
    
    if (!decryptedMessage) {
        throw new Error('Could not decrypt message');
    }
    
    return naclUtil.encodeUTF8(decryptedMessage);
}

// Encrypt a message for the recipient
const { encryptedMessage, nonce } = encryptMessage('Hello, Solana!', recipientKeyPair.publicKey, senderKeyPair.secretKey);

// Decrypt the message (normally, the recipient would do this with their private key)
const decryptedMessage = decryptMessage(encryptedMessage, nonce, senderKeyPair.publicKey, recipientKeyPair.secretKey);

console.log(`Decrypted message: ${decryptedMessage}`);``
