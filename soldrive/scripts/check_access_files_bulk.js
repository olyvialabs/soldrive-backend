const solanaWeb3 = require("@solana/web3.js");

// Setup the connection to use the Alchemy RPC endpoint
const alchemyEndpoint = "https://solana-devnet.g.alchemy.com/v2/zEDWpOFCLIVzNr7iqfQmypknGRQSV0jX";
const connection = new solanaWeb3.Connection(alchemyEndpoint, "confirmed");

async function getAllSignatures(address) {
    let allSignatures = [];
    let before = null;
    let finished = false;

    while (!finished) {
        const options = {
            limit: 1000,
            before,
            commitment: "confirmed"
        };

        const startTime = Date.now();
        const signatures = await connection.getConfirmedSignaturesForAddress2(new solanaWeb3.PublicKey(address), options);
        const endTime = Date.now();

        console.log(`Fetched ${signatures.length} signatures in ${endTime - startTime}ms`);

        if (signatures.length > 0) {
            allSignatures.push(...signatures);
            before = signatures[signatures.length - 1].signature;
            console.log("before",before);
        } else {
            finished = true;
        }
    }

    return allSignatures;
}

function parseMetadata(metadataString) {
    const metadata = {};
    const parts = metadataString
        .replace("Program log: Deserialized metadata: TokenMetadata { ", "")
        .replace(" }", "")
        .split(", ");

    parts.forEach((part) => {
        const [key, value] = part.split(": ");
        metadata[key.trim()] = value.replace(/"/g, "");
    });

    return metadata;
}

async function getContractLogs(address) {
    const allSignatures = await getAllSignatures(address);
    const allLogs = [];

    for (let signatureInfo of allSignatures) {
        const startTime = Date.now();
        const transaction = await connection.getTransaction(signatureInfo.signature, { commitment: "confirmed" });
        const endTime = Date.now();

        console.log(`Fetched transaction for signature ${signatureInfo.signature} in ${endTime - startTime}ms`);

        if (transaction && transaction.meta && transaction.meta.logMessages) {
            const metadataMessages = transaction.meta.logMessages.filter(log => log.startsWith("Program log: Deserialized metadata:"));
            if (metadataMessages.length > 0) {
                const metadata = parseMetadata(metadataMessages[0]);
                const logObject = {
                    ...metadata,
                    slot: signatureInfo.slot,
                    signature: signatureInfo.signature,
                    timeTaken: endTime - startTime
                };
                allLogs.push(logObject);
                console.log(`Metadata for signature ${signatureInfo.signature}:`, metadata);
            }
        }
    }

    return allLogs;
}

async function main() {
  const startTime = Date.now();

    const contractAddress = "4v3uT7y6RHLCJLSwAjWg59tJFhZG1rpa6Q9u6NsZrgUu";
    const logs = await getContractLogs(contractAddress);
    console.log('Fetched Logs:', logs.filter(log => Object.keys(log).length > 3)); // Filters out logs without metadata

    const endTime = Date.now();
  
    console.log("Total execution time:", endTime - startTime)
}

main().catch(console.error);
