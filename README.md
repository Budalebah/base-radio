# Base Radio 📻

A Farcaster Mini App for listening to Lofi radio stations and optionally pinging them on Base Sepolia.

Built with:
- **Next.js** (App Router)
- **OnchainKit** (Wallet & Transaction components)
- **Farcaster MiniApp SDK**
- **Tailwind CSS**
- **RadioBrowser API**
- **Foundry** (Smart Contracts)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy Smart Contract

Go to `contracts/` folder and deploy the contract to Base Sepolia.

```bash
cd contracts
# Set your private key/rpc first or use flags
forge build
forge create ./src/BaseRadio.sol:BaseRadio --rpc-url https://sepolia.base.org --private-key <YOUR_PRIVATE_KEY>
```

Copy the deployed contract address.

### 3. Configure App

1. Open `app/calls.ts`
2. Paste your contract address into `address` field.
3. (Optional) Get an OnchainKit API Key from Coinbase Developer Portal if needed for advanced features, though basic RPC might work. Update `app/providers.tsx` env var if you have one.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📱 Testing as Mini App

To test the Farcaster integration:

1. Use a tunneling service like `ngrok` to expose your localhost:
   ```bash
   ngrok http 3000
   ```
2. Update `app/.well-known/farcaster.json` with your ngrok URL if you are validating the manifest (though for local dev in Warpcast, you often just point to the URL).
3. Use the [Farcaster Mini App Playground](https://warpcast.com/~/developers/frames) or Warpcast Developer Tools to test the frame/app.

## 🛠 Features

- **Free Listening**: Uses HTML5 Audio and RadioBrowser API. No wallet required.
- **Onchain Ping**: Optional interaction. Connects wallet and sends a `tuneStation` transaction to Base Sepolia.

