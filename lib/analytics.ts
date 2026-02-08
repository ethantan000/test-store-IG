'use client';

// Google Analytics (gtag.js)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export function gtagPageView(url: string): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.('config', GA_MEASUREMENT_ID, { page_path: url });
}

export function gtagEvent(action: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.('event', action, params);
}

// Meta Pixel (Facebook Pixel)
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

export function fbPixelEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  w.fbq?.('track', eventName, params);
}

// Convenience wrappers for common e-commerce events
export const analytics = {
  pageView: (url: string) => {
    gtagPageView(url);
    fbPixelEvent('PageView');
  },

  viewProduct: (product: { id: string; name: string; price: number; category: string }) => {
    gtagEvent('view_item', {
      currency: 'USD',
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price }],
    });
    fbPixelEvent('ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'USD',
    });
  },

  addToCart: (product: { id: string; name: string; price: number; quantity: number }) => {
    gtagEvent('add_to_cart', {
      currency: 'USD',
      value: product.price * product.quantity,
      items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: product.quantity }],
    });
    fbPixelEvent('AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price * product.quantity,
      currency: 'USD',
    });
  },

  beginCheckout: (value: number, items: { id: string; name: string; price: number; quantity: number }[]) => {
    gtagEvent('begin_checkout', {
      currency: 'USD',
      value,
      items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
    });
    fbPixelEvent('InitiateCheckout', {
      content_ids: items.map((i) => i.id),
      num_items: items.length,
      value,
      currency: 'USD',
    });
  },

  purchase: (data: { transactionId: string; value: number; items: { id: string; name: string; price: number; quantity: number }[] }) => {
    gtagEvent('purchase', {
      transaction_id: data.transactionId,
      currency: 'USD',
      value: data.value,
      items: data.items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
    });
    fbPixelEvent('Purchase', {
      content_ids: data.items.map((i) => i.id),
      content_type: 'product',
      value: data.value,
      currency: 'USD',
    });
  },

  search: (query: string) => {
    gtagEvent('search', { search_term: query });
    fbPixelEvent('Search', { search_string: query });
  },

  addToWishlist: (product: { id: string; name: string; price: number }) => {
    gtagEvent('add_to_wishlist', {
      currency: 'USD',
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, price: product.price }],
    });
    fbPixelEvent('AddToWishlist', {
      content_ids: [product.id],
      content_name: product.name,
      value: product.price,
      currency: 'USD',
    });
  },
};
