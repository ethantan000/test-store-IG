'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { api, Product, AdminStats, Review, CmsContent, AbTest, InventoryAlert } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/MotionDiv';

type Tab = 'dashboard' | 'products' | 'import' | 'orders' | 'reviews' | 'cms' | 'abtests' | 'inventory';

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
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" autoComplete="email" />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" autoComplete="current-password" />
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
  useEffect(() => { api.admin.stats(token).then(setStats).catch(() => {}); }, [token]);
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
  useEffect(() => { api.admin.products(token).then(setProducts).catch(() => {}).finally(() => setLoading(false)); }, [token]);
  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products/${product._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, isActive: !p.isActive } : p)));
        toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
      }
    } catch { toast.error('Failed to update product'); }
  };
  if (loading) return <div className="skeleton h-40 w-full" />;
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product._id} className="card p-4 flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
            {product.images[0] && <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="56px" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-1">{product.title}</p>
            <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
              <span>{formatPrice(product.price)}</span>
              {product.isDropship && <span className="badge text-[10px]">Dropship</span>}
              <span className={product.isActive ? 'text-green-400' : 'text-red-400'}>{product.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <button onClick={() => toggleActive(product)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', product.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30')}>
            {product.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ))}
      {products.length === 0 && <p className="text-center text-white/50 py-8">No products yet. Import some from AliExpress!</p>}
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
      const result = await api.admin.importProduct(token, { productIdOrUrl: input, brand, markupMultiplier: parseFloat(markup), category });
      toast.success(`Imported: ${result.product.title}`);
      setInput('');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Import failed'); }
    finally { setLoading(false); }
  };
  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await api.admin.searchAliExpress(token, input);
      setSearchResults(result.products);
      if (result.products.length === 0) toast('No US-shipped products found');
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => { setMode('id'); setSearchResults([]); }} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', mode === 'id' ? 'bg-brand text-white' : 'bg-white/5 text-white/70')}>Import by ID/URL</button>
        <button onClick={() => { setMode('search'); setSearchResults([]); }} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', mode === 'search' ? 'bg-brand text-white' : 'bg-white/5 text-white/70')}>Search AliExpress</button>
      </div>
      <div className="card p-6 space-y-4">
        <input type="text" placeholder={mode === 'id' ? 'AliExpress Product ID or URL' : 'Search keywords'} value={input} onChange={(e) => setInput(e.target.value)} className="input-field" />
        <div className="grid grid-cols-3 gap-4">
          <div><label className="text-xs text-white/50 mb-1 block">Brand</label><input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field" /></div>
          <div><label className="text-xs text-white/50 mb-1 block">Markup</label><input type="number" step="0.1" min="1" value={markup} onChange={(e) => setMarkup(e.target.value)} className="input-field" /></div>
          <div><label className="text-xs text-white/50 mb-1 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
              <option value="general">General</option><option value="gadgets">Gadgets</option><option value="lighting">Lighting</option><option value="decor">Decor</option><option value="kitchen">Kitchen</option>
            </select>
          </div>
        </div>
        <button onClick={mode === 'id' ? handleImport : handleSearch} disabled={loading || !input.trim()} className="btn-primary w-full">{loading ? 'Processing...' : mode === 'id' ? 'Import Product' : 'Search Products'}</button>
      </div>
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-white/70">Search Results (US-Shipped Only)</h3>
          {searchResults.map((product, i) => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{String(product.title || '')}</p>
                <p className="text-xs text-white/50 mt-0.5">Cost: {formatPrice(Number(product.price || 0))} | Retail: {formatPrice(Number(product.price || 0) * parseFloat(markup))}</p>
              </div>
              <button onClick={async () => { setLoading(true); try { await api.admin.importProduct(token, { productIdOrUrl: String(product.productId || ''), brand, markupMultiplier: parseFloat(markup), category }); toast.success('Imported!'); } catch { toast.error('Import failed'); } finally { setLoading(false); } }} className="btn-primary text-xs px-4 py-2">Import</button>
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
  useEffect(() => { api.admin.orders(token).then(setOrders as (data: unknown) => void).catch(() => {}).finally(() => setLoading(false)); }, [token]);
  if (loading) return <div className="skeleton h-40 w-full" />;
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order._id} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm text-brand-light">{order.orderNumber}</span>
            <span className={cn('badge text-[10px]', order.status === 'pending' && 'bg-yellow-500/20 text-yellow-400', order.status === 'processing' && 'bg-blue-500/20 text-blue-400', order.status === 'shipped' && 'bg-green-500/20 text-green-400')}>{order.status}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">{order.customerName}</span>
            <span className="font-semibold">{formatPrice(order.total)}</span>
          </div>
          <p className="text-xs text-white/40 mt-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''} | {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
      {orders.length === 0 && <p className="text-center text-white/50 py-8">No orders yet.</p>}
    </div>
  );
}

