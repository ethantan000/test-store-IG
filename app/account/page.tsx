'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { api, Order } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/MotionDiv';

function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { token, user } = await api.auth.login(email, password);
        setAuth(token, user);
        toast.success('Welcome back!');
      } else {
        const { token, user } = await api.auth.register(email, password, name);
        setAuth(token, user);
        toast.success('Account created!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
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
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-sm text-white/50 mt-1">
              {mode === 'login' ? 'Access your orders and wishlist' : 'Join ViralGoods today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                autoComplete="name"
              />
            )}
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-brand-light hover:text-brand transition-colors"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
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

export default function AccountPage() {
  const { token, user, isAuthenticated, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated() && token) {
      api.orders
        .myOrders(token)
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  if (!isAuthenticated() || !token) {
    return <AuthForm />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">My Account</h1>
            <p className="text-white/50 mt-1">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/wishlist" className="btn-secondary text-sm px-4 py-2">
              Wishlist
            </Link>
            <button onClick={logout} className="btn-secondary text-sm px-4 py-2">
              Sign Out
            </button>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="card p-6 mb-8">
          <h2 className="font-display font-bold text-lg mb-4">Account Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/50">Name</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-white/50">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <h2 className="font-display font-bold text-lg mb-4">Order History</h2>
        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-white/50 mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-brand-light">{order.orderNumber}</span>
                    <span className={cn('badge text-[10px]', statusColors[order.status] || '')}>
                      {order.status}
                    </span>
                  </div>
                  <span className="text-sm text-white/40">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {item.image && (
                          <Image src={item.image} alt={item.title} fill className="object-cover" sizes="40px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-1">{item.title}</p>
                        <p className="text-xs text-white/40">
                          {item.variant.color} / {item.variant.size} x{item.quantity}
                        </p>
                      </div>
                      <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-sm text-white/60">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                  <span className="font-bold gradient-text">{formatPrice(order.total)}</span>
                </div>

                {order.trackingNumber && (
                  <p className="text-xs text-white/40 mt-2">
                    Tracking: <span className="text-brand-light">{order.trackingNumber}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
