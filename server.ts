import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './src/firebase';
import { getClobClient, removeClobClient } from './src/server/polymarket';
import { ethers } from 'ethers';
import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import { WebSocketServer, WebSocket } from 'ws';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API: Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // API: Accounts
  app.get('/api/accounts', async (req, res) => {
    try {
      const snapshot = await getDocs(collection(db, 'accounts'));
      const accounts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Hide private keys in response
      const safeAccounts = accounts.map((a: any) => ({
        id: a.id,
        name: a.name,
        address: a.address,
        createdAt: a.createdAt,
      }));
      res.json(safeAccounts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/accounts', async (req, res) => {
    try {
      const { name, privateKey } = req.body;
      const accountId = `acc_${Date.now()}`;
      
      // Derive wallet address from private key
      const wallet = new ethers.Wallet(privateKey);
      const address = wallet.address;

      // Derive CLOB API credentials
      const tempClient = new ClobClient("https://clob.polymarket.com", 137, wallet);
      const creds = await tempClient.createOrDeriveApiKey();

      const accountData = {
        name,
        address,
        privateKey,
        creds,
        createdAt: Date.now(),
      };
      await setDoc(doc(db, 'accounts', accountId), accountData);
      
      // Log the action
      await setDoc(doc(db, 'logs', `log_${Date.now()}`), {
        timestamp: Date.now(),
        type: 'info',
        message: `Account added: ${name} (${address})`
      });

      res.json({ id: accountId, ...accountData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/accounts/:id', async (req, res) => {
    try {
      await deleteDoc(doc(db, 'accounts', req.params.id));
      removeClobClient(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: Orders
  app.post('/api/orders', async (req, res) => {
    try {
      const { accountId, orders } = req.body;
      
      // Get account from DB
      const accountDoc = await getDoc(doc(db, 'accounts', accountId));
      if (!accountDoc.exists()) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      const account = accountDoc.data();
      const client = getClobClient(
        accountId,
        account.privateKey,
        account.creds.key,
        account.creds.secret,
        account.creds.passphrase
      );

      const results = [];
      for (const orderReq of orders) {
        const { market, side, price, size, type, tickSize, negRisk } = orderReq;
        
        let orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        let status = 'OPEN';
        let errorMsg = null;

        try {
          // Attempt to place the order on Polymarket
          let response;
          if (type === 'MARKET') {
            response = await client.createAndPostMarketOrder(
              {
                tokenID: market,
                amount: Number(size), // Market orders usually use amount instead of size/price, let's check the API
                side: side === 'BUY' ? Side.BUY : Side.SELL,
              },
              { 
                tickSize: tickSize || "0.001", 
                negRisk: negRisk || false 
              }
            );
          } else {
            response = await client.createAndPostOrder(
              {
                tokenID: market,
                price: Number(price),
                side: side === 'BUY' ? Side.BUY : Side.SELL,
                size: Number(size),
              },
              { 
                tickSize: tickSize || "0.001", 
                negRisk: negRisk || false 
              },
              OrderType.GTC
            );
          }
          
          if (response && response.orderID) {
            orderId = response.orderID;
          } else {
            status = 'FAILED';
            errorMsg = JSON.stringify(response);
          }
        } catch (err: any) {
          status = 'FAILED';
          errorMsg = err.message || 'Unknown error';
          console.error('Order placement failed:', err);
        }
        
        const orderData = {
          accountId,
          orderId,
          market,
          side,
          price,
          size,
          type: type || 'LIMIT',
          status,
          error: errorMsg,
          createdAt: Date.now(),
        };
        
        await setDoc(doc(db, 'orders', orderId), orderData);
        results.push(orderData);
      }

      await setDoc(doc(db, 'logs', `log_${Date.now()}`), {
        timestamp: Date.now(),
        type: 'info',
        message: `Placed ${orders.length} orders for account ${account.name}`
      });

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/orders', async (req, res) => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: Markets
  app.get('/api/markets', async (req, res) => {
    try {
      // Fetch active markets from Polymarket Gamma API
      const response = await fetch('https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=50');
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/markets/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.json([]);
      }
      // Search active markets from Polymarket Gamma API
      const response = await fetch(`https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=50&question=${encodeURIComponent(q as string)}`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // WebSocket Proxy for Polymarket CLOB
  const wss = new WebSocketServer({ server, path: '/ws/market' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket proxy');
    let polymarketWs: WebSocket | null = null;
    let isConnected = false;
    let pendingMessages: string[] = [];

    const connectToPolymarket = () => {
      polymarketWs = new WebSocket('wss://ws-subscriptions-clob.polymarket.com/ws/market');

      polymarketWs.on('open', () => {
        console.log('Connected to Polymarket CLOB WebSocket');
        isConnected = true;
        // Send any pending messages
        while (pendingMessages.length > 0) {
          const msg = pendingMessages.shift();
          if (msg) polymarketWs?.send(msg);
        }
      });

      polymarketWs.on('message', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data.toString());
        }
      });

      polymarketWs.on('close', () => {
        console.log('Polymarket CLOB WebSocket closed');
        isConnected = false;
        // Reconnect if client is still connected
        if (ws.readyState === WebSocket.OPEN) {
          setTimeout(connectToPolymarket, 1000);
        }
      });

      polymarketWs.on('error', (err) => {
        console.error('Polymarket WS Error:', err);
      });
    };

    connectToPolymarket();

    ws.on('message', (message) => {
      const msgStr = message.toString();
      if (isConnected && polymarketWs?.readyState === WebSocket.OPEN) {
        polymarketWs.send(msgStr);
      } else {
        pendingMessages.push(msgStr);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket proxy');
      if (polymarketWs) {
        polymarketWs.close();
      }
    });
  });
}

startServer();
