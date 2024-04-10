const solanaWeb3 = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, Token, getAssociatedTokenAddress } = require("@solana/spl-token");
// Setup the connection to use the Alchemy RPC endpoint
const alchemyEndpoint = "https://solana-devnet.g.alchemy.com/v2/zEDWpOFCLIVzNr7iqfQmypknGRQSV0jX";
const connection = new solanaWeb3.Connection(alchemyEndpoint, "confirmed");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseMetadata(metadataString) {
  const metadata = {};
  const parts = metadataString
    .replace("Program log: Deserialized metadata: TokenMetadata { ", "")
    .replace(" }", "")
    .split(", ");

  parts.forEach((part) => {
    const [key, value] = part.split(": ");
    metadata[key] = value.replace(/"/g, "");
  });

  return metadata;
}

async function getContractLogs(contractAddress) {
  const publicKey = new solanaWeb3.PublicKey(contractAddress);
  const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
  const allLogs = [];

  for (let signatureInfo of signatures) {
    try {
      const transaction = await connection.getTransaction(signatureInfo.signature, { commitment: "confirmed" });
      if (transaction && transaction.meta && transaction.meta.logMessages) {
        // Find specific log messages
        const metadataMessages = transaction.meta.logMessages.filter(log => log.startsWith("Program log: Deserialized metadata:"));
        // Only add if both types of messages exist
        if ( metadataMessages.length > 0) {
          const metadata = parseMetadata(metadataMessages[0]);
          const logObject = {
            ...metadata,
          };
          allLogs.push(logObject);
        }
      }
      await sleep(1000); // Delay to prevent rate limit errors
    } catch (error) {
      console.error("Error fetching transaction:", error);
      await sleep(5000); // Wait longer before retrying
    }
  }

  return allLogs;
}
// async function getTokenAccountBalance(connection, walletAddress, mintAddress) {
//   const associatedTokenAddress = await getAssociatedTokenAddress(new solanaWeb3.PublicKey(mintAddress), new solanaWeb3.PublicKey(walletAddress));
//   let accountInfo;

//   try {
//     accountInfo = await connection.getParsedAccountInfo(associatedTokenAddress);
//   } catch (error) {
//     console.error(`Error fetching account info for associated token address ${associatedTokenAddress.toBase58()}:`, error);
//     return 0;
//   }

//   if (!accountInfo.value || !accountInfo.value.data) {
//     console.log(`No account data found for associated token address ${associatedTokenAddress.toBase58()}`);
//     return 0;
//   }

//   // Check if the account info is of a token account and has a parsed data field
//   if (accountInfo.value.data.parsed && accountInfo.value.data.program === "spl-token") {
//     const tokenAmount = accountInfo.value.data.parsed.info.tokenAmount.uiAmount;
//     return tokenAmount;
//   } else {
//     console.log(`Account ${associatedTokenAddress.toBase58()} is not a valid SPL Token account or has no balance.`);
//     return 0;
//   }
// }

async function getWalletBalances(walletAddress, allLogs) {
  const balances = [];

  for (const log of allLogs) {
    const balance = await getTokenAccountBalance(connection, walletAddress, log.mintAddress);
    balances.push({
      ...log,
      balance: balance / solanaWeb3.LAMPORTS_PER_SOL,
    });
  }

  console.log("Token balances for wallet:", walletAddress, "\n", balances);
}

async function main() {
  // PROGRAM ID , this is fixed
  const contractAddress = "4v3uT7y6RHLCJLSwAjWg59tJFhZG1rpa6Q9u6NsZrgUu";
  const allLogs = await getContractLogs(contractAddress);

  console.log(allLogs)

  // // User we want to know the balances of
  // const walletAddress = "B5vRKGHmuaYC6f7R7BCg3ann2AKdZEAppJiJeBAEgKP";
  // await getWalletBalances(walletAddress, allLogs);
}

main().catch(console.error);
