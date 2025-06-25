# Scripts

This package contains various scripts for interacting with Aave and testing MetaMask Delegation Toolkit (DTK) functionality.

## Installation

To install dependencies:

```bash
bun install
```

## Scripts Overview

### 🏦 Aave Integration Scripts

#### `vanilla-aave.ts`
Direct Aave deposit script that deposits AAVE tokens into Aave's static token vault.
- Uses your EOA directly (no delegation)
- Handles USDC saturation by using AAVE tokens instead
- Includes comprehensive balance and capacity checks
- Automatically handles approval and deposit flow

```bash
bun run vanilla-aave.ts
```

#### `check-aave-caps.ts`
Utility script to check supply caps and utilization for all assets on Sepolia Aave.
- Shows which assets are saturated vs available
- Displays supply caps, current utilization, and available capacity
- Helps identify which tokens to use for testing

```bash
bun run check-aave-caps.ts
```

### 🔗 Delegation Scripts (MetaMask DTK)

#### `delegate-to-aave.ts`
Main delegation script with multiple variants for testing DTK functionality.
- **ETH Transfer**: Sends 1 wei ETH to target address
- **ERC20 Transfer**: Transfers 1 ERC20 token to target address  
- **Aave Approval**: Approves 1 AAVE token to Aave vault (recommended)

The script creates a smart account, sets up delegation from Account 1 (owner) to Account 2 (delegate), then redeems the delegation to perform the specified action.

```bash
bun run delegate-to-aave.ts
```

**Current default**: Aave approval variant (`mainAave()`)

#### `check-aave-balance.ts`
Balance checker for smart accounts created by the delegation scripts.
- Verifies delegation worked by checking allowances and balances
- Shows AAVE token balance, vault allowances, and vault shares
- Provides analysis of delegation success/failure

```bash
bun run check-aave-balance.ts
```

### 📋 Recommended Delegation Workflow

1. **Run delegation script**:
   ```bash
   bun run delegate-to-aave.ts
   ```

2. **Verify results**:
   ```bash
   bun run check-aave-balance.ts
   ```

3. **Check market conditions** (optional):
   ```bash
   bun run check-aave-caps.ts
   ```

### ⚙️ Configuration

All scripts use environment variables from `.env.delegate`:
- `RPC_URL` - Sepolia RPC endpoint
- `PRIVATE_KEY_DELEGATOR` - Account 1 (smart account owner)
- `PRIVATE_KEY_DELEGATE` - Account 2 (delegate)
- `PIMLICO_API_KEY` - For account abstraction
- `ERC20_ADDRESS` - For ERC20 transfer variant (optional)

### 🎯 Key Addresses (Sepolia)

- **AAVE Token**: `0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a`
- **Aave Vault**: `0x56771cEF0cb422e125564CcCC98BB05fdc718E77`
- **Target Address**: `0xf46A02660F466dA0BfD558A02a53FD891Fb33A44`

### 🔍 Troubleshooting

- **"Supply cap exceeded"**: Use `check-aave-caps.ts` to find available assets
- **"Insufficient balance"**: Check your EOA has enough tokens/ETH
- **"Delegation failed"**: Use `check-aave-balance.ts` to verify smart account state
- **Smart account not deployed**: Normal - deploys on first transaction

---

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
