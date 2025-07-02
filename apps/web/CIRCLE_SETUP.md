# Circle Modular Wallet Setup Guide

This guide walks you through setting up Circle Modular Wallets with RainbowKit on Ethereum.

## Overview

This project demonstrates how to integrate Circle's Modular Wallets with RainbowKit to create smart contract accounts that can perform gasless transactions on Ethereum. Instead of using passkeys or WebAuthn, this implementation uses your connected wallet (via RainbowKit) as the signer for the Circle Smart Account.

## Why Ethereum?

Ethereum offers several advantages for this implementation:

- **🔒 Security**: The most battle-tested and secure blockchain network
- **🌐 Ecosystem**: Largest DeFi ecosystem with thousands of dApps
- **🏗️ Developer Tools**: Best-in-class tooling and infrastructure
- **💰 Gas Station Support**: Circle's Gas Station supports gasless transactions on Ethereum
- **🧪 Robust Testnet**: Sepolia provides a reliable testing environment

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (version 18 or higher)
2. **Circle Developer Account** - Sign up at [Circle Developer Console](https://console.circle.com/)
3. **WalletConnect Project ID** - Get one from [WalletConnect Cloud](https://cloud.walletconnect.com/)
4. **Ethereum Wallet** - MetaMask, Coinbase Wallet, or any wallet supported by RainbowKit

## Step 1: Circle Developer Console Setup

1. **Create a Circle Account**
   - Go to [Circle Developer Console](https://console.circle.com/)
   - Sign up for a developer account
   - Complete the verification process

2. **Create a New Project**
   - Click "Create Project"
   - Choose "Modular Wallets"
   - Select "Ethereum" as your blockchain

3. **Configure Project Settings**
   - Choose "Ethereum Sepolia" for testing
   - Enable "Gas Station" for gasless transactions
   - Set up your project name and description

4. **Get Your Credentials**
   - Copy your **Client URL** (e.g., `https://modular-sdk.circle.com/v1/rpc/w3s/buidl`)
   - Copy your **Client Key** (starts with `TEST_API_KEY:`)
   - **Important**: Use the exact URL provided by Circle - do not modify it

## Step 2: WalletConnect Setup

1. **Create a WalletConnect Project**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID

## Step 3: Environment Configuration

1. **Copy the Environment File**
   ```bash
   cp env.example .env
   ```

2. **Update Environment Variables**
   ```bash
   # Circle API Configuration
   NEXT_PUBLIC_CIRCLE_CLIENT_URL=https://modular-sdk.circle.com/v1/rpc/w3s/buidl
   NEXT_PUBLIC_CIRCLE_CLIENT_KEY=TEST_API_KEY:your_actual_key_here
   
   # WalletConnect Configuration
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   
   # Enable testnets (set to 'true' for development)
   NEXT_PUBLIC_ENABLE_TESTNETS=true
   ```

   **⚠️ Important Notes:**
   - Replace `your_actual_key_here` with your actual Circle API key
   - Replace `your_walletconnect_project_id` with your WalletConnect project ID
   - Use the exact Circle Client URL from your Circle console - don't modify it
   - The Circle SDK will automatically append the correct paths (like `/sepolia`)

## Step 4: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 5: Run the Application

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Architecture Overview

1. **RainbowKit Integration**: Provides wallet connection UI and management
2. **Wagmi Configuration**: Handles wallet connections and Ethereum interactions
3. **Circle Smart Account**: Creates a smart contract account controlled by your wallet
4. **Gas Station**: Enables gasless transactions through Circle's infrastructure

### User Flow

1. **Connect Wallet**: User connects their wallet using RainbowKit
2. **Create Smart Account**: User creates a Circle Smart Account using their connected wallet as the signer
3. **Send Transactions**: User can send gasless transactions through the smart account
4. **Gas Sponsorship**: Circle's Gas Station sponsors the gas fees

### Key Components

- **`src/wagmi.ts`**: Wagmi configuration with Ethereum mainnet and Sepolia
- **`src/lib/circle.ts`**: Circle SDK integration and smart account creation
- **`src/components/CircleWallet.tsx`**: React component for Circle wallet interaction
- **`src/pages/index.tsx`**: Main application page with RainbowKit integration

## Network Configuration

The application is configured for:

- **Mainnet**: Ethereum mainnet for production
- **Testnet**: Ethereum Sepolia for testing

### Manual Network Addition

If Ethereum Sepolia doesn't appear in your wallet, add it manually:

**Ethereum Sepolia Testnet**
- Network Name: `Ethereum Sepolia`
- RPC URL: `https://sepolia.infura.io/v3/your-key` or `https://rpc.sepolia.org`
- Chain ID: `11155111`
- Currency Symbol: `ETH`
- Block Explorer: `https://sepolia.etherscan.io`

## Getting Test ETH

For testing on Sepolia, you'll need test ETH:

1. **Sepolia Faucet Options**:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

2. **Requirements**:
   - Most faucets require social media verification
   - Some require a small amount of mainnet ETH
   - Follow the faucet instructions to receive test ETH

## Testing the Integration

1. **Connect Your Wallet**
   - Use RainbowKit to connect your preferred wallet
   - Ensure you're on Ethereum Sepolia testnet

2. **Create Smart Account**
   - Click "Create Circle Smart Account"
   - Your wallet will be used as the signer
   - The smart account address will be displayed

3. **Send Test Transaction**
   - Click "Send Test Transaction (Gasless)"
   - The transaction will be sponsored by Circle's Gas Station
   - No gas fees will be deducted from your wallet

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Verify your Circle API key is correct
   - Ensure you're using the key for the correct environment (testnet/mainnet)
   - Check that the key starts with `TEST_API_KEY:` for testnet

2. **"Network Not Supported" Error**
   - Ensure Ethereum Sepolia is added to your wallet
   - Check that your wallet is connected to the correct network
   - Verify the Chain ID is `11155111` for Sepolia

3. **"Insufficient Funds" Error**
   - Get test ETH from a Sepolia faucet
   - Ensure your wallet has enough ETH for the transaction
   - Remember that gas fees should be sponsored by Circle

4. **"Client URL Invalid" Error**
   - Use the exact URL provided by Circle Developer Console
   - Don't add or remove any paths from the URL
   - The Circle SDK handles path construction automatically

5. **Smart Account Creation Fails**
   - Check your Circle project configuration
   - Ensure Gas Station is enabled in your Circle project
   - Verify your API key permissions

### Debug Steps

1. **Check Console Logs**
   - Open browser developer tools
   - Look for error messages in the console
   - Circle SDK provides detailed error information

2. **Verify Environment Variables**
   - Ensure all required environment variables are set
   - Check for typos in variable names
   - Restart the development server after changes

3. **Test API Connection**
   - Verify your Circle API key works
   - Check Circle Developer Console for API usage
   - Ensure your project is active

## Advanced Configuration

### Custom RPC Endpoints

You can use custom RPC endpoints by modifying `src/wagmi.ts`:

```typescript
import { http } from 'viem';

export const config = getDefaultConfig({
  // ... other config
  transports: {
    [mainnet.id]: http('https://your-custom-mainnet-rpc'),
    [sepolia.id]: http('https://your-custom-sepolia-rpc'),
  },
});
```

### Gas Station Configuration

Circle's Gas Station automatically sponsors transactions. For custom gas policies:

1. Configure gas policies in Circle Developer Console
2. Set spending limits and rules
3. Monitor usage through the console dashboard

## Production Deployment

### Environment Variables for Production

```bash
# Use mainnet configuration
NEXT_PUBLIC_CIRCLE_CLIENT_URL=https://modular-sdk.circle.com/v1/rpc/w3s/your-production-url
NEXT_PUBLIC_CIRCLE_CLIENT_KEY=LIVE_API_KEY:your_production_key

# Disable testnets
NEXT_PUBLIC_ENABLE_TESTNETS=false
```

### Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables for all sensitive data
   - Rotate API keys regularly

2. **Domain Restrictions**
   - Configure allowed domains in Circle Developer Console
   - Restrict API key usage to specific domains
   - Use CORS policies appropriately

3. **Rate Limiting**
   - Implement rate limiting for API calls
   - Monitor API usage through Circle console
   - Set up alerts for unusual activity

## Resources

- [Circle Modular Wallets Documentation](https://developers.circle.com/w3s/modular-wallets-web-sdk)
- [RainbowKit Documentation](https://rainbowkit.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [Viem Account Abstraction](https://viem.sh/account-abstraction)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Circle Developer Console for error messages
3. Check the [Circle Developer Discord](https://discord.gg/buildoncircle)
4. Review the [RainbowKit GitHub Issues](https://github.com/rainbow-me/rainbowkit/issues)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 