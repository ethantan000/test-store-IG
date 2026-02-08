'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { api, Product, AdminStats } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/MotionDiv';

type Tab = 'dashboard' | 'products' | 'import' | 'orders';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await api.auth.login(email, password);
      setAuth(token, user);
      toast.success('Logged in successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <FadeIn>
        <div className="card p-8 w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-lg">VG</span>
            </div>
            <h1 className="text-2xl font-display font-bold">Admin Login</h1>
            <p className="text-sm text-white/50 mt-1">Restricted to store administrators</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              autoComplete="current-password"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', accent ? 'gradient-text' : 'text-white')}>{value}</p>
    </div>
  );
}

function Dashboard({ token }: { token: string }) {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.admin.stats(token).then(setStats).catch(() => {});
  }, [token]);

  if (!stats) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard label="Total Products" value={stats.totalProducts} />
      <StatCard label="Active Products" value={stats.activeProducts} />
      <StatCard label="Dropship Products" value={stats.dropshipProducts} />
      <StatCard label="Total Orders" value={stats.totalOrders} />
      <StatCard label="Revenue" value={formatPrice(stats.totalRevenue)} accent />
      <StatCard label="Avg. Margin" value={formatPrice(stats.averageMargin)} accent />
    </div>
  );
}

function ProductManager({ token }: { token: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.products(token).then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isActive: !p.isActive } : p))
        );
        toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
      }
    } catch {
      toast.error('Failed to update product');
    }
  };

  if (loading) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product._id} className="card p-4 flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
            {product.images[0] && (
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="56px" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-1">{product.title}</p>
            <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
              <span>{formatPrice(product.price)}</span>
              {product.isDropship && <span className="badge text-[10px]">Dropship</span>}
              <span className={product.isActive ? 'text-green-400' : 'text-red-400'}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            onClick={() => toggleActive(product)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              product.isActive
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            )}
          >
            {product.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ))}
      {products.length === 0 && (
        <p className="text-center text-white/50 py-8">No products yet. Import some from AliExpress!</p>
      )}
    </div>
  );
}

function ImportEngine({ token }: { token: string }) {
  const [mode, setMode] = useState<'id' | 'search'>('id');
  const [input, setInput] = useState('');
  const [brand, setBrand] = useState('ViralGoods');
  const [markup, setMarkup] = useState('2.5');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);

  const handleImport = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await api.admin.importProduct(token, {
        productIdOrUrl: input,
        brand,
        markupMultiplier: parseFloat(markup),
        category,
      });
      toast.success(`Imported: ${result.product.title}`);
      toast.success(`Margin: ${formatPrice(result.importDetails.margin)} (${result.importDetails.marginPercent}%)`);
      setInput('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await api.admin.searchAliExpress(token, input);
      setSearchResults(result.products);
      if (result.products.length === 0) toast('No US-shipped products found');
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('id'); setSearchResults([]); }}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            mode === 'id' ? 'bg-brand text-white' : 'bg-white/5 text-white/70'
          )}
        >
          Import by ID/URL
        </button>
        <button
          onClick={() => { setMode('search'); setSearchResults([]); }}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            mode === 'search' ? 'bg-brand text-white' : 'bg-white/5 text-white/70'
          )}
        >
          Search AliExpress
        </button>
      </div>

      {/* Input */}
      <div className="card p-6 space-y-4">
        <input
          type="text"
          placeholder={mode === 'id' ? 'AliExpress Product ID or URL' : 'Search keywords (e.g., LED desk lamp)'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field"
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Brand</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Markup Multiplier</label>
            <input type="number" step="0.1" min="1" value={markup} onChange={(e) => setMarkup(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
              <option value="general">General</option>
              <option value="gadgets">Gadgets</option>
              <option value="lighting">Lighting</option>
              <option value="decor">Decor</option>
              <option value="kitchen">Kitchen</option>
            </select>
          </div>
        </div>

        <button
          onClick={mode === 'id' ? handleImport : handleSearch}
          disabled={loading || !input.trim()}
          className="btn-primary w-full"
        >
          {loading ? 'Processing...' : mode === 'id' ? 'Import Product' : 'Search Products'}
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-white/70">Search Results (US-Shipped Only)</h3>
          {searchResults.map((product, i) => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{String(product.title || '')}</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Cost: {formatPrice(Number(product.price || 0))} | Retail: {formatPrice(Number(product.price || 0) * parseFloat(markup))}
                </p>
              </div>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await api.admin.importProduct(token, {
                      productIdOrUrl: String(product.productId || ''),
                      brand,
                      markupMultiplier: parseFloat(markup),
                      category,
                    });
                    toast.success('Product imported!');
                  } catch {
                    toast.error('Import failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="btn-primary text-xs px-4 py-2"
              >
                Import
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersList({ token }: { token: string }) {
  const [orders, setOrders] = useState<Array<{ _id: string; orderNumber: string; customerName: string; total: number; status: string; createdAt: string; items: Array<{ title: string }> }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.orders(token).then(setOrders as (data: unknown) => void).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order._id} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm text-brand-light">{order.orderNumber}</span>
            <span className={cn(
              'badge text-[10px]',
              order.status === 'pending' && 'bg-yellow-500/20 text-yellow-400',
              order.status === 'processing' && 'bg-blue-500/20 text-blue-400',
              order.status === 'shipped' && 'bg-green-500/20 text-green-400'
            )}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">{order.customerName}</span>
            <span className="font-semibold">{formatPrice(order.total)}</span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} | {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
      {orders.length === 0 && (
        <p className="text-center text-white/50 py-8">No orders yet.</p>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { token, user, isAuthenticated, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>('dashboard');

  if (!isAuthenticated() || !token) {
    return <LoginForm />;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'import', label: 'Import' },
    { id: 'orders', label: 'Orders' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-sm text-white/50">Welcome back, {user?.name}</p>
          </div>
          <button onClick={logout} className="btn-secondary text-sm px-4 py-2">
            Logout
          </button>
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn delay={0.1}>
        <div className="flex gap-1 mb-8 p-1 bg-white/5 rounded-xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id
                  ? 'bg-brand text-white shadow-brand'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'dashboard' && <Dashboard token={token} />}
          {tab === 'products' && <ProductManager token={token} />}
          {tab === 'import' && <ImportEngine token={token} />}
          {tab === 'orders' && <OrdersList token={token} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
