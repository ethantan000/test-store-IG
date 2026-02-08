'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, Order } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { FadeIn } from '@/components/ui/MotionDiv';
import { analytics } from '@/lib/analytics';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    api.checkout
      .verifySession(sessionId)
      .then((o) => {
        setOrder(o);
        // Track purchase event
        analytics.purchase({
          transactionId: o.orderNumber,
          value: o.total,
          items: o.items.map((i) => ({
            id: i.productId,
            name: i.title,
            price: i.price,
            quantity: i.quantity,
          })),
        });
      })
      .catch(() => setError('Unable to verify payment. Please check your email for confirmation.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <FadeIn>
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-display font-bold mb-2">Payment Status</h1>
            <p className="text-white/60 mb-6">{error}</p>
            <Link href="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <FadeIn>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Payment Successful!</h1>
          <p className="text-white/60 mb-2">Thank you for your purchase.</p>
          {order && (
            <>
              <p className="text-sm text-white/40 mb-2">
                Order number: <span className="text-brand-light font-mono">{order.orderNumber}</span>
              </p>
              <p className="text-sm text-white/40 mb-2">
                Total: <span className="font-semibold">{formatPrice(order.total)}</span>
              </p>
              <p className="text-sm text-white/50 mb-8">
                A confirmation email has been sent to {order.customerEmail}.
              </p>
            </>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/products" className="btn-primary">
              Continue Shopping
            </Link>
            <Link href="/account" className="btn-secondary">
              View Orders
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
