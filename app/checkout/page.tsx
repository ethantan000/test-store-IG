'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cart';
import { api } from '@/lib/api';
import { formatPrice, generateCartKey } from '@/lib/utils';
import { FadeIn } from '@/components/ui/MotionDiv';

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
  });

  const subtotal = getSubtotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const order = await api.orders.create({
        items: items.map((item) => ({
          productId: item.productId,
          variantSku: item.variant.sku,
          quantity: item.quantity,
        })),
        customerEmail: form.customerEmail,
        customerName: form.customerName,
        shippingAddress: {
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
      });

      setOrderNumber(order.orderNumber);
      setOrderComplete(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <FadeIn>
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Order Confirmed!</h1>
            <p className="text-white/60 mb-2">Thank you for your purchase.</p>
            <p className="text-sm text-white/40 mb-6">
              Order number: <span className="text-brand-light font-mono">{orderNumber}</span>
            </p>
            <p className="text-sm text-white/50 mb-8">
              A confirmation email has been sent to {form.customerEmail}.
            </p>
            <Link href="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </FadeIn>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Your cart is empty</h1>
          <p className="text-white/50 mb-6">Add some products before checking out.</p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <FadeIn>
        <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <FadeIn delay={0.1} className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact */}
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-lg">Contact Information</h2>
              <input
                type="text"
                name="customerName"
                placeholder="Full Name"
                required
                value={form.customerName}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="email"
                name="customerEmail"
                placeholder="Email Address"
                required
                value={form.customerEmail}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Shipping */}
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-lg">Shipping Address</h2>
              <input
                type="text"
                name="line1"
                placeholder="Address Line 1"
                required
                value={form.line1}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="line2"
                placeholder="Address Line 2 (optional)"
                value={form.line2}
                onChange={handleChange}
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  required
                  value={form.city}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  required
                  value={form.state}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                required
                value={form.zip}
                onChange={handleChange}
                className="input-field"
                pattern="[0-9]{5}"
                title="5-digit ZIP code"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg py-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Place Order - ${formatPrice(total)}`
              )}
            </button>
          </form>
        </FadeIn>

        {/* Order Summary */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={generateCartKey(item.productId, item.variant.sku)} className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {item.image && (
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="56px" />
                    )}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    <p className="text-xs text-white/40">{item.variant.color} / {item.variant.size}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-white/5">
                <span>Total</span>
                <span className="gradient-text">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
