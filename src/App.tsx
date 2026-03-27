import React, { useState, useEffect } from 'react';
import { Activity, Wallet, BarChart3, Settings, Plus, Trash2 } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Form state
  const [newAccount, setNewAccount] = useState({
    name: '',
    address: '',
    privateKey: '',
    key: '',
    secret: '',
    passphrase: ''
  });

  useEffect(() => {
    // Real-time listener for accounts
    const unsubscribeAccounts = onSnapshot(collection(db, 'accounts'), (snapshot) => {
      const accs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccounts(accs);
    });

    // Real-time listener for orders
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ords);
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeOrders();
    };
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccount.name,
          address: newAccount.address,
          privateKey: newAccount.privateKey,
          creds: {
            key: newAccount.key,
            secret: newAccount.secret,
            passphrase: newAccount.passphrase
          }
        })
      });
      if (response.ok) {
        setIsAddingAccount(false);
        setNewAccount({ name: '', address: '', privateKey: '', key: '', secret: '', passphrase: '' });
      }
    } catch (error) {
      console.error('Failed to add account', error);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete account', error);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accounts.length === 0) return alert('Please add an account first');
    
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: accounts[0].id,
          market: '0x1234567890abcdef', // Mock market ID
          side: 'BUY',
          price: 0.5,
          size: 100
        })
      });
    } catch (error) {
      console.error('Failed to place order', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            PolyMicro
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Trading Microservice</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'accounts' ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <Wallet className="w-4 h-4" />
            Accounts
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="pl-64">
        <header className="h-16 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur flex items-center px-8">
          <h2 className="text-lg font-medium capitalize">{activeTab}</h2>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <p className="text-sm text-neutral-400 font-medium">Active Accounts</p>
                  <p className="text-3xl font-bold mt-2">{accounts.length}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <p className="text-sm text-neutral-400 font-medium">Open Orders</p>
                  <p className="text-3xl font-bold mt-2">{orders.filter(o => o.status === 'OPEN').length}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <p className="text-sm text-neutral-400 font-medium">Total Volume</p>
                  <p className="text-3xl font-bold mt-2">$0.00</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4">Quick Trade (Simulation)</h3>
                <form onSubmit={handlePlaceOrder} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-500 mb-1">Market ID</label>
                    <input type="text" disabled value="0x1234567890abcdef" className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-400" />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-neutral-500 mb-1">Side</label>
                    <select className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm">
                      <option>BUY</option>
                      <option>SELL</option>
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-neutral-500 mb-1">Price</label>
                    <input type="number" defaultValue={0.5} step="0.01" className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-neutral-500 mb-1">Size</label>
                    <input type="number" defaultValue={100} className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
                    Place Order
                  </button>
                </form>
              </div>

              {/* Recent Orders */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-800">
                  <h3 className="text-lg font-medium">Recent Orders</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-950 text-neutral-400">
                    <tr>
                      <th className="px-6 py-3 font-medium">Order ID</th>
                      <th className="px-6 py-3 font-medium">Market</th>
                      <th className="px-6 py-3 font-medium">Side</th>
                      <th className="px-6 py-3 font-medium">Price</th>
                      <th className="px-6 py-3 font-medium">Size</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No orders found</td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-neutral-800/50">
                          <td className="px-6 py-4 font-mono text-xs text-neutral-400">{order.orderId}</td>
                          <td className="px-6 py-4 font-mono text-xs">{order.market.substring(0, 10)}...</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.side === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {order.side}
                            </span>
                          </td>
                          <td className="px-6 py-4">${order.price.toFixed(2)}</td>
                          <td className="px-6 py-4">{order.size}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Managed Accounts</h3>
                <button 
                  onClick={() => setIsAddingAccount(!isAddingAccount)}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Account
                </button>
              </div>

              {isAddingAccount && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h4 className="text-md font-medium mb-4">New Polymarket Account</h4>
                  <form onSubmit={handleAddAccount} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Account Name</label>
                        <input required type="text" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm" placeholder="e.g. Main Trading Bot" />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Wallet Address</label>
                        <input required type="text" value={newAccount.address} onChange={e => setNewAccount({...newAccount, address: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm font-mono" placeholder="0x..." />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-neutral-500 mb-1">Private Key (Encrypted at rest)</label>
                        <input required type="password" value={newAccount.privateKey} onChange={e => setNewAccount({...newAccount, privateKey: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm font-mono" placeholder="0x..." />
                      </div>
                      <div className="col-span-2 border-t border-neutral-800 pt-4 mt-2">
                        <h5 className="text-sm font-medium mb-3">CLOB API Credentials</h5>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">API Key</label>
                        <input required type="text" value={newAccount.key} onChange={e => setNewAccount({...newAccount, key: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">API Secret</label>
                        <input required type="password" value={newAccount.secret} onChange={e => setNewAccount({...newAccount, secret: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm font-mono" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-neutral-500 mb-1">Passphrase</label>
                        <input required type="password" value={newAccount.passphrase} onChange={e => setNewAccount({...newAccount, passphrase: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm font-mono" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setIsAddingAccount(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white">Cancel</button>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">Save Account</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map(account => (
                  <div key={account.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative group">
                    <button 
                      onClick={() => handleDeleteAccount(account.id)}
                      className="absolute top-4 right-4 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{account.name}</h4>
                        <p className="text-xs text-neutral-500 font-mono">{account.address.substring(0, 6)}...{account.address.substring(38)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-neutral-800 pt-4">
                      <span className="text-neutral-500">Status</span>
                      <span className="flex items-center gap-1 text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Active
                      </span>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && !isAddingAccount && (
                  <div className="col-span-2 text-center py-12 border border-dashed border-neutral-800 rounded-xl text-neutral-500">
                    No accounts configured. Add one to start trading.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

