# SuiSend

A utility tool for sending SUI tokens from multiple wallets to a single address on the Sui blockchain.

## Description

SuiSend automates the process of transferring SUI tokens from multiple wallets to a designated receiver address. It reads private keys from a file, checks each wallet's balance, and executes transactions with a configurable delay between them.

## Features

- Batch transfer SUI tokens from multiple wallets
- Automatic balance checking before attempting transfers
- Configurable amount and delay between transactions
- Detailed logging of transaction process and results

## Requirements

- Node.js >=16.0.0
- Sui Testnet or Mainnet account(s)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ZackyMrf/SuiSend
   cd SuiSend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Add your private keys to the `private_keys.txt` file, one key per line.

2. Edit `send.js` to configure:
   - Replace `<ReceiverAddress>` with the actual recipient address
   - Adjust `amountToSend` (in MIST, where 1 SUI = 10^9 MIST)
   - Change the `DELAY` value if needed (default: 15 seconds between transactions)
   - Update the RPC URL if you want to use mainnet or a different provider

## Usage

Run the script with:

```bash
npm start
```

The script will:
1. Read private keys from the file
2. Process each wallet sequentially with the configured delay
3. Check if each wallet has sufficient balance
4. Execute transfers for wallets with adequate funds
5. Log results and transaction digests

## Security Notice

⚠️ **IMPORTANT**: The `private_keys.txt` file contains sensitive information. Never share or commit this file to public repositories. It's already included in the `.gitignore` file to prevent accidental exposure.

## License

ISC