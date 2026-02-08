import ProductsPageClient from '@/components/pages/ProductsPageClient';
import { ProductsResponse } from '@/lib/api';

export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchProducts(): Promise<ProductsResponse> {
  const res = await fetch(`${API_URL}/products?limit=50&sort=createdAt&order=desc`, {
    next: { revalidate },
  });
  if (!res.ok) {
    return { products: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } };
  }
  return res.json();
}

export default async function ProductsPage() {
  const products = await fetchProducts();

  return <ProductsPageClient initialProducts={products} />;
}
