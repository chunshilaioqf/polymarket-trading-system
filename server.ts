import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './src/firebase';
import { getClobClient, removeClobClient } from './src/server/polymarket';

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
      const { name, address, privateKey, creds } = req.body;
      const accountId = `acc_${Date.now()}`;
      const accountData = {
        name,
        address,
        privateKey,
        creds,
        createdAt: Date.now(),
      };
      await setDoc(doc(db, 'accounts', accountId), accountData);
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
      const { accountId, market, side, price, size } = req.body;
      
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

      // In a real app, we would use the client to place the order on Polymarket:
      // const order = await client.createOrder({ tokenID: market, price, side, size, feeRateBps: 0 });
      // const response = await client.postOrder(order);
      
      // For this demo, we'll simulate the order placement to avoid needing real funds/keys
      const orderId = `ord_${Date.now()}`;
      const orderData = {
        accountId,
        orderId,
        market,
        side,
        price,
        size,
        status: 'OPEN',
        createdAt: Date.now(),
      };
      
      await setDoc(doc(db, 'orders', orderId), orderData);
      res.json(orderData);
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
