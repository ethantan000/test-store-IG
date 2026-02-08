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
  customerId?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
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

export interface AdminAnalyticsDaily {
  _id: string;
  orders: number;
  revenue: number;
}

export interface AdminAnalytics {
  rangeDays: number;
  daily: AdminAnalyticsDaily[];
}

export interface Review {
  _id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  helpful: number;
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: { page: number; limit: number; total: number; pages: number };
  ratingBreakdown: Record<number, number>;
}

export interface CustomerProfile {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  shippingAddresses: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }[];
  wishlist: string[];
  createdAt: string;
}

export interface CmsContent {
  _id: string;
  slug: string;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, string>;
  isPublished: boolean;
  createdAt: string;
}

export interface AdminAuthResponse {
  token?: string;
  refreshToken?: string;
  user?: { id: string; email: string; name: string; role: string };
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

export interface ABTestAssignment {
  testSlug: string;
  variant: string;
  config: Record<string, string>;
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
      customerId?: string;
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
  checkout: {
    createSession: (data: {
      items: { productId: string; variantSku: string; quantity: number }[];
      customerEmail: string;
      customerName: string;
      customerId?: string;
      shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        country?: string;
      };
    }) =>
      apiFetch<{ sessionId: string; url: string }>('/checkout/create-session', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    verifySession: (sessionId: string) =>
      apiFetch<Order>(`/checkout/session/${sessionId}`),
  },
  customers: {
    register: (data: { email: string; password: string; name: string; phone?: string }) =>
      apiFetch<{ token: string; customer: { id: string; email: string; name: string } }>(
        '/customers/register',
        { method: 'POST', body: JSON.stringify(data) }
      ),
    login: (email: string, password: string) =>
      apiFetch<{ token: string; customer: { id: string; email: string; name: string } }>(
        '/customers/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    me: (token: string) => apiFetch<CustomerProfile>('/customers/me', { token }),
    updateProfile: (token: string, data: { name?: string; phone?: string }) =>
      apiFetch<CustomerProfile>('/customers/me', {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
      }),
    addAddress: (
      token: string,
      data: {
        label?: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        isDefault?: boolean;
      }
    ) =>
      apiFetch<CustomerProfile['shippingAddresses']>('/customers/me/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    deleteAddress: (token: string, index: number) =>
      apiFetch<CustomerProfile['shippingAddresses']>(`/customers/me/addresses/${index}`, {
        method: 'DELETE',
        token,
      }),
    orders: (token: string) => apiFetch<Order[]>('/customers/me/orders', { token }),
  },
  reviews: {
    getForProduct: (productId: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<ReviewsResponse>(`/reviews/product/${productId}${query}`);
    },
    create: (
      token: string,
      data: { productId: string; rating: number; title: string; body: string }
    ) =>
      apiFetch<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    markHelpful: (reviewId: string) =>
      apiFetch<{ helpful: number }>(`/reviews/${reviewId}/helpful`, { method: 'POST' }),
  },
  wishlist: {
    get: (token: string) => apiFetch<Product[]>('/wishlist', { token }),
    add: (token: string, productId: string) =>
      apiFetch<{ message: string; wishlist: string[] }>(`/wishlist/${productId}`, {
        method: 'POST',
        token,
      }),
    remove: (token: string, productId: string) =>
      apiFetch<{ message: string; wishlist: string[] }>(`/wishlist/${productId}`, {
        method: 'DELETE',
        token,
      }),
  },
  cms: {
    getBySlug: (slug: string) => apiFetch<CmsContent>(`/cms/${slug}`),
    getByType: (type: string) => apiFetch<CmsContent[]>(`/cms/type/${type}`),
  },
  abtests: {
    assign: (slug: string) => apiFetch<ABTestAssignment>(`/abtests/assign/${slug}`),
    convert: (slug: string, variantName: string) =>
      apiFetch<{ recorded: boolean }>(`/abtests/convert/${slug}/${variantName}`, {
        method: 'POST',
      }),
  },
  auth: {
    login: (email: string, password: string) =>
      apiFetch<AdminAuthResponse>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    verifyTwoFactor: (twoFactorToken: string, code: string) =>
      apiFetch<AdminAuthResponse>('/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ twoFactorToken, code }),
      }),
    refresh: (refreshToken: string) =>
      apiFetch<AdminAuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    requestMagicLink: (email: string) =>
      apiFetch<{ sent: boolean }>('/auth/magic-link/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    verifyMagicLink: (token: string) =>
      apiFetch<AdminAuthResponse>('/auth/magic-link/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    me: (token: string) =>
      apiFetch<{ _id: string; email: string; name: string; role: string }>('/auth/me', { token }),
  },
  admin: {
    stats: (token: string) => apiFetch<AdminStats>('/admin/stats', { token }),
    analytics: (token: string, days = 14) =>
      apiFetch<AdminAnalytics>(`/admin/analytics?days=${days}`, { token }),
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
  inventory: {
    alerts: (token: string, resolved?: boolean) => {
      const query = typeof resolved === 'boolean' ? `?resolved=${resolved}` : '';
      return apiFetch<unknown[]>(`/inventory/alerts${query}`, { token });
    },
    lowStock: (token: string, threshold?: number) => {
      const query = threshold ? `?threshold=${threshold}` : '';
      return apiFetch<unknown[]>(`/inventory/low-stock${query}`, { token });
    },
    checkAll: (token: string) =>
      apiFetch<{ message: string }>('/inventory/check-all', { method: 'POST', token }),
  },
  contact: {
    submit: (data: { name: string; email: string; message: string }) =>
      apiFetch<{ received: boolean }>('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
