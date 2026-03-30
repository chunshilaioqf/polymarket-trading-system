import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, query, orderBy, limit } from 'firebase/firestore';
import { db as firebaseDb } from '../firebase';
import mongoose from 'mongoose';

export interface Account {
  id: string;
  name: string;
  address: string;
  privateKey: string;
  creds: any;
  createdAt: number;
}

export interface Order {
  id: string;
  accountId: string;
  market: string;
  side: string;
  price: number;
  size: number;
  status: string;
  error?: string;
  createdAt: number;
}

export interface Log {
  id: string;
  timestamp: number;
  type: string;
  message: string;
}

export interface Database {
  getAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | null>;
  addAccount(account: Account): Promise<void>;
  deleteAccount(id: string): Promise<void>;
  
  getOrders(): Promise<Order[]>;
  addOrder(order: Order): Promise<void>;
  
  getLogs(): Promise<Log[]>;
  addLog(log: Omit<Log, 'id'>): Promise<void>;
}

// MongoDB Schemas
const accountSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  address: String,
  privateKey: String,
  creds: mongoose.Schema.Types.Mixed,
  createdAt: Number
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  accountId: String,
  market: String,
  side: String,
  price: Number,
  size: Number,
  status: String,
  error: String,
  createdAt: Number
});

const logSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: Number,
  type: String,
  message: String
});

let MongoAccount: mongoose.Model<any>;
let MongoOrder: mongoose.Model<any>;
let MongoLog: mongoose.Model<any>;

class MongoDatabase implements Database {
  constructor() {
    MongoAccount = mongoose.models.Account || mongoose.model('Account', accountSchema);
    MongoOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);
    MongoLog = mongoose.models.Log || mongoose.model('Log', logSchema);
  }

  async getAccounts(): Promise<Account[]> {
    const docs = await MongoAccount.find().lean();
    return docs.map((d: any) => ({ ...d, _id: undefined, __v: undefined }));
  }
  async getAccount(id: string): Promise<Account | null> {
    const doc = await MongoAccount.findOne({ id }).lean();
    return doc ? { ...doc, _id: undefined, __v: undefined } as Account : null;
  }
  async addAccount(account: Account): Promise<void> {
    await MongoAccount.create(account);
  }
  async deleteAccount(id: string): Promise<void> {
    await MongoAccount.deleteOne({ id });
  }
  
  async getOrders(): Promise<Order[]> {
    const docs = await MongoOrder.find().sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({ ...d, _id: undefined, __v: undefined }));
  }
  async addOrder(order: Order): Promise<void> {
    await MongoOrder.create(order);
  }
  
  async getLogs(): Promise<Log[]> {
    const docs = await MongoLog.find().sort({ timestamp: -1 }).limit(50).lean();
    return docs.map((d: any) => ({ ...d, _id: undefined, __v: undefined }));
  }
  async addLog(log: Omit<Log, 'id'>): Promise<void> {
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await MongoLog.create({ ...log, id });
  }
}

class FirebaseDatabase implements Database {
  async getAccounts(): Promise<Account[]> {
    const snapshot = await getDocs(collection(firebaseDb, 'accounts'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Account));
  }
  async getAccount(id: string): Promise<Account | null> {
    const docSnap = await getDoc(doc(firebaseDb, 'accounts', id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Account : null;
  }
  async addAccount(account: Account): Promise<void> {
    await setDoc(doc(firebaseDb, 'accounts', account.id), account);
  }
  async deleteAccount(id: string): Promise<void> {
    await deleteDoc(doc(firebaseDb, 'accounts', id));
  }
  
  async getOrders(): Promise<Order[]> {
    const q = query(collection(firebaseDb, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  }
  async addOrder(order: Order): Promise<void> {
    await setDoc(doc(firebaseDb, 'orders', order.id), order);
  }
  
  async getLogs(): Promise<Log[]> {
    const q = query(collection(firebaseDb, 'logs'), orderBy('timestamp', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Log));
  }
  async addLog(log: Omit<Log, 'id'>): Promise<void> {
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await setDoc(doc(firebaseDb, 'logs', id), { ...log, id });
  }
}

let dbInstance: Database;

export async function initDb() {
  if (dbInstance) return dbInstance;
  
  const dbType = process.env.DATABASE_TYPE || 'firebase';
  
  if (dbType === 'mongodb') {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is required when DATABASE_TYPE is mongodb');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    dbInstance = new MongoDatabase();
  } else {
    console.log('Using Firebase Firestore');
    dbInstance = new FirebaseDatabase();
  }
  
  return dbInstance;
}

export function getDb(): Database {
  if (!dbInstance) throw new Error('Database not initialized');
  return dbInstance;
}
