import ProductPageClient from '@/components/pages/ProductPageClient';
import { Product } from '@/lib/api';

export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
