# 🪙 Auto HODL

**Auto HODL** is a modular monorepo project that enables users to **automatically save** USDC while spending using their **MetaMask card**. It works by **rounding up** each transaction to the nearest dollar and sending the spare change to a **savings account** — effortlessly building a crypto savings habit.

---

## 🏗️ Hackathon Demo Modes

During the [MetaMask Card hackathon](https://www.hackquest.io/hackathons/MetaMask-Card-Dev-Cook-Off) we shipped two working prototypes and sketched a third, future-ready design:

### 1. Single-chain (hackathon)

![Single-chain Mode](docs/01-mode-single-chain-hack.png)

End-to-end flow on Sepolia. Every MetaMask Card purchase is rounded-up and the difference is supplied to the Aave pool on the same chain.

### 2. Multi-chain (hackathon)

![Multi-chain Mode](docs/03-mode-multi-chain-hack.png)

At round-up time the backend finds the best Aave yield, bridges funds via **LiFi/CCTP**, and supplies on the destination chain.

### 3. Single-chain (future)

![Future Single-chain](docs/02-mode-single-chain-future.png)

Planned production upgrade:

* Use **native smart accounts** instead of explicit DTK deployment.
* Request delegated permissions with **ERC-7715**.
* Use the underlying EOA (connected to the card) as the savings source.

---

## 🚀 Features

* 💳 **MetaMask Card Integration** – track on-chain card transactions.
* 💰 **Round-up Savings** – every purchase rounds up to the nearest dollar and saves the difference.
* 🔐 **Non-custodial** – savings are stored on-chain using smart accounts.
* 🧾 **Dashboard** – view savings history and growth.
* 🌐 **Cross-chain** – find the best yield across multiple chains.

---

## 🛠️ Tech Stack

### Core Technologies
* **USDC** – all savings denominated in USDC
* **MetaMask SDK** – wallet connection and user authentication
* **MetaMask DTK** – smart accounts and delegated permissions
* **Aave** – yield generation on deposited savings
* **Circle CCTP v2** – cross-chain USDC transfers
* **LiFi** – cross-chain bridging infrastructure

### Development Stack
| Layer     | Tech                                  |
| --------- | ------------------------------------- |
| Frontend  | Next.js, Tailwind CSS, Wagmi          |
| Backend   | Next.js, Supabase, Webhooks          |
| Contracts | Solidity, Foundry                     |
| Infra     | Vercel, Supabase, Moralis             |
| Monorepo  | Turborepo, bun                        |

---

## 📦 Monorepo Structure

This project is organized as a **monorepo** to cleanly separate concerns across services and packages:

```
./
│
├── apps/
│   └── web/           # Frontend + Backend (Next.js)
│
├── packages/
│   ├── contracts/     # Smart contracts (Solidity, Foundry)
│   └── scripts/       # Automation scripts (Moralis, etc.)
│
├── .github/           # GitHub workflows (CI/CD)
├── docs/              # Documentation and diagrams
├── package.json       # Monorepo root configuration
└── README.md
```

---

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/locker-labs/auto-hodl.git
cd auto-hodl
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Variables

Create `.env` files in `apps/web` and `packages/contracts` as needed.

### 4. Dev Scripts

Run all apps in dev mode:

```bash
bun run dev
```

Build all packages and apps:

```bash
bun run build
```

Or build individually:

```bash
bun run build:contracts
bun run build:web
```

Clean all packages and apps:

```bash
bun run clean
```

---

## 🔐 Smart Contracts

The `contracts` package contains the core logic for savings:

* `SavingsVault.sol` – receives and tracks round-up deposits.
* `Registry.sol` – links users to vaults.
* Written in **Solidity**, tested using **Foundry**.

### Deploy

```bash
cd packages/contracts
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```

---

## 📈 Future Improvements

* **Native Smart Accounts** – use built-in MetaMask smart accounts instead of explicit DTK deployment
* **ERC-7715 Permissions** – request delegated permissions directly from smart accounts
* **EOA as Savings Source** – use the underlying EOA (connected to MetaMask Card) as the token source
* **Recurring Savings & Goals** – automated deposits and savings targets
* **ZK Privacy** – private savings history and transaction details

---

## 🙌 Contributing

PRs and issues are welcome! Before contributing, please:

```bash
bun run lint
bun run test
```

---

## 📄 License

MIT © 2025 [Locker Labs](https://github.com/locker-labs)