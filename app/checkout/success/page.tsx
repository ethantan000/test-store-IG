'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, Order } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { FadeIn } from '@/components/ui/MotionDiv';
import { trackPurchase } from '@/components/analytics/GoogleAnalytics';
import { trackMetaPurchase } from '@/components/analytics/MetaPixel';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      api.orders
        .get(orderNumber)
        .then((data) => {
          setOrder(data);
          // Track purchase
          trackPurchase(
            data.orderNumber,
            data.total,
            data.items.map((item) => ({
              id: item.productId,
              name: item.title,
              price: item.price,
              quantity: item.quantity,
            }))
          );
          trackMetaPurchase(
            data.total,
            'USD',
            data.items.map((item) => item.productId)
          );
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="skeleton h-48 w-96" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <FadeIn>
        <div className="text-center max-w-lg mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-3xl font-display font-bold mb-2">Payment Successful!</h1>
          <p className="text-white/60 mb-2">Thank you for your order.</p>

          {order && (
            <div className="card p-6 mt-6 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Order Number</span>
                <span className="font-mono text-brand-light">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Items</span>
                <span>{order.items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Total</span>
                <span className="font-bold gradient-text">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Status</span>
                <span className="badge bg-yellow-500/20 text-yellow-400 text-[10px]">{order.status}</span>
              </div>
              <p className="text-xs text-white/40 pt-2 border-t border-white/5">
                Confirmation email sent to {order.customerEmail}
              </p>
            </div>
          )}

          {!order && orderNumber && (
            <p className="text-sm text-white/40 mb-6">
              Order: <span className="text-brand-light font-mono">{orderNumber}</span>
            </p>
          )}

          <div className="flex gap-3 justify-center mt-8">
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
