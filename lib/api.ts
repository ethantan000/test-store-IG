const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Product types matching backend
export interface ProductVariant {
  color: string;
  size: string;
  sku: string;
  stock: number;
  priceModifier: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  comparePrice: number;
  costPrice: number;
  images: string[];
  variants: ProductVariant[];
  isActive: boolean;
  isDropship: boolean;
  aliexpressId?: string;
  shippingFrom: string;
  estimatedDelivery: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    variant: { color: string; size: string; sku: string };
    image: string;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
}

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  dropshipProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageMargin: number;
}

// Public API
export const api = {
  products: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<ProductsResponse>(`/products${query}`);
    },
    get: (slug: string) => apiFetch<Product>(`/products/${slug}`),
  },
  orders: {
    create: (data: {
      items: { productId: string; variantSku: string; quantity: number }[];
      customerEmail: string;
      customerName: string;
      shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        country?: string;
      };
    }) =>
      apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (orderNumber: string) => apiFetch<Order>(`/orders/${orderNumber}`),
  },
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    me: (token: string) =>
      apiFetch<{ _id: string; email: string; name: string; role: string }>('/auth/me', { token }),
  },
  admin: {
    stats: (token: string) => apiFetch<AdminStats>('/admin/stats', { token }),
    products: (token: string) => apiFetch<Product[]>('/admin/products', { token }),
    orders: (token: string) => apiFetch<Order[]>('/admin/orders', { token }),
    importProduct: (
      token: string,
      data: {
        productIdOrUrl: string;
        customTitle?: string;
        customDescription?: string;
        brand?: string;
        markupMultiplier?: number;
        category?: string;
      }
    ) =>
      apiFetch<{ product: Product; importDetails: Record<string, number> }>('/admin/import', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    searchAliExpress: (token: string, query: string) =>
      apiFetch<{ products: Record<string, unknown>[]; total: number }>(
        `/admin/aliexpress/search?q=${encodeURIComponent(query)}`,
        { token }
      ),
  },
};
