import React, { useState, useEffect } from 'react';
import { Activity, Wallet, BarChart3, Settings, Plus, Trash2, Terminal, Search, Globe, Moon, Sun, Monitor } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

const translations = {
  en: {
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    settings: 'Settings',
    logs: 'Logs',
    markets: 'Markets',
    activeAccounts: 'Active Accounts',
    openOrders: 'Open Orders',
    totalVolume: 'Total Volume',
    quickTrade: 'Quick Trade',
    marketId: 'Market ID',
    side: 'Side',
    price: 'Price',
    size: 'Size',
    placeOrder: 'Place Order',
    recentOrders: 'Recent Orders',
    orderId: 'Order ID',
    status: 'Status',
    managedAccounts: 'Managed Accounts',
    addAccount: 'Add Account',
    accountName: 'Account Name',
    walletAddress: 'Wallet Address',
    privateKey: 'Private Key',
    saveAccount: 'Save Account',
    cancel: 'Cancel',
    theme: 'Theme',
    language: 'Language',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    searchMarkets: 'Search Markets...',
    batchOrders: 'Batch Orders',
    addOrder: 'Add Order',
    orderType: 'Order Type',
    market: 'Market',
    limit: 'Limit',
  },
  zh: {
    dashboard: '仪表盘',
    accounts: '账户管理',
    settings: '系统设置',
    logs: '运行日志',
    markets: '市场信息',
    activeAccounts: '活跃账户',
    openOrders: '当前挂单',
    totalVolume: '总交易量',
    quickTrade: '快速交易',
    marketId: '市场 ID',
    side: '方向',
    price: '价格',
    size: '数量',
    placeOrder: '提交订单',
    recentOrders: '最近订单',
    orderId: '订单 ID',
    status: '状态',
    managedAccounts: '已管理账户',
    addAccount: '添加账户',
    accountName: '账户名称',
    walletAddress: '钱包地址',
    privateKey: '私钥',
    saveAccount: '保存账户',
    cancel: '取消',
    theme: '主题设置',
    language: '语言设置',
    system: '跟随系统',
    light: '浅色模式',
    dark: '深色模式',
    searchMarkets: '搜索市场...',
    batchOrders: '批量下单',
    addOrder: '添加订单',
    orderType: '订单类型',
    market: '市价',
    limit: '限价',
  }
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'zh'>(() => {
    return (localStorage.getItem('lang') as 'en' | 'zh') || 'en';
  });
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light' | 'system') || 'system';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  const t = translations[lang];

  const [accounts, setAccounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Form state
  const [newAccount, setNewAccount] = useState({ name: '', privateKey: '' });
  
  // Trade state
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [batchOrders, setBatchOrders] = useState([{ market: '', side: 'BUY', price: 0.5, size: 100, tickSize: '0.001', negRisk: false }]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    const unsubscribeAccounts = onSnapshot(collection(db, 'accounts'), (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const logsQuery = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeOrders();
      unsubscribeLogs();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'markets' && markets.length === 0) {
      fetch('/api/markets')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMarkets(data);
          } else if (data && Array.isArray(data.events)) {
            setMarkets(data.events);
          } else if (data && Array.isArray(data.data)) {
             setMarkets(data.data);
          } else {
            setMarkets(data || []);
          }
        })
        .catch(err => console.error('Failed to fetch markets', err));
    }
  }, [activeTab]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccount.name,
          privateKey: newAccount.privateKey,
        })
      });
      if (response.ok) {
        setIsAddingAccount(false);
        setNewAccount({ name: '', privateKey: '' });
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
          orders: batchOrders.map(o => ({ ...o, type: orderType.toUpperCase() }))
        })
      });
      alert('Orders placed successfully!');
    } catch (error) {
      console.error('Failed to place order', error);
    }
  };

  const addBatchRow = () => {
    setBatchOrders([...batchOrders, { market: '', side: 'BUY', price: 0.5, size: 100, tickSize: '0.001', negRisk: false }]);
  };

  const updateBatchRow = (index: number, field: string, value: any) => {
    const newOrders = [...batchOrders];
    newOrders[index] = { ...newOrders[index], [field]: value };
    setBatchOrders(newOrders);
  };

  const removeBatchRow = (index: number) => {
    const newOrders = [...batchOrders];
    newOrders.splice(index, 1);
    setBatchOrders(newOrders);
  };

  const selectMarketForTrade = (market: any) => {
    let tokenId = market.id;
    if (market.clobTokenIds) {
      try {
        const parsed = JSON.parse(market.clobTokenIds);
        if (parsed && parsed.length > 0) tokenId = parsed[0];
      } catch (e) {}
    }
    setBatchOrders([{ 
      market: tokenId, 
      side: 'BUY', 
      price: 0.5, 
      size: 100,
      tickSize: market.orderPriceMinTickSize?.toString() || '0.001',
      negRisk: market.negRisk || false
    }]);
    setActiveTab('dashboard');
  };

  const filteredMarkets = markets.filter(m => 
    (m.question || m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <img src="/logo.svg" alt="PolyMicro Logo" className="w-8 h-8" referrerPolicy="no-referrer" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">PolyMicro</h1>
            <p className="text-xs text-neutral-500">Trading Microservice</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: BarChart3, label: t.dashboard },
            { id: 'markets', icon: Globe, label: t.markets },
            { id: 'accounts', icon: Wallet, label: t.accounts },
            { id: 'logs', icon: Terminal, label: t.logs },
            { id: 'settings', icon: Settings, label: t.settings },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="pl-64">
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 backdrop-blur flex items-center px-8">
          <h2 className="text-lg font-medium capitalize">{t[activeTab as keyof typeof t] || activeTab}</h2>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t.activeAccounts}</p>
                  <p className="text-3xl font-bold mt-2">{accounts.length}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t.openOrders}</p>
                  <p className="text-3xl font-bold mt-2">{orders.filter(o => o.status === 'OPEN').length}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t.totalVolume}</p>
                  <p className="text-3xl font-bold mt-2">$0.00</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{t.quickTrade}</h3>
                  <div className="flex bg-neutral-200 dark:bg-neutral-800 rounded-lg p-1">
                    <button onClick={() => { setOrderType('market'); setBatchOrders([batchOrders[0]]); }} className={`px-3 py-1 text-xs font-medium rounded-md ${orderType === 'market' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>{t.market}</button>
                    <button onClick={() => setOrderType('limit')} className={`px-3 py-1 text-xs font-medium rounded-md ${orderType === 'limit' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>{t.limit}</button>
                  </div>
                </div>
                
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  {batchOrders.map((order, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-xs text-neutral-500 mb-1">{t.marketId}</label>
                        <input type="text" required value={order.market} onChange={(e) => updateBatchRow(index, 'market', e.target.value)} className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-2 text-sm" placeholder="0x..." />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-neutral-500 mb-1">{t.side}</label>
                        <select value={order.side} onChange={(e) => updateBatchRow(index, 'side', e.target.value)} className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-2 text-sm">
                          <option>BUY</option>
                          <option>SELL</option>
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-neutral-500 mb-1">{t.price}</label>
                        <input type="number" disabled={orderType === 'market'} value={orderType === 'market' ? '' : order.price} onChange={(e) => updateBatchRow(index, 'price', parseFloat(e.target.value))} step="0.01" className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-2 text-sm disabled:opacity-50" />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-neutral-500 mb-1">{t.size}</label>
                        <input type="number" required value={order.size} onChange={(e) => updateBatchRow(index, 'size', parseFloat(e.target.value))} className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-2 text-sm" />
                      </div>
                      {orderType === 'limit' && batchOrders.length > 1 && (
                        <button type="button" onClick={() => removeBatchRow(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md mb-[2px]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-2">
                    {orderType === 'limit' ? (
                      <button type="button" onClick={addBatchRow} className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                        <Plus className="w-4 h-4" /> {t.addOrder}
                      </button>
                    ) : <div></div>}
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
                      {t.placeOrder}
                    </button>
                  </div>
                </form>
              </div>

              {/* Recent Orders */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-lg font-medium">{t.recentOrders}</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400">
                    <tr>
                      <th className="px-6 py-3 font-medium">{t.orderId}</th>
                      <th className="px-6 py-3 font-medium">{t.market}</th>
                      <th className="px-6 py-3 font-medium">{t.side}</th>
                      <th className="px-6 py-3 font-medium">{t.price}</th>
                      <th className="px-6 py-3 font-medium">{t.size}</th>
                      <th className="px-6 py-3 font-medium">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No orders found</td>
                      </tr>
                    ) : (
                      orders.slice(0, 10).map(order => (
                        <tr key={order.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800/50">
                          <td className="px-6 py-4 font-mono text-xs text-neutral-500">{order.orderId}</td>
                          <td className="px-6 py-4 font-mono text-xs">{order.market.substring(0, 10)}...</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.side === 'BUY' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                              {order.side}
                            </span>
                          </td>
                          <td className="px-6 py-4">${order.price.toFixed(2)}</td>
                          <td className="px-6 py-4">{order.size}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
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

          {activeTab === 'markets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder={t.searchMarkets}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMarkets.slice(0, 24).map((market: any) => (
                  <div key={market.id} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 flex flex-col">
                    <h4 className="font-medium text-sm line-clamp-2 mb-2">{market.question || market.title}</h4>
                    <p className="text-xs text-neutral-500 font-mono mb-4 break-all">{market.id}</p>
                    <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
                      <button 
                        onClick={() => selectMarketForTrade(market)}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-500 transition-colors"
                      >
                        Trade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t.managedAccounts}</h3>
                <button 
                  onClick={() => setIsAddingAccount(!isAddingAccount)}
                  className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t.addAccount}
                </button>
              </div>

              {isAddingAccount && (
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                  <h4 className="text-md font-medium mb-4">{t.addAccount}</h4>
                  <form onSubmit={handleAddAccount} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">{t.accountName}</label>
                        <input required type="text" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-2 text-sm" placeholder="e.g. Main Trading Bot" />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">{t.privateKey}</label>
                        <input required type="password" value={newAccount.privateKey} onChange={e => setNewAccount({...newAccount, privateKey: e.target.value})} className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-2 text-sm font-mono" placeholder="0x..." />
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500">CLOB API credentials and wallet address will be automatically derived from the private key.</p>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setIsAddingAccount(false)} className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">{t.cancel}</button>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">{t.saveAccount}</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map(account => (
                  <div key={account.id} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 relative group">
                    <button 
                      onClick={() => handleDeleteAccount(account.id)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{account.name}</h4>
                        <p className="text-xs text-neutral-500 font-mono">{account.address}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-neutral-200 dark:border-neutral-800 pt-4">
                      <span className="text-neutral-500">Status</span>
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden font-mono text-sm">
              <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
                <span className="text-neutral-400">System Logs</span>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
              </div>
              <div className="p-4 h-[600px] overflow-y-auto space-y-2">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-4">
                    <span className="text-neutral-500 shrink-0">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                    </span>
                    <span className={`shrink-0 ${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-blue-400'}`}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-neutral-300 break-all">{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && <div className="text-neutral-600">No logs available.</div>}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-medium mb-6">{t.settings}</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.language}</label>
                    <div className="flex gap-3">
                      <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-md text-sm font-medium border ${lang === 'en' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>English</button>
                      <button onClick={() => setLang('zh')} className={`px-4 py-2 rounded-md text-sm font-medium border ${lang === 'zh' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>中文</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.theme}</label>
                    <div className="flex gap-3">
                      <button onClick={() => setTheme('light')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border ${theme === 'light' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                        <Sun className="w-4 h-4" /> {t.light}
                      </button>
                      <button onClick={() => setTheme('dark')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border ${theme === 'dark' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                        <Moon className="w-4 h-4" /> {t.dark}
                      </button>
                      <button onClick={() => setTheme('system')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border ${theme === 'system' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                        <Monitor className="w-4 h-4" /> {t.system}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

