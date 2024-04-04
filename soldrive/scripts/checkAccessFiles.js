const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const Borsh = require('borsh');
const bs58 = require('bs58');

class PublicKeyBytes {
  constructor(array) {
    this.array = array;
  }
}

// Since the structure is an array of fixed-size bytes arrays, we need a custom deserialization method
function deserializePublicKeyBytes(data) {
  let offset = 0;
  const publicKeyBytes = [];
  while (offset < data.length) {
    publicKeyBytes.push(data.slice(offset, offset + 32));
    offset += 32;
  }
  return publicKeyBytes.map(bytes => new PublicKeyBytes(bytes));
}

class MintLedger {
  constructor(properties) {
    Object.assign(this, properties);
  }

  static schema = new Map([
    [MintLedger, {
      kind: 'struct',
      fields: [
        ['mint_addresses', 'Vec<PublicKeyBytes>'], // This indicates a dynamic array of PublicKeyBytes
      ]
    }]
  ]);

  static deserialize(data) {
    // Assuming the first 4 bytes indicate the length of the array
    const length = new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(0, true);
    const start = 4; // Skipping the first 4 bytes which indicate the length
    const mintAddresses = deserializePublicKeyBytes(data.slice(start, start + length * 32));

    return new MintLedger({ mint_addresses: mintAddresses });
  }
}

async function fetchLedgerData(ledgerAccountPubkey) {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const ledgerAccountInfo = await connection.getAccountInfo(ledgerAccountPubkey);

  if (ledgerAccountInfo) {
    // Directly using the custom deserialize method
    const ledgerData = MintLedger.deserialize(ledgerAccountInfo.data);
    const mintAddresses = ledgerData.mint_addresses;

    console.log("Ledger Data:", ledgerData);

    mintAddresses.forEach((address, index) => {
      console.log(`Mint Address ${index + 1}:`, bs58.encode(new Uint8Array(address.array)));
    });
  } else {
    console.log("Ledger account not found.");
  }
}

const ledgerAccountPublicKeyString = 'HXqEkDzaVgTibQ56wTmDMXNijmZ1HTqL9vqezn3TAZ7p';
const ledgerAccountPubkey = new PublicKey(ledgerAccountPublicKeyString);

fetchLedgerData(ledgerAccountPubkey).catch
