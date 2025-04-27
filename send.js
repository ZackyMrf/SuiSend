const { SuiClient } = require('@mysten/sui.js/client');
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { TransactionBlock } = require('@mysten/sui.js/transactions');
const fs = require('fs');

// ANSI color codes for better visual display
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

// Use SuiClient
const client = new SuiClient({
  url: 'https://sui-testnet-rpc.publicnode.com',
});

// Read private keys from file (one key per line)
const privateKeys = fs.readFileSync('private_keys.txt', 'utf-8').trim().split('\n');
const receiver = "<ReceiverAddress>"; // Replace with actual receiver address
const amountToSend = 995000000; // 0.995 SUI (1 SUI = 10^9 MIST)
const DELAY = 15000; // 15 seconds per transaction

// Statistics tracking
let stats = {
  total: privateKeys.length,
  success: 0,
  failed: 0,
  insufficient: 0
};

console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════╗
║             SUI TOKEN TRANSFER            ║
║                                           ║
║  Total Wallets: ${String(privateKeys.length).padStart(3)}                    ║
║  Amount: ${(amountToSend / 1000000000).toFixed(4)} SUI                    ║
║  Receiver: ${receiver.substring(0, 6)}...${receiver.substring(receiver.length - 4)}           ║
╚═══════════════════════════════════════════╝
${colors.reset}`);

async function sendTransaction(privateKey, index) {
    try {
        const startTime = new Date();
        const timestamp = `[${startTime.toLocaleTimeString()}]`;
        
        // Create keypair from hex private key
        const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey.replace('0x', ''), 'hex'));
        const address = keypair.toSuiAddress();
        
        console.log(`\n${colors.bright}${colors.blue}${timestamp} 🔍 WALLET ${index+1}/${privateKeys.length}: ${address.substring(0, 6)}...${address.substring(address.length - 4)}${colors.reset}`);
        
        // Get balance
        const { totalBalance } = await client.getBalance({
            owner: address,
            coinType: '0x2::sui::SUI'
        });
        
        const balanceSUI = parseInt(totalBalance) / 1000000000;
        console.log(`${colors.cyan}${timestamp} 💰 Balance: ${balanceSUI.toFixed(6)} SUI${colors.reset}`);

        if (parseInt(totalBalance) < amountToSend + 2000000) { // 0.002 SUI for gas buffer
            console.log(`${colors.yellow}${timestamp} ⚠️  Insufficient balance - Need ${(amountToSend + 2000000) / 1000000000} SUI${colors.reset}`);
            stats.insufficient++;
            return;
        }

        // Create transaction block
        const tx = new TransactionBlock();
        tx.transferObjects([
            tx.splitCoins(tx.gas, [tx.pure(amountToSend)]),
        ], tx.pure(receiver));
        
        console.log(`${colors.cyan}${timestamp} 🔄 Sending ${amountToSend / 1000000000} SUI to ${receiver.substring(0, 6)}...${receiver.substring(receiver.length - 4)}${colors.reset}`);
        
        // Execute transaction
        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });

        const endTime = new Date();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`${colors.green}${timestamp} ✅ SUCCESS in ${duration}s${colors.reset}`);
        console.log(`${colors.bright}${timestamp} 📝 TX: ${result.digest}${colors.reset}`);
        stats.success++;
    } catch (error) {
        console.log(`${colors.red}${timestamp} ❌ ERROR: ${error.message}${colors.reset}`);
        stats.failed++;
    }
}

// Display progress and summary
let completed = 0;
privateKeys.forEach((key, i) => {
    setTimeout(() => {
        sendTransaction(key, i).finally(() => {
            completed++;
            if (completed === privateKeys.length) {
                setTimeout(showSummary, 1000);
            }
        });
    }, i * DELAY);
});

function showSummary() {
    console.log(`\n${colors.bright}${colors.magenta}
╔═══════════════════════════════════════════╗
║               SUMMARY REPORT              ║
║                                           ║
║  ✅ Successful:   ${String(stats.success).padStart(3)}                    ║
║  ⚠️  Insufficient: ${String(stats.insufficient).padStart(3)}                    ║
║  ❌ Failed:       ${String(stats.failed).padStart(3)}                    ║
║  📊 Total:        ${String(stats.total).padStart(3)}                    ║
╚═══════════════════════════════════════════╝
${colors.reset}`);
}