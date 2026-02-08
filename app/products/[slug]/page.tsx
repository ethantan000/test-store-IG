import ProductPageClient from '@/components/pages/ProductPageClient';
import { Product } from '@/lib/api';

import useSWR from 'swr';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/MotionDiv';
import ProductDetail from '@/components/product/ProductDetail';
import ProductReviews from '@/components/product/ProductReviews';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { data: product, error, isLoading } = useSWR(
    params.slug ? ['product', params.slug] : null,
    () => api.products.get(params.slug),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );

  if (isLoading) {
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

async function fetchProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${slug}`, {
    next: { revalidate },
  });
  if (!res.ok) return null;
  return res.json();
}

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await fetchProduct(params.slug);

  return <ProductPageClient slug={params.slug} initialProduct={product} />;
}
