# 🪙 MetaSavings

**MetaSavings** is a modular monorepo project that enables users to **automatically save** USDC while spending using their **MetaMask card**. It works by **rounding up** each transaction to the nearest dollar and sending the spare change to a **savings account** — effortlessly building a crypto savings habit.

---

## 📦 Monorepo Structure

This project is organized as a **monorepo** to cleanly separate concerns across services and packages:

```
metasavings/
│
├── apps/
│   └── web/           # Frontend + Backend (Next.js)
│
├── packages/
│   └── contracts/     # Smart contracts (Solidity, Foundry)
│
├── .github/           # GitHub workflows (CI/CD)
├── package.json       # Monorepo root configuration (via turborepo or bun)
└── README.md
```

---

## 🚀 Features

* 💳 **MetaMask Card Integration** – track on-chain card transactions.
* 💰 **Round-up Savings** – every purchase rounds up to the nearest dollar and saves the difference.
* 🔐 **Account Vault** – savings are stored on-chain, non-custodially.
* 🧾 **Dashboard** – view savings history and growth.
* ⚡ **Modular Codebase** – frontend, backend, and smart contracts all modular and reusable.

---

## 🛠️ Tech Stack

| Layer     | Tech                                  |
| --------- | ------------------------------------- |
| Frontend  | Next.js, Tailwind CSS, Wagmi          |
| Backend   | Next.js, PostgreSQL, Prisma, Webhooks |
| Contracts | Solidity, Foundry                     |
| Infra     | Vercel, Railway, Alchemy              |
| Monorepo  | Turborepo, bun                        |

---

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/locker-labs/metasavings.git
cd metasavings
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

* Add recurring savings & goals
* Integrate ZK for private savings history
* Offer USDC and ETH vault options
* Notifications & reminders

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