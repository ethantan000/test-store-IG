'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/MotionDiv';
import ProductDetail from '@/components/product/ProductDetail';
import ReviewList from '@/components/product/ReviewList';
import ReviewForm from '@/components/product/ReviewForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { api, Product } from '@/lib/api';
import { trackMetaViewContent } from '@/components/analytics/MetaPixel';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewKey, setReviewKey] = useState(0);

  useEffect(() => {
    api.products
      .get(params.slug)
      .then((p) => {
        setProduct(p);
        trackEvent('view_item', 'ecommerce', p.title, p.price);
        trackMetaViewContent(p._id, p.price, p.title);
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Product Not Found</h1>
          <p className="text-white/50 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link href="/products" className="btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <FadeIn>
        <nav className="mb-8 flex items-center gap-2 text-sm text-white/50" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          <span>/</span>
          <span className="text-white/80">{product.title}</span>
        </nav>
      </FadeIn>

      <FadeIn delay={0.1}>
        <ProductDetail product={product} />
      </FadeIn>

      {/* Reviews Section */}
      <FadeIn delay={0.2}>
        <div className="mt-16 pt-12 border-t border-white/5">
          <h2 className="text-2xl font-display font-bold mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ReviewList key={reviewKey} productId={product._id} />
            </div>
            <div>
              <ReviewForm
                productId={product._id}
                onReviewSubmitted={() => setReviewKey((k) => k + 1)}
              />
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
