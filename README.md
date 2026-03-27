# PolyMicro - Polymarket Trading Microservice

PolyMicro is a high-performance, scalable, and maintainable enterprise-grade Polymarket automated trading platform. It serves as a comprehensive solution integrating account management, real-time state synchronization, and visual management for Polymarket trading.

## Features

- **Multi-Account Management**: Securely add and manage multiple Polymarket accounts. The system automatically derives wallet addresses and CLOB API credentials from your private key.
- **Real-time Dashboard**: Monitor active accounts, open orders, and system logs in real-time.
- **Batch Order Placement**: Place multiple limit orders simultaneously or execute quick market orders.
- **Market Explorer**: Browse and search active markets directly from the Polymarket Gamma API. Select a market to automatically populate the trading form with the correct `tokenID`, `tickSize`, and `negRisk`.
- **Customizable UI**: Supports English and Chinese languages, along with Light, Dark, and System-following themes.
- **Secure Architecture**: Private keys are handled securely and never exposed in API responses.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore (Real-time sync & persistence)
- **SDK**: `@polymarket/clob-client`, `ethers`

## Getting Started

### Prerequisites

- Node.js (v18+)
- Firebase Project (Firestore enabled)
- Polymarket Account (Private Key)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables. Ensure you have your Firebase configuration and Gemini API key (if applicable) set up in your `.env` or `firebase-applet-config.json` file.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Usage

1. **Add an Account**: Navigate to the "Accounts" tab. Click "Add Account", provide a name and your wallet's private key. The system will automatically derive your Polymarket CLOB API credentials.
2. **Find a Market**: Go to the "Markets" tab to browse active markets. Click "Trade" on a market to pre-fill the Quick Trade form.
3. **Place Orders**: In the "Dashboard" tab, use the Quick Trade section to place Market or Limit orders. You can add multiple rows for batch limit orders.
4. **Monitor**: View your open orders and real-time system logs in their respective sections.

## Disclaimer

This software is for educational and informational purposes only. Do not trade with money you cannot afford to lose. The developers are not responsible for any financial losses incurred while using this software.

## License

MIT License
