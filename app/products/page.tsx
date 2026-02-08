'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionDiv';
import ProductCard from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { api, Product } from '@/lib/api';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { name: 'All', value: '' },
  { name: 'Gadgets', value: 'gadgets' },
  { name: 'Lighting', value: 'lighting' },
  { name: 'Decor', value: 'decor' },
  { name: 'Kitchen', value: 'kitchen' },
];

const SORT_OPTIONS = [
  { name: 'Newest', value: 'createdAt:desc' },
  { name: 'Price: Low to High', value: 'price:asc' },
  { name: 'Price: High to Low', value: 'price:desc' },
  { name: 'Top Rated', value: 'rating:desc' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setLoading(true);
    const [sort, order] = sortBy.split(':');
    const params: Record<string, string> = { sort, order, limit: '50' };
    if (category) params.category = category;
    if (search) params.search = search;

    api.products
      .list(params)
      .then((res) => {
        setProducts(res.products);
        setError('');
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [category, sortBy, search]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">
              {category ? CATEGORIES.find((c) => c.value === category)?.name || 'Products' : 'All Products'}
            </h1>
            <p className="mt-2 text-white/50">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </FadeIn>

        {/* Filters Bar */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto min-w-[180px] appearance-none"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-brand-900">
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        </FadeIn>

        {/* Category Tabs */}
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  category === cat.value
                    ? 'bg-brand text-white shadow-brand'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={9} />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 btn-secondary">
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-white/50 text-lg">No products found</p>
            <p className="text-white/30 text-sm mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <StaggerItem key={product._id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
