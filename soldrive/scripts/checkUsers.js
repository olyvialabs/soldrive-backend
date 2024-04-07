const solanaWeb3 = require("@solana/web3.js");

// Setup the connection to use the Alchemy RPC endpoint
const alchemyEndpoint = "https://solana-devnet.g.alchemy.com/v2/zEDWpOFCLIVzNr7iqfQmypknGRQSV0jX";
const connection = new solanaWeb3.Connection(alchemyEndpoint, "confirmed");

function parseMetadata(metadataString) {
  const metadata = {};
  const parts = metadataString
    .replace("Program log: Deserialized metadata: ", "")
    .replace(" }", "")
    .replace("{ ", "")
    .split(", ");

  parts.forEach((part) => {
    const [key, value] = part.split(": ");
    metadata[key.trim()] = value.replace(/"/g, "").trim();
  });

  return metadata;
}

async function getContractLogs(contractAddress) {
  const publicKey = new solanaWeb3.PublicKey(contractAddress);
  const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
  const allMetadataLogs = [];

  for (let signatureInfo of signatures) {
    try {
      const transaction = await connection.getTransaction(signatureInfo.signature, { commitment: "confirmed" });
      if (transaction && transaction.meta && transaction.meta.logMessages) {
        const metadataMessages = transaction.meta.logMessages.filter(log => log.startsWith("Program log: Deserialized metadata:"));
        metadataMessages.forEach(metadataLog => {
          const metadata = parseMetadata(metadataLog);
          allMetadataLogs.push(metadata);
        });
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
    }
  }

  return allMetadataLogs;
}

async function main() {
  const contractAddress = "6QnLoMCJV2quAy4GuEsDzH7ubN5vW9NN9zwVNgXNEhYo";
  const allMetadataLogs = await getContractLogs(contractAddress);

  // Output the JSON array of all deserialized metadata
  console.log(JSON.stringify(allMetadataLogs, null, 2));
}

main().catch(console.error);