function ReviewManager({ token }: { token: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.admin.reviews.all(token).then(setReviews).catch(() => {}).finally(() => setLoading(false)); }, [token]);

  const handleApprove = async (reviewId: string) => {
    try {
      const updated = await api.admin.reviews.approve(token, reviewId);
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? updated : r)));
      toast.success('Review approved');
    } catch { toast.error('Failed to approve review'); }
  };

  if (loading) return <div className="skeleton h-40 w-full" />;
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review._id} className="card p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">{[1, 2, 3, 4, 5].map((s) => (<svg key={s} className={cn('w-3.5 h-3.5', s <= review.rating ? 'text-yellow-400' : 'text-white/20')} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>))}</div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full', review.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400')}>{review.isApproved ? 'Approved' : 'Pending'}</span>
              </div>
              <p className="font-medium text-sm">{review.title}</p>
            </div>
            <span className="text-xs text-white/40">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-white/60 mb-2">{review.body}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">by {review.userName}</span>
            {!review.isApproved && (
              <button onClick={() => handleApprove(review._id)} className="px-3 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">Approve</button>
            )}
          </div>
        </div>
      ))}
      {reviews.length === 0 && <p className="text-center text-white/50 py-8">No reviews yet.</p>}
    </div>
  );
}

function CmsManager({ token }: { token: string }) {
  const [contents, setContents] = useState<CmsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CmsContent | null>(null);
  const [form, setForm] = useState({ key: '', title: '', content: '', contentType: 'page' as CmsContent['contentType'], isPublished: true });

  useEffect(() => { api.admin.cms.list(token).then(setContents).catch(() => {}).finally(() => setLoading(false)); }, [token]);

  const handleSave = async () => {
    try {
      if (editing) {
        const updated = await api.admin.cms.update(token, editing._id, form);
        setContents((prev) => prev.map((c) => (c._id === editing._id ? updated : c)));
        toast.success('Content updated');
      } else {
        const created = await api.admin.cms.create(token, form);
        setContents((prev) => [...prev, created]);
        toast.success('Content created');
      }
      setEditing(null);
      setForm({ key: '', title: '', content: '', contentType: 'page', isPublished: true });
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Save failed'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.admin.cms.delete(token, id);
      setContents((prev) => prev.filter((c) => c._id !== id));
      toast.success('Content deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm">{editing ? 'Edit Content' : 'Create Content'}</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Unique Key (e.g., homepage-banner)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} className="input-field" disabled={!!editing} />
          <select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value as CmsContent['contentType'] })} className="input-field">
            <option value="page">Page</option><option value="banner">Banner</option><option value="announcement">Announcement</option><option value="faq">FAQ</option><option value="policy">Policy</option>
          </select>
        </div>
        <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
        <textarea placeholder="Content (HTML or Markdown)" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field resize-none" />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="rounded" />
            Published
          </label>
          <div className="flex-1" />
          {editing && <button onClick={() => { setEditing(null); setForm({ key: '', title: '', content: '', contentType: 'page', isPublished: true }); }} className="btn-secondary text-xs px-4 py-2">Cancel</button>}
          <button onClick={handleSave} disabled={!form.key || !form.title} className="btn-primary text-xs px-4 py-2">{editing ? 'Update' : 'Create'}</button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {contents.map((c) => (
          <div key={c._id} className="card p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{c.title}</p>
              <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                <span className="badge text-[10px]">{c.contentType}</span>
                <span className="font-mono">{c.key}</span>
                <span className={c.isPublished ? 'text-green-400' : 'text-yellow-400'}>{c.isPublished ? 'Published' : 'Draft'}</span>
              </div>
            </div>
            <button onClick={() => { setEditing(c); setForm({ key: c.key, title: c.title, content: c.content, contentType: c.contentType, isPublished: c.isPublished }); }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">Edit</button>
            <button onClick={() => handleDelete(c._id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Delete</button>
          </div>
        ))}
        {contents.length === 0 && <p className="text-center text-white/50 py-8">No CMS content yet.</p>}
      </div>
    </div>
  );
}

function AbTestManager({ token }: { token: string }) {
  const [tests, setTests] = useState<AbTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.admin.abtests.list(token).then(setTests).catch(() => {}).finally(() => setLoading(false)); }, [token]);

  const toggleActive = async (test: AbTest) => {
    try {
      const updated = await api.admin.abtests.update(token, test._id, { isActive: !test.isActive } as Partial<AbTest>);
      setTests((prev) => prev.map((t) => (t._id === test._id ? updated : t)));
      toast.success(`Test ${test.isActive ? 'paused' : 'activated'}`);
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="space-y-3">
      {tests.map((test) => (
        <div key={test._id} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium text-sm">{test.name}</p>
              <p className="text-xs text-white/50 font-mono">{test.key}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full', test.isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40')}>{test.isActive ? 'Active' : 'Paused'}</span>
              <button onClick={() => toggleActive(test)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', test.isActive ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30')}>
                {test.isActive ? 'Pause' : 'Activate'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {test.variants.map((variant) => {
              const metric = test.metrics.find((m) => m.variantId === variant.id);
              const convRate = metric && metric.impressions > 0 ? ((metric.conversions / metric.impressions) * 100).toFixed(1) : '0.0';
              return (
                <div key={variant.id} className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-xs font-medium">{variant.name}</p>
                  <p className="text-[10px] text-white/40">Weight: {variant.weight}</p>
                  {metric && <p className="text-xs text-brand-light mt-1">{convRate}% conv ({metric.impressions} imp)</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {tests.length === 0 && <p className="text-center text-white/50 py-8">No A/B tests yet.</p>}
    </div>
  );
}

function InventoryManager({ token }: { token: string }) {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [stats, setStats] = useState({ active: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    api.admin.inventory.alerts(token).then((data) => { setAlerts(data.alerts); setStats(data.stats); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, [token]);

  const handleResolve = async (id: string) => {
    try {
      await api.admin.inventory.resolve(token, id);
      fetchAlerts();
      toast.success('Alert resolved');
    } catch { toast.error('Failed to resolve'); }
  };

  const handleCheck = async () => {
    try {
      const result = await api.admin.inventory.check(token);
      toast.success(result.message);
      fetchAlerts();
    } catch { toast.error('Check failed'); }
  };

  const typeColors: Record<string, string> = {
    low_stock: 'bg-yellow-500/20 text-yellow-400',
    out_of_stock: 'bg-red-500/20 text-red-400',
    reorder: 'bg-blue-500/20 text-blue-400',
  };

  if (loading) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <StatCard label="Active Alerts" value={stats.active} />
        <StatCard label="Resolved" value={stats.resolved} />
        <button onClick={handleCheck} className="btn-primary text-sm px-4 py-2 self-end">Run Inventory Check</button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const product = typeof alert.productId === 'object' ? alert.productId : null;
          return (
            <div key={alert._id} className="card p-4 flex items-center gap-4">
              {product && product.images?.[0] && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="40px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{product ? product.title : 'Unknown Product'}</p>
                <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                  <span className={cn('badge text-[10px]', typeColors[alert.type] || '')}>{alert.type.replace('_', ' ')}</span>
                  <span>SKU: {alert.variantSku}</span>
                  <span>Stock: {alert.currentStock}</span>
                  {alert.autoReorder && <span className="text-blue-400">Auto-reorder: {alert.reorderQuantity}</span>}
                </div>
              </div>
              {!alert.isResolved && (
                <button onClick={() => handleResolve(alert._id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">Resolve</button>
              )}
            </div>
          );
        })}
        {alerts.length === 0 && <p className="text-center text-white/50 py-8">No inventory alerts.</p>}
      </div>
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
    { id: 'reviews', label: 'Reviews' },
    { id: 'cms', label: 'CMS' },
    { id: 'abtests', label: 'A/B Tests' },
    { id: 'inventory', label: 'Inventory' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-sm text-white/50">Welcome back, {user?.name}</p>
          </div>
          <button onClick={logout} className="btn-secondary text-sm px-4 py-2">Logout</button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex gap-1 mb-8 p-1 bg-white/5 rounded-xl w-fit overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                tab === t.id ? 'bg-brand text-white shadow-brand' : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FadeIn>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {tab === 'dashboard' && <Dashboard token={token} />}
          {tab === 'products' && <ProductManager token={token} />}
          {tab === 'import' && <ImportEngine token={token} />}
          {tab === 'orders' && <OrdersList token={token} />}
          {tab === 'reviews' && <ReviewManager token={token} />}
          {tab === 'cms' && <CmsManager token={token} />}
          {tab === 'abtests' && <AbTestManager token={token} />}
          {tab === 'inventory' && <InventoryManager token={token} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
