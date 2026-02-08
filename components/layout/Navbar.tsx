'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cart';
import { useCustomerStore } from '@/store/customer';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCount = useCartStore((s) => s.getItemCount());
  const customer = useCustomerStore((s) => s.customer);

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-brand-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="ViralGoods Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">VG</span>
            </div>
            <span className="font-display font-bold text-lg text-white group-hover:text-brand-light transition-colors">
              ViralGoods
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Home
            </Link>
            <div className="relative group">
              <button
                className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
                aria-haspopup="true"
              >
                Shop
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-3 w-44 rounded-xl border border-white/10 bg-brand-900/95 backdrop-blur-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                <div className="p-2 space-y-1">
                  <Link href="/products" className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg">
                    All Products
                  </Link>
                  <Link href="/products/new-arrivals" className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg">
                    New Arrivals
                  </Link>
                  <Link href="/products/bestsellers" className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg">
                    Bestsellers
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/wishlist"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Wishlist
            </Link>
            <Link
              href="/account"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {customer ? customer.name.split(' ')[0] : 'Account'}
            </Link>
          </div>

          {/* Cart & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-brand-900/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium',
                  'text-white/70 hover:text-white hover:bg-white/5 transition-all'
                )}
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium',
                  'text-white/70 hover:text-white hover:bg-white/5 transition-all'
                )}
              >
                Shop All
              </Link>
              <Link
                href="/products/new-arrivals"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium',
                  'text-white/70 hover:text-white hover:bg-white/5 transition-all'
                )}
              >
                New Arrivals
              </Link>
              <Link
                href="/products/bestsellers"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium',
                  'text-white/70 hover:text-white hover:bg-white/5 transition-all'
                )}
              >
                Bestsellers
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium',
                  'text-white/70 hover:text-white hover:bg-white/5 transition-all'
                )}
              >
                Wishlist
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium',
                  'text-white/70 hover:text-white hover:bg-white/5 transition-all'
                )}
              >
                {customer ? `Hi, ${customer.name.split(' ')[0]}` : 'Account'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
