'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCustomerStore } from '@/store/customer';
import { api, Product } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionDiv';

export default function WishlistPage() {
  const { token, customer } = useCustomerStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.wishlist
      .get(token)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Wishlist</h1>
          <p className="text-white/50 mb-6">Sign in to view your wishlist.</p>
          <Link href="/account" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <FadeIn>
        <h1 className="text-3xl font-display font-bold mb-8">My Wishlist</h1>
      </FadeIn>

      {loading && <div className="animate-pulse h-48 bg-white/5 rounded-xl" />}

      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/50 mb-4">Your wishlist is empty.</p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <StaggerItem key={product._id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
