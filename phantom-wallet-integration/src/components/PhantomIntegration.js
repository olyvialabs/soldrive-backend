import React, { useState } from 'react';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import bs58 from 'bs58';


function PhantomIntegration() {
    const [publicKey, setPublicKey] = useState('');
    const [message, setMessage] = useState('');
    const [recipientPublicKey, setRecipientPublicKey] = useState('');
    const [encryptedMessage, setEncryptedMessage] = useState('');
    const [nonce, setNonce] = useState(''); // Add nonce to state for decryption
    const [decryptedMessage, setDecryptedMessage] = useState(''); // State to hold decrypted message


    const connectWallet = async () => {
        try {
            const { solana } = window;
            if (solana && solana.isPhantom) {
                const response = await solana.connect();
                setPublicKey(response.publicKey.toString());
                alert('Wallet connected!');
            } else {
                alert('Phantom wallet not found. Please install it.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const encryptMessage = () => {
        try {
            console.log('Starting encryption process...');
            
            // Decode the message to Uint8Array
            const messageUint8 = naclUtil.decodeUTF8(message);
            console.log('Message decoded to Uint8Array:', messageUint8);
            
            // Decode the recipient's public key from Base58 to Uint8Array
            const recipientPublicKeyUint8 = bs58.decode(recipientPublicKey);
            console.log('Recipient public key decoded from Base58:', recipientPublicKeyUint8);
    
            // Check if the public key size is correct
            if (recipientPublicKeyUint8.length !== 32) {
                console.error(`Invalid recipient public key size: ${recipientPublicKeyUint8.length}`);
                return;
            }
    
            // Assuming a sender's key pair is available for demonstration
            const senderKeyPair = nacl.box.keyPair();
            console.log('Sender key pair generated.');
    
            // Generate nonce
            const nonce = nacl.randomBytes(nacl.box.nonceLength);
            console.log('Nonce generated:', nonce);
    
            // Encrypt the message
            const encrypted = nacl.box(messageUint8, nonce, recipientPublicKeyUint8, senderKeyPair.secretKey);
            console.log('Message encrypted:', encrypted);
    
            // Encode the encrypted message and nonce to Base64 for display or transmission
            const encryptedMessageBase64 = naclUtil.encodeBase64(encrypted);
            const nonceBase64 = naclUtil.encodeBase64(nonce);
            console.log(`Encrypted message (Base64): ${encryptedMessageBase64}, Nonce (Base64): ${nonceBase64}`);
            
            setEncryptedMessage(`Encrypted Message: ${encryptedMessageBase64}, Nonce: ${nonceBase64}`);
        } catch (error) {
            console.error('Encryption failed:', error);
        }
    };
    const decryptMessage = () => {
        try {
            console.log('Starting decryption process...');

            // Decode the encrypted message and nonce from Base64
            const encryptedMessageUint8 = naclUtil.decodeBase64(encryptedMessage.split(':')[1].trim());
            const nonceUint8 = naclUtil.decodeBase64(nonce);

            // Assuming you have the recipient's secret key (in practice, should be securely obtained)
            // For demonstration, let's pretend the recipient uses the same key pair (this is not secure or practical in real usage)
            const recipientKeyPair = nacl.box.keyPair(); // This should be the recipient's actual key pair
            
            // Decrypt the message
            const decrypted = nacl.box.open(encryptedMessageUint8, nonceUint8, publicKey, recipientKeyPair.secretKey);
            if (!decrypted) {
                throw new Error('Failed to decrypt the message.');
            }

            // Convert decrypted message back to UTF-8
            const decryptedText = naclUtil.encodeUTF8(decrypted);
            console.log('Decrypted message:', decryptedText);

            setDecryptedMessage(decryptedText);
        } catch (error) {
            console.error('Decryption failed:', error);
        }
    };

    return (
        <div>
            <button onClick={connectWallet}>Connect to Phantom Wallet</button>
            {publicKey && <p>Connected as: {publicKey}</p>}
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a message"
            />
            <input
                type="text"
                value={recipientPublicKey}
                onChange={(e) => setRecipientPublicKey(e.target.value)}
                placeholder="Recipient's Public Key (Base64)"
            />
            <button onClick={encryptMessage}>Encrypt Message</button>
            {encryptedMessage && <p>{encryptedMessage}</p>}
            <button onClick={decryptMessage}>Decrypt Message</button> {/* Add button for decryption */}
            {decryptedMessage && <p>Decrypted Message: {decryptedMessage}</p>}
        </div>
    );
}

export default PhantomIntegration;