import ProductCollectionPageClient from '@/components/pages/ProductCollectionPageClient';
import { ProductsResponse } from '@/lib/api';

export const metadata = {
  title: 'New Arrivals | ViralGoods',
  description: 'Shop the newest trending products just added to ViralGoods.',
};

export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchProducts(): Promise<ProductsResponse> {
  const res = await fetch(`${API_URL}/products?limit=24&sort=createdAt&order=desc`, {
    next: { revalidate },
  });
  if (!res.ok) {
    return { products: [], pagination: { page: 1, limit: 24, total: 0, pages: 0 } };
  }
  return res.json();
}

export default async function NewArrivalsPage() {
  const products = await fetchProducts();

  return (
    <ProductCollectionPageClient
      title="New Arrivals"
      description="Freshly added products curated for your next viral find."
      initialProducts={products}
    />
  );
}
