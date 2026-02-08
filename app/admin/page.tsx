'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { api, Product, AdminStats, AdminAnalytics } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/MotionDiv';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type Tab = 'dashboard' | 'products' | 'import' | 'orders' | 'analytics' | 'inventory';

type ProductFormState = {
  title: string;
  description: string;
  brand: string;
  category: string;
  price: string;
  comparePrice: string;
  costPrice: string;
  images: string[];
  isActive: boolean;
  variants: string;
};

function LoginForm() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isTwoFactor, setIsTwoFactor] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.requiresTwoFactor && res.twoFactorToken) {
        setTwoFactorToken(res.twoFactorToken);
        setIsTwoFactor(true);
        toast.success('Verification code sent. Check your email.');
        return;
      }
      if (res.token && res.refreshToken && res.user) {
        setAuth(res.token, res.refreshToken, res.user);
        toast.success('Logged in successfully');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorToken) return;
    setLoading(true);
    try {
      const res = await api.auth.verifyTwoFactor(twoFactorToken, twoFactorCode);
      if (res.token && res.refreshToken && res.user) {
        setAuth(res.token, res.refreshToken, res.user);
        toast.success('2FA verified');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Enter your admin email first');
      return;
    }
    setLoading(true);
    try {
      await api.auth.requestMagicLink(email);
      toast.success('Magic link sent to your email');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send magic link');
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

          {!isTwoFactor ? (
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
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading}
                className="btn-secondary w-full"
              >
                Send Magic Link
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                placeholder="6-digit code"
                required
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="input-field"
                maxLength={6}
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          )}
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

function AnalyticsPanel({ token }: { token: string }) {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    api.admin.analytics(token, 14).then(setAnalytics).catch(() => {});
  }, [token]);

  if (!analytics) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Orders & Revenue (Last {analytics.rangeDays} days)</h3>
        <span className="text-xs text-white/50">Stripe + manual orders</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/50 text-left">
              <th className="py-2">Date</th>
              <th className="py-2">Orders</th>
              <th className="py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {analytics.daily.map((row) => (
              <tr key={row._id} className="border-t border-white/10">
                <td className="py-2">{row._id}</td>
                <td className="py-2">{row.orders}</td>
                <td className="py-2">{formatPrice(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({
  token,
  initial,
  onSave,
  onCancel,
}: {
  token: string;
  initial?: Product | null;
  onSave: (product: Product) => void;
  onCancel?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductFormState>(() => ({
    title: initial?.title || '',
    description: initial?.description || '',
    brand: initial?.brand || 'ViralGoods',
    category: initial?.category || 'general',
    price: initial?.price?.toString() || '',
    comparePrice: initial?.comparePrice?.toString() || '',
    costPrice: initial?.costPrice?.toString() || '',
    images: initial?.images || [],
    isActive: initial?.isActive ?? true,
    variants: initial?.variants ? JSON.stringify(initial.variants, null, 2) : '[]',
  }));

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => {
          const data = new FormData();
          data.append('file', file);
          const res = await fetch(`${API_URL}/uploads`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: data,
          });
          if (!res.ok) throw new Error('Upload failed');
          const payload = await res.json();
          return payload.url as string;
        })
      );
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploads] }));
      toast.success('Images uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        brand: form.brand,
        category: form.category,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
        images: form.images,
        isActive: form.isActive,
        variants: JSON.parse(form.variants || '[]'),
      };

      const res = await fetch(`${API_URL}/products${initial?._id ? `/${initial._id}` : ''}` , {
        method: initial?._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to save product' }));
        throw new Error(err.error || 'Failed to save product');
      }

      const product = (await res.json()) as Product;
      onSave(product);
      toast.success(initial?._id ? 'Product updated' : 'Product created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = (url: string) => {
    if (!url) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Brand"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="input-field"
        />
      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="input-field min-h-[120px]"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="number"
          placeholder="Price"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Compare at price"
          value={form.comparePrice}
          onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Cost price"
          value={form.costPrice}
          onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="input-field"
        />
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active product
        </label>
      </div>

      <div>
        <label className="text-xs text-white/50">Variants (JSON array)</label>
        <textarea
          value={form.variants}
          onChange={(e) => setForm({ ...form, variants: e.target.value })}
          className="input-field min-h-[120px] font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-white/50">Images</label>
        <div className="flex flex-wrap gap-2">
          {form.images.map((img) => (
            <div key={img} className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5">
              <Image src={img} alt="Product" fill className="object-cover" sizes="64px" />
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder="Image URL"
            className="input-field"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImageUrl((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <label className="btn-secondary text-sm cursor-pointer">
            Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : initial?._id ? 'Update Product' : 'Create Product'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function ProductManager({ token }: { token: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    api.admin.products(token).then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const handleSave = (product: Product) => {
    setEditing(null);
    setProducts((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        return prev.map((p) => (p._id === product._id ? product : p));
      }
      return [product, ...prev];
    });
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete ${product.title}?`)) return;
    try {
      const res = await fetch(`${API_URL}/products/${product._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Create Product</h3>
        <ProductForm token={token} onSave={handleSave} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Manage Products</h3>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product._id} className="card p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                {product.images[0] && (
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="56px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{product.title}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mt-0.5">
                  <span>{formatPrice(product.price)}</span>
                  {product.isDropship && <span className="badge text-[10px]">Dropship</span>}
                  <span className={product.isActive ? 'text-green-400' : 'text-red-400'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(product)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-center text-white/50 py-8">No products yet. Import some from AliExpress!</p>
          )}
        </div>

        {editing && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Edit Product</h3>
            <ProductForm
              token={token}
              initial={editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}
      </div>
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

        <button onClick={mode === 'id' ? handleImport : handleSearch} className="btn-primary w-full" disabled={loading}>
          {loading ? 'Processing...' : mode === 'id' ? 'Import Product' : 'Search Products'}
        </button>
      </div>

      {/* Search Results */}
      {mode === 'search' && searchResults.length > 0 && (
        <div className="grid gap-4">
          {searchResults.map((product) => (
            <div key={product.productId as string} className="card p-4 flex flex-col md:flex-row gap-4">
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white/5">
                {product.images && (product.images as string[])[0] && (
                  <Image src={(product.images as string[])[0]} alt="" fill className="object-cover" sizes="112px" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{product.title as string}</h3>
                <p className="text-sm text-white/50">{(product.shippingFrom as string) || 'US Shipping'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-brand-light">${(product.price as number).toFixed(2)}</span>
                  <span className="text-white/30 line-through">${(product.originalPrice as number).toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  setInput(product.productId as string);
                  setMode('id');
                  await handleImport();
                }}
                className="btn-secondary"
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
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="text-xs text-white/50">{order.customerName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
              <p className="text-xs text-white/50">{order.status}</p>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-2">
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

function InventoryPanel({ token }: { token: string }) {
  const [alerts, setAlerts] = useState<Array<{ _id: string; productTitle: string; variantSku: string; currentStock: number; type: string; isResolved: boolean; createdAt: string }>>([]);
  const [lowStock, setLowStock] = useState<Array<{ productId: string; productTitle: string; variantSku: string; currentStock: number }>>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [alertData, lowStockData] = await Promise.all([
        api.inventory.alerts(token, false),
        api.inventory.lowStock(token, 5),
      ]);
      setAlerts(alertData as typeof alerts);
      setLowStock(lowStockData as typeof lowStock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  if (loading) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
        <button
          onClick={async () => {
            await api.inventory.checkAll(token);
            toast.success('Inventory check triggered');
            load();
          }}
          className="btn-secondary text-sm"
        >
          Run Inventory Check
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert._id} className="card p-4">
            <p className="font-medium">{alert.productTitle}</p>
            <p className="text-xs text-white/50">Variant: {alert.variantSku}</p>
            <p className="text-xs text-white/50">Stock: {alert.currentStock}</p>
            <p className="text-xs text-white/50">Type: {alert.type.replace('_', ' ')}</p>
          </div>
        ))}
        {alerts.length === 0 && (
          <p className="text-center text-white/50 py-6">No active alerts.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Low Stock Summary</h3>
        <div className="space-y-3">
          {lowStock.map((item) => (
            <div key={`${item.productId}-${item.variantSku}`} className="card p-4">
              <p className="font-medium">{item.productTitle}</p>
              <p className="text-xs text-white/50">Variant: {item.variantSku}</p>
              <p className="text-xs text-white/50">Current stock: {item.currentStock}</p>
            </div>
          ))}
          {lowStock.length === 0 && (
            <p className="text-center text-white/50 py-6">All products are above the threshold.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const searchParams = useSearchParams();
  const magicToken = searchParams.get('magicToken');
  const { token, refreshToken, user, setAuth, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>('dashboard');
  const refreshing = useRef(false);

  useEffect(() => {
    if (!magicToken) return;
    api.auth
      .verifyMagicLink(magicToken)
      .then((res) => {
        if (res.token && res.refreshToken && res.user) {
          setAuth(res.token, res.refreshToken, res.user);
          toast.success('Magic link verified');
        }
      })
      .catch(() => toast.error('Magic link invalid or expired'));
  }, [magicToken, setAuth]);

  useEffect(() => {
    if (!refreshToken || refreshing.current) return;
    refreshing.current = true;
    api.auth
      .refresh(refreshToken)
      .then((res) => {
        if (res.token && res.refreshToken && res.user) {
          setAuth(res.token, res.refreshToken, res.user);
        }
      })
      .catch(() => logout())
      .finally(() => {
        refreshing.current = false;
      });
  }, [refreshToken, setAuth, logout]);

  if (!token || !user) {
    return <LoginForm />;
  }

  const tabs = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'products', label: 'Products' },
      { id: 'import', label: 'Import' },
      { id: 'orders', label: 'Orders' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'inventory', label: 'Inventory' },
    ],
    []
  );

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
              <p className="text-white/50 mt-1">Welcome back, {user.name}</p>
            </div>
            <button onClick={logout} className="btn-secondary text-sm">Sign Out</button>
          </div>
        </FadeIn>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                tab === t.id ? 'bg-brand text-white shadow-brand' : 'bg-white/5 text-white/70 hover:bg-white/10'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'dashboard' && <Dashboard token={token} />}
            {tab === 'products' && <ProductManager token={token} />}
            {tab === 'import' && <ImportEngine token={token} />}
            {tab === 'orders' && <OrdersList token={token} />}
            {tab === 'analytics' && <AnalyticsPanel token={token} />}
            {tab === 'inventory' && <InventoryPanel token={token} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
