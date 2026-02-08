'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useWishlistStore } from '@/store/wishlist';
import ProductCard from '@/components/product/ProductCard';
import { FadeIn } from '@/components/ui/MotionDiv';

export default function WishlistPage() {
  const { token, isAuthenticated } = useAuthStore();
  const { items, loading, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (isAuthenticated() && token) {
      fetchWishlist(token);
    }
  }, [token, isAuthenticated, fetchWishlist]);

  if (!isAuthenticated()) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <FadeIn>
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Your Wishlist</h1>
            <p className="text-white/50 mb-6">Sign in to save and view your favorite products.</p>
            <Link href="/account" className="btn-primary">
              Sign In
            </Link>
          </div>
        </FadeIn>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-80 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const products = items
    .filter((item) => typeof item.productId !== 'string')
    .map((item) => (typeof item.productId === 'string' ? null : item.productId))
    .filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <FadeIn>
        <h1 className="text-3xl font-display font-bold mb-2">My Wishlist</h1>
        <p className="text-white/50 mb-8">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
      </FadeIn>

      {products.length === 0 ? (
        <FadeIn delay={0.1}>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <p className="text-white/50 mb-6">Your wishlist is empty. Browse products and save your favorites!</p>
            <Link href="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => product && (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
