const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const bs58 = require('bs58');
const sha256 = require('js-sha256');

// Hardcoded signKeyPair
const signKeyPair = {
    publicKey: bs58.decode('6j3E47AQHWksMb7JX8723dUGkx4hGEKbiVMLgQrAktie'),
    secretKey: bs58.decode('4ifUznJrDaRGLjGTLxBaAtqPuxv3xv8CNmwGHQeZw5SGFrSf16k59fYecANfx468ADeN4sj3vW3xpFYT9rk545BQ')
};

// Sign a message
const message = 'Hello, blockchain world!';
const messageUint8 = naclUtil.decodeUTF8(message);
const signature = nacl.sign.detached(messageUint8, signKeyPair.secretKey);

// Convert the signature to a Base64 string for easy reading
const signatureBase64 = naclUtil.encodeBase64(signature);
console.log('Signature (Base64):', signatureBase64);

// Hash the signature to create a seed
const signatureHash = sha256.array(signature);

// Generate a new key pair using the hash of the signature as the seed
const seed = new Uint8Array(signatureHash.slice(0, 32)); // Ensuring the seed is 32 bytes
const newKeyPair = nacl.sign.keyPair.fromSeed(seed);

// Convert the new keys to Base58 for consistency and logging
const newPublicKeyBase58 = bs58.encode(newKeyPair.publicKey);
const newPrivateKeyBase58 = bs58.encode(newKeyPair.secretKey);

console.log('New Public Key (Base58):', newPublicKeyBase58);
console.log('New Private Key (Base58):', newPrivateKeyBase58);
