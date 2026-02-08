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
  trackingNumber?: string;
  stripeSessionId?: string;
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

export interface Review {
  _id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  aggregation: {
    average: number;
    total: number;
    distribution: Record<string, number>;
  };
}

export interface WishlistItem {
  productId: Product;
  addedAt: string;
}

export interface CmsContent {
  _id: string;
  key: string;
  title: string;
  content: string;
  contentType: 'page' | 'banner' | 'announcement' | 'faq' | 'policy';
  isPublished: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AbTest {
  _id: string;
  name: string;
  key: string;
  variants: { id: string; name: string; weight: number; content?: Record<string, unknown> }[];
  metrics: { variantId: string; impressions: number; conversions: number }[];
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface InventoryAlert {
  _id: string;
  productId: { _id: string; title: string; slug: string; images: string[] } | string;
  variantSku: string;
  type: 'low_stock' | 'out_of_stock' | 'reorder';
  currentStock: number;
  threshold: number;
  autoReorder: boolean;
  reorderQuantity: number;
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
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
      useStripe?: boolean;
    }) =>
      apiFetch<{ order: Order; checkoutUrl?: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (orderNumber: string) => apiFetch<Order>(`/orders/${orderNumber}`),
    history: (email: string) => apiFetch<Order[]>(`/orders/history/${encodeURIComponent(email)}`),
    myOrders: (token: string) => apiFetch<Order[]>('/orders/user/my-orders', { token }),
  },
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    register: (email: string, password: string, name: string) =>
      apiFetch<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify({ email, password, name }) }
      ),
    me: (token: string) =>
      apiFetch<{ _id: string; email: string; name: string; role: string }>('/auth/me', { token }),
  },
  reviews: {
    forProduct: (productId: string) => apiFetch<ReviewsResponse>(`/reviews/product/${productId}`),
    create: (token: string, data: { productId: string; rating: number; title: string; body: string; userName: string }) =>
      apiFetch<Review>('/reviews', { method: 'POST', body: JSON.stringify(data), token }),
    helpful: (reviewId: string) =>
      apiFetch<Review>(`/reviews/${reviewId}/helpful`, { method: 'POST' }),
  },
  wishlist: {
    get: (token: string) => apiFetch<{ userId: string; items: WishlistItem[] }>('/wishlist', { token }),
    add: (token: string, productId: string) =>
      apiFetch<{ userId: string; items: WishlistItem[] }>('/wishlist/add', {
        method: 'POST',
        body: JSON.stringify({ productId }),
        token,
      }),
    remove: (token: string, productId: string) =>
      apiFetch<{ userId: string; items: WishlistItem[] }>(`/wishlist/remove/${productId}`, {
        method: 'DELETE',
        token,
      }),
  },
  cms: {
    get: (key: string) => apiFetch<CmsContent>(`/cms/${key}`),
    byType: (contentType: string) => apiFetch<CmsContent[]>(`/cms/type/${contentType}`),
  },
  abtests: {
    getVariant: (key: string) =>
      apiFetch<{ testId: string; variant: { id: string; name: string; weight: number; content?: Record<string, unknown> } | null }>(
        `/abtests/variant/${key}`
      ),
    trackConversion: (testId: string, variantId: string) =>
      apiFetch<{ success: boolean }>('/abtests/convert', {
        method: 'POST',
        body: JSON.stringify({ testId, variantId }),
      }),
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
    reviews: {
      all: (token: string) => apiFetch<Review[]>('/reviews/admin/all', { token }),
      approve: (token: string, reviewId: string) =>
        apiFetch<Review>(`/reviews/${reviewId}/approve`, { method: 'PUT', token }),
    },
    cms: {
      list: (token: string) => apiFetch<CmsContent[]>('/cms', { token }),
      create: (token: string, data: Partial<CmsContent>) =>
        apiFetch<CmsContent>('/cms', { method: 'POST', body: JSON.stringify(data), token }),
      update: (token: string, id: string, data: Partial<CmsContent>) =>
        apiFetch<CmsContent>(`/cms/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
      delete: (token: string, id: string) =>
        apiFetch<{ message: string }>(`/cms/${id}`, { method: 'DELETE', token }),
    },
    abtests: {
      list: (token: string) => apiFetch<AbTest[]>('/abtests', { token }),
      create: (token: string, data: Partial<AbTest>) =>
        apiFetch<AbTest>('/abtests', { method: 'POST', body: JSON.stringify(data), token }),
      update: (token: string, id: string, data: Partial<AbTest>) =>
        apiFetch<AbTest>(`/abtests/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
      delete: (token: string, id: string) =>
        apiFetch<{ message: string }>(`/abtests/${id}`, { method: 'DELETE', token }),
    },
    inventory: {
      alerts: (token: string) =>
        apiFetch<{ alerts: InventoryAlert[]; stats: { active: number; resolved: number } }>(
          '/inventory/alerts',
          { token }
        ),
      resolve: (token: string, id: string) =>
        apiFetch<InventoryAlert>(`/inventory/alerts/${id}/resolve`, { method: 'PUT', token }),
      restock: (token: string, productId: string, variantSku: string, quantity: number) =>
        apiFetch<{ message: string; newStock: number }>('/inventory/restock', {
          method: 'POST',
          body: JSON.stringify({ productId, variantSku, quantity }),
          token,
        }),
      check: (token: string) =>
        apiFetch<{ message: string }>('/inventory/check', { method: 'POST', token }),
    },
  },
};
