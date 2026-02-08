import ProductCollectionPageClient from '@/components/pages/ProductCollectionPageClient';
import { ProductsResponse } from '@/lib/api';

export const metadata = {
  title: 'Bestsellers | ViralGoods',
  description: 'Our most popular products ranked by customer demand.',
};

export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchProducts(): Promise<ProductsResponse> {
  const res = await fetch(`${API_URL}/products?limit=24&sort=reviewCount&order=desc`, {
    next: { revalidate },
  });
  if (!res.ok) {
    return { products: [], pagination: { page: 1, limit: 24, total: 0, pages: 0 } };
  }
  return res.json();
}

export default async function BestsellersPage() {
  const products = await fetchProducts();

  return (
    <ProductCollectionPageClient
      title="Bestsellers"
      description="Top-rated favorites and most-loved picks from ViralGoods customers."
      initialProducts={products}
    />
  );
}
