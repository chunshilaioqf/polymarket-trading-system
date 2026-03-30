# PolyMicro - Polymarket Trading Microservice

PolyMicro is a high-performance, scalable, and maintainable enterprise-grade Polymarket automated trading platform. It serves as a comprehensive solution integrating account management, real-time state synchronization, and visual management for Polymarket trading.

## Features

- **Multi-Account Management**: Securely add and manage multiple Polymarket accounts. The system automatically derives wallet addresses and CLOB API credentials from your private key.
- **Real-time Dashboard**: Monitor active accounts, open orders, and system logs in real-time. View derived wallet addresses with a convenient one-click copy button for easy funding.
- **Dual Database Support**: Flexible database architecture supporting both **Firebase Firestore** and **MongoDB**. Easily switch between them using environment variables.
- **Advanced Market Explorer**: Browse and search active markets locally, with an online search fallback directly querying the Polymarket Gamma API.
- **Real-time Order Book & Market Details**: View live order books (bids/asks) powered by a robust backend WebSocket proxy. Market details include the full question, description, and end date.
- **Smart Quick Trade**: Place Market or Limit orders, and execute batch orders. Click on any price in the live order book to automatically populate the price field in your trade form.
- **Customizable UI**: Supports English and Chinese languages, along with Light, Dark, and System-following themes.
- **Secure Architecture**: Private keys are handled securely and never exposed in API responses.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose) & Firebase Firestore
- **SDK**: `@polymarket/clob-client`, `ethers`
- **Real-time**: Native WebSockets (Frontend) & `ws` (Backend Proxy)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance OR Firebase Project (Firestore enabled)
- Polymarket Account (Private Key)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables by copying `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure your database preference:
   ```env
   # Options: firebase, mongodb
   DATABASE_TYPE=mongodb
   # Required if DATABASE_TYPE=mongodb
   MONGODB_URI=mongodb://localhost:27017/polymarket-bot
   ```

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
2. **Find a Market**: Go to the "Markets" tab to browse active markets or use the online search. Click "Trade" on a market to pre-fill the Quick Trade form.
3. **Analyze & Trade**: In the "Dashboard" tab, review the selected market's details and live order book. Click on any bid/ask price to auto-fill your order price, then place your Market or Limit orders.
4. **Monitor**: View your open orders, active accounts (with copyable wallet addresses), and real-time system logs in their respective sections.

## Disclaimer

This software is for educational and informational purposes only. Do not trade with money you cannot afford to lose. The developers are not responsible for any financial losses incurred while using this software.

## License

MIT License
