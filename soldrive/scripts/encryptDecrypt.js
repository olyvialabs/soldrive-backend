const nacl = require('tweetnacl');
const bs58 = require('bs58');
const naclUtil = require('tweetnacl-util');

// (Sender)
const userAPrivateKeyBase58 = 'mRnBem6E8vLjKuQtEsGu7tsfjCdrjoKxLNB5dhzt4gi2fDicZcZ2zbbFUNsY4MemGQtob1C5mjRw9v5J55RpGpp';
const userAPublicKeyBase58 = 'AHoKma3LKVeJeHNA5mpPqyNDCAuE2XnvquzuXw3s29f6';

// (Recipient)
const userBPrivateKeyBase58 = 'cXr4DJ6DMEzPHvjw5Hh1qLWqeudnewgZ7w8gQs2cY3UmumRC5uVci3YHXb4aivAw7xpuTDbRWcQyj9hfxU3Krtb';
const userBPublicKeyBase58 = 'Dt66zsAwUb12H21cpVqRQx44kXFRfZxT3xCs2bKsY1XZ';

// Decode the Base58 keys
const userAPublicKeyEd25519 = bs58.decode(userAPublicKeyBase58);
const userAPrivateKeyEd25519 = bs58.decode(userAPrivateKeyBase58).slice(0, 32);
const userBPublicKeyEd25519 = bs58.decode(userBPublicKeyBase58);
const userBPrivateKeyEd25519 = bs58.decode(userBPrivateKeyBase58).slice(0, 32);

// Convert Ed25519 secret keys to Curve25519 key pairs
const userAKeyPairCurve25519 = nacl.box.keyPair.fromSecretKey(userAPrivateKeyEd25519);
const userBKeyPairCurve25519 = nacl.box.keyPair.fromSecretKey(userBPrivateKeyEd25519);

// Use a fixed nonce for both encryption and decryption to ensure consistency
const nonce = nacl.randomBytes(nacl.box.nonceLength);


// Encrypt a message with User B's Curve25519 public key
function encryptMessage(message, recipientPublicKey) {
  const messageUint8 = naclUtil.decodeUTF8(message);
  const encryptedMessage = nacl.box(messageUint8, nonce, recipientPublicKey, userAKeyPairCurve25519.secretKey);
  return naclUtil.encodeBase64(encryptedMessage);
}

// Decrypt a message with User B's Curve25519 secret key
function decryptMessage(encryptedMessageBase64, nonce, senderPublicKey) {
  const encryptedMessageUint8 = naclUtil.decodeBase64(encryptedMessageBase64);
  const decryptedMessage = nacl.box.open(encryptedMessageUint8, nonce, senderPublicKey, userBKeyPairCurve25519.secretKey);
  if (!decryptedMessage) throw new Error('Decryption failed');
  return naclUtil.encodeUTF8(decryptedMessage);
}

// Demonstrating the encryption and decryption process
const message = 'Hello, User B!';
const encryptedMessageBase64 = encryptMessage(message, userBKeyPairCurve25519.publicKey);
console.log('Encrypted Message (Base64):', encryptedMessageBase64);

try {
  const decryptedMessage = decryptMessage(encryptedMessageBase64, nonce, userAKeyPairCurve25519.publicKey);
  console.log('Decrypted message:', decryptedMessage);
} catch (error) {
  console.error(error.message);
}
