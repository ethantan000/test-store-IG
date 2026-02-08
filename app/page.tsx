import HomePageClient from '@/components/pages/HomePageClient';
import { ProductsResponse, CmsContent } from '@/lib/api';

import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FadeInView, StaggerContainer, StaggerItem } from '@/components/ui/MotionDiv';
import ProductCard from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function Home() {
  const { data, error, isLoading } = useSWR(
    ['products', 'featured'],
    () => api.products.list({ limit: '6', sort: 'rating', order: 'desc' }),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
  const products = data?.products ?? [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[85vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-brand/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.08, 0.15] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-brand/10 blur-2xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="badge mb-4">New Arrivals Weekly</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-tight">
                Discover Products
                <br />
                <span className="gradient-text">That Go Viral</span>
              </h1>
              <p className="mt-6 text-lg text-white/60 max-w-lg leading-relaxed">
                Curated trending products at unbeatable prices. From gadgets to home decor,
                find what everyone is talking about. Ships from the US.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/products" className="btn-primary text-lg px-8 py-4">
                  Shop Now
                </Link>
                <Link href="/products?category=gadgets" className="btn-secondary text-lg px-8 py-4">
                  Explore Gadgets
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  Free Shipping $50+
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  30-Day Returns
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Secure Checkout
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand/30 to-accent/30 rounded-3xl blur-3xl" />
                <div className="relative card-glow p-6 rounded-3xl">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5">
                    <Image
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
                      alt="Featured product"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">Featured</p>
                      <p className="font-display font-bold text-lg">HypeWidget Pro</p>
                    </div>
                    <span className="text-xl font-bold gradient-text">$49.99</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-brand-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold">Shop by Category</h2>
              <p className="mt-3 text-white/50">Find exactly what you are looking for</p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <StaggerItem key={cat.value}>
                <Link
                  href={`/products?category=${cat.value}`}
                  className="card p-6 text-center group block"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-brand flex items-center justify-center group-hover:shadow-brand transition-shadow">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm group-hover:text-brand-light transition-colors">
                    {cat.name}
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-brand-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-display font-bold">Trending Now</h2>
                <p className="mt-2 text-white/50">Our most popular products this week</p>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-1 text-sm text-brand-light hover:text-brand transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </FadeInView>

          {isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-white/50">
                {error instanceof Error ? error.message : 'Failed to load products'}
              </p>
              <button onClick={() => window.location.reload()} className="mt-4 btn-secondary text-sm">
                Try Again
              </button>
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

async function fetchAnnouncement(): Promise<CmsContent | null> {
  try {
    const res = await fetch(`${API_URL}/cms/type/announcement`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CmsContent[];
    return data[0] || null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const [products, announcement] = await Promise.all([fetchProducts(), fetchAnnouncement()]);

  return <HomePageClient initialProducts={products} announcement={announcement} />;
}
