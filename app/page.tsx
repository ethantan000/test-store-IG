import HomePageClient from '@/components/pages/HomePageClient';
import { ProductsResponse, CmsContent } from '@/lib/api';

export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchProducts(): Promise<ProductsResponse> {
  const res = await fetch(`${API_URL}/products?limit=6&sort=rating&order=desc`, {
    next: { revalidate },
  });
  if (!res.ok) {
    return { products: [], pagination: { page: 1, limit: 6, total: 0, pages: 0 } };
  }
  return res.json();
}

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
