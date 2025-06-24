# Moralis Webhook Setup

This document explains how to set up and configure the Moralis webhook endpoint for monitoring ERC20 transfers to MetaMask Card addresses.

## Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
MORALIS_STREAM_SECRET=your_MORALIS_STREAM_SECRET_here
```

You can get this secret from your Moralis dashboard when setting up streams.

## Webhook Endpoint

The webhook endpoint is available at:
```
POST /api/v1/webhooks/moralis
```

## What the Webhook Does

1. **Signature Verification**: Validates that the webhook comes from Moralis using HMAC-SHA256
2. **ERC20 Transfer Filtering**: Only processes transfers sent TO MetaMask Card addresses
3. **Data Extraction**: Parses sender address, token address, chain, amount, and other metadata
4. **Confirmation Check**: Only processes confirmed transactions
5. **Logging**: Comprehensive logging for debugging and monitoring

## Supported Chains

- Ethereum (0x1)
- Polygon (0x89) 
- Linea Mainnet (0xe708)
- Linea Sepolia (0xe705)
- Optimism (0xa)
- Arbitrum (0xa4b1)

## MetaMask Card Addresses

The webhook monitors transfers to these addresses (defined in `src/lib/constants.ts`):
- US: `0xA90b298d05C2667dDC64e2A4e17111357c215dD2`
- International: `0x9dd23A4a0845f10d65D293776B792af1131c7B30`

## Business Logic Integration

The webhook provides TODO comments where you can add your business logic:

```typescript
// TODO: Add your business logic here
// Examples:
// - Store transfer in database
// - Calculate round-up amount  
// - Trigger savings transaction
// - Send notifications
// - Update user balances
```

## Testing

You can test the webhook endpoint by sending a GET request:
```bash
curl http://localhost:3000/api/v1/webhooks/moralis
```

## Security Features

- HMAC signature verification
- Request method validation
- Comprehensive error handling
- Input validation and sanitization 