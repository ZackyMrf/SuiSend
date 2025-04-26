const { SuiClient } = require('@mysten/sui.js/client');
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { TransactionBlock } = require('@mysten/sui.js/transactions');
const fs = require('fs');

// Use SuiClient
const client = new SuiClient({
  url: 'https://sui-testnet-rpc.publicnode.com',
});

// Read private keys from file (one key per line)
const privateKeys = fs.readFileSync('private_keys.txt', 'utf-8').trim().split('\n');
const receiver = "<ReceiverAddress>"; // Replace with actual receiver address
const amountToSend = 995000000; // 0.995 SUI (1 SUI = 10^9 MIST)
const DELAY = 15000; // 15 seconds per transaction

async function sendTransaction(privateKey, index) {
    try {
        // Create keypair from hex private key
        const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey.replace('0x', ''), 'hex'));
        const address = keypair.toSuiAddress();
        
        console.log(`📢 Processing wallet ${index+1}: ${address}`);
        
        // Get balance
        const { totalBalance } = await client.getBalance({
            owner: address,
            coinType: '0x2::sui::SUI'
        });
        
        console.log(`📢 ${address} | Balance: ${parseInt(totalBalance) / 1000000000} SUI`);

        if (parseInt(totalBalance) < amountToSend + 2000000) { // 0.002 SUI for gas buffer
            console.log(`⚠️ Saldo tidak cukup.`);
            return;
        }

        // Create transaction block
        const tx = new TransactionBlock();
        tx.transferObjects([
            tx.splitCoins(tx.gas, [tx.pure(amountToSend)]),
        ], tx.pure(receiver));
        
        // Execute transaction
        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });

        console.log(`🔄 TX: ${result.digest}`);
        console.log(`✅ Berhasil ke ${receiver}`);
    } catch (error) {
        console.error(`❌ Error:`, error.message);
    }
}

// Add delay between transactions
privateKeys.forEach((key, i) => setTimeout(() => sendTransaction(key, i), i * DELAY));