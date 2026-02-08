'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useCustomerStore } from '@/store/customer';
import { api, Order, CustomerProfile } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { FadeIn } from '@/components/ui/MotionDiv';

type Tab = 'orders' | 'profile' | 'addresses';

export default function AccountPage() {
  const { token, customer, setCustomerAuth, logoutCustomer } = useCustomerStore();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Auth forms
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      api.customers.me(token).then(setProfile),
      api.customers.orders(token).then(setOrders),
    ])
      .catch(() => {
        logoutCustomer();
        toast.error('Session expired. Please log in again.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isLogin) {
        const res = await api.customers.login(authForm.email, authForm.password);
        setCustomerAuth(res.token, res.customer);
        toast.success('Welcome back!');
      } else {
        const res = await api.customers.register({
          email: authForm.email,
          password: authForm.password,
          name: authForm.name,
        });
        setCustomerAuth(res.token, res.customer);
        toast.success('Account created!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  if (!customer || !token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <FadeIn>
          <div className="card p-8">
            <h1 className="text-2xl font-display font-bold mb-6 text-center">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Full Name"
                  required={!isLogin}
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="input-field"
                />
              )}
              <input
                type="email"
                placeholder="Email Address"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Password (min 8 characters)"
                required
                minLength={8}
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="input-field"
              />
              <button type="submit" disabled={authLoading} className="btn-primary w-full">
                {authLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-white/50 mt-4">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-light hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </FadeIn>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">My Account</h1>
            <p className="text-white/50 mt-1">Welcome, {customer.name}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/wishlist" className="btn-secondary text-sm">
              Wishlist
            </Link>
            <button onClick={logoutCustomer} className="btn-secondary text-sm">
              Sign Out
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/10">
        {(['orders', 'profile', 'addresses'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'text-brand-light border-b-2 border-brand'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <div className="animate-pulse h-48 bg-white/5 rounded-xl" />}

      {/* Orders Tab */}
      {!loading && tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/50 mb-4">No orders yet.</p>
              <Link href="/products" className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-mono text-sm text-brand-light">{order.orderNumber}</span>
                    <span className="text-xs text-white/40 ml-3">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </span>
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 min-w-0">
                      {item.image && (
                        <div className="relative w-10 h-10 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                          <Image src={item.image} alt={item.title} fill className="object-cover" sizes="40px" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs truncate">{item.title}</p>
                        <p className="text-xs text-white/40">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {order.trackingNumber && (
                  <p className="text-xs text-white/50 mt-2">
                    Tracking: {order.trackingUrl ? (
                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-brand-light hover:underline">
                        {order.trackingNumber}
                      </a>
                    ) : order.trackingNumber}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile Tab */}
      {!loading && tab === 'profile' && profile && (
        <div className="card p-6 max-w-lg">
          <h2 className="font-display font-bold text-lg mb-4">Profile Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-white/50">Name:</span>
              <span className="ml-2">{profile.name}</span>
            </div>
            <div>
              <span className="text-white/50">Email:</span>
              <span className="ml-2">{profile.email}</span>
            </div>
            {profile.phone && (
              <div>
                <span className="text-white/50">Phone:</span>
                <span className="ml-2">{profile.phone}</span>
              </div>
            )}
            <div>
              <span className="text-white/50">Member since:</span>
              <span className="ml-2">{formatDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {!loading && tab === 'addresses' && profile && (
        <div className="space-y-4">
          {profile.shippingAddresses.length === 0 ? (
            <p className="text-white/50 text-center py-8">No saved addresses.</p>
          ) : (
            profile.shippingAddresses.map((addr, i) => (
              <div key={i} className="card p-5 flex justify-between items-start">
                <div className="text-sm">
                  <p className="font-semibold">
                    {addr.label}
                    {addr.isDefault && (
                      <span className="ml-2 text-xs text-brand-light">(Default)</span>
                    )}
                  </p>
                  <p className="text-white/60 mt-1">{addr.line1}</p>
                  {addr.line2 && <p className="text-white/60">{addr.line2}</p>}
                  <p className="text-white/60">
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (!token) return;
                    try {
                      const updated = await api.customers.deleteAddress(token, i);
                      setProfile((prev) => prev ? { ...prev, shippingAddresses: updated } : prev);
                      toast.success('Address removed');
                    } catch {
                      toast.error('Failed to remove address');
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
