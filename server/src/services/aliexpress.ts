import { AliExpressProduct, ProductVariant } from '../types';

/**
 * AliExpress API Service
 *
 * Uses the AliExpress Affiliate API for product data retrieval.
 * Requires valid API credentials configured via environment variables.
 *
 * In production, replace the simulated responses with real API calls using
 * the AliExpress Open Platform SDK or REST endpoints.
 */

const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '';
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || '';
const TRACKING_ID = process.env.ALIEXPRESS_TRACKING_ID || '';

// Simulated product database for development/demo
const DEMO_PRODUCTS: Record<string, AliExpressProduct> = {
  '1005007231456': {
    productId: '1005007231456',
    title: 'RGB LED Desk Light with Remote Control',
    description:
      'Modern LED desk lamp with 16 color modes, remote control, USB powered. Perfect for gaming setups, bedrooms, and office décor. Energy efficient with adjustable brightness.',
    price: 8.42,
    originalPrice: 16.99,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
    ],
    variants: [
      { color: 'White', size: 'Standard', sku: 'LED-001-W', stock: 150, priceModifier: 0 },
      { color: 'Black', size: 'Standard', sku: 'LED-001-B', stock: 120, priceModifier: 0 },
      { color: 'White', size: 'Large', sku: 'LED-001-WL', stock: 80, priceModifier: 2.5 },
    ],
    shippingFrom: 'US',
    estimatedDelivery: '3-7 business days',
    rating: 4.7,
    orders: 12453,
  },
  '1005008912034': {
    productId: '1005008912034',
    title: 'Magnetic Levitation Globe with LED Base',
    description:
      'Floating magnetic globe with colorful LED lights. C-shaped base design, auto-rotating. Great educational gift and home office decoration.',
    price: 14.2,
    originalPrice: 29.99,
    images: [
      'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600',
    ],
    variants: [
      { color: 'Gold', size: '6 inch', sku: 'GLOBE-002-G6', stock: 60, priceModifier: 0 },
      { color: 'Silver', size: '6 inch', sku: 'GLOBE-002-S6', stock: 45, priceModifier: 0 },
      { color: 'Gold', size: '8 inch', sku: 'GLOBE-002-G8', stock: 30, priceModifier: 4.3 },
    ],
    shippingFrom: 'US',
    estimatedDelivery: '3-7 business days',
    rating: 4.5,
    orders: 8721,
  },
  '1005006443221': {
    productId: '1005006443221',
    title: 'Mini Portable Thermal Printer',
    description:
      'Wireless Bluetooth thermal printer for photos, labels, notes. No ink required, connects to phone app. Compact pocket-sized design.',
    price: 11.3,
    originalPrice: 24.99,
    images: [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600',
    ],
    variants: [
      { color: 'White', size: 'Standard', sku: 'PRINT-003-W', stock: 200, priceModifier: 0 },
      { color: 'Pink', size: 'Standard', sku: 'PRINT-003-P', stock: 150, priceModifier: 0 },
      { color: 'Blue', size: 'Standard', sku: 'PRINT-003-BL', stock: 100, priceModifier: 0 },
    ],
    shippingFrom: 'US',
    estimatedDelivery: '3-7 business days',
    rating: 4.3,
    orders: 15632,
  },
  '1005009122347': {
    productId: '1005009122347',
    title: 'Crystal Ball Night Light with Wood Base',
    description:
      'Galaxy crystal ball lamp with wooden base. 3D laser engraved solar system, USB powered LED. Mesmerizing desk ornament and night light.',
    price: 6.8,
    originalPrice: 14.99,
    images: [
      'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?w=600',
    ],
    variants: [
      { color: 'Galaxy', size: '60mm', sku: 'CRYSTAL-004-G60', stock: 300, priceModifier: 0 },
      { color: 'Galaxy', size: '80mm', sku: 'CRYSTAL-004-G80', stock: 180, priceModifier: 3.1 },
      { color: 'Solar System', size: '60mm', sku: 'CRYSTAL-004-S60', stock: 250, priceModifier: 0.5 },
    ],
    shippingFrom: 'US',
    estimatedDelivery: '3-7 business days',
    rating: 4.8,
    orders: 23891,
  },
  '1005007998800': {
    productId: '1005007998800',
    title: 'Smart Temperature Control Mug Warmer',
    description:
      'Electric mug warmer pad with 3 temperature settings. Keeps coffee/tea at perfect temperature. Auto shut-off, LED indicator, sleek design.',
    price: 9.15,
    originalPrice: 19.99,
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
    ],
    variants: [
      { color: 'White', size: 'Standard', sku: 'MUG-005-W', stock: 180, priceModifier: 0 },
      { color: 'Black', size: 'Standard', sku: 'MUG-005-B', stock: 220, priceModifier: 0 },
    ],
    shippingFrom: 'US',
    estimatedDelivery: '3-7 business days',
    rating: 4.4,
    orders: 9845,
  },
};

/**
 * Extract AliExpress product ID from a URL or return the ID directly.
 */
function extractProductId(input: string): string {
  const urlMatch = input.match(/\/item\/(\d+)\.html/);
  if (urlMatch) return urlMatch[1];

  const idMatch = input.match(/^(\d{10,})$/);
  if (idMatch) return idMatch[1];

  return input.trim();
}

/**
 * Fetch a single product by ID or URL.
 *
 * When ALIEXPRESS_APP_KEY is configured, this will call the real API.
 * Otherwise, returns from the demo product database.
 */
export async function fetchProduct(idOrUrl: string): Promise<AliExpressProduct | null> {
  const productId = extractProductId(idOrUrl);

  if (APP_KEY && APP_SECRET) {
    // Production: Call real AliExpress Affiliate API
    try {
      const apiUrl = 'https://api-sg.aliexpress.com/sync';
      const params = new URLSearchParams({
        app_key: APP_KEY,
        method: 'aliexpress.affiliate.productdetail.get',
        product_ids: productId,
        tracking_id: TRACKING_ID,
        target_currency: 'USD',
        target_language: 'EN',
        ship_to_country: 'US',
        fields: 'product_id,product_title,product_main_image_url,product_small_image_urls,target_sale_price,target_original_price,evaluate_rate,ship_to_days',
      });

      const response = await fetch(`${apiUrl}?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('AliExpress API error:', response.status);
        return null;
      }

      const data = await response.json();
      const product = data?.aliexpress_affiliate_productdetail_get_resp?.result?.products?.product?.[0];

      if (!product) return null;

      return {
        productId: product.product_id,
        title: product.product_title,
        description: product.product_title,
        price: parseFloat(product.target_sale_price || '0'),
        originalPrice: parseFloat(product.target_original_price || '0'),
        images: [
          product.product_main_image_url,
          ...(product.product_small_image_urls?.string || []),
        ],
        variants: [
          { color: 'Default', size: 'Standard', sku: `AE-${productId}`, stock: 100, priceModifier: 0 },
        ],
        shippingFrom: 'US',
        estimatedDelivery: `${product.ship_to_days || '5-12'} business days`,
        rating: parseFloat(product.evaluate_rate || '4.5'),
        orders: 0,
      };
    } catch (error) {
      console.error('AliExpress API fetch error:', error);
      return null;
    }
  }

  // Development: Return from demo database
  return DEMO_PRODUCTS[productId] || null;
}

/**
 * Search products by keyword.
 *
 * Filters to US-shipped items only.
 */
export async function searchProducts(query: string, page = 1): Promise<AliExpressProduct[]> {
  if (APP_KEY && APP_SECRET) {
    try {
      const apiUrl = 'https://api-sg.aliexpress.com/sync';
      const params = new URLSearchParams({
        app_key: APP_KEY,
        method: 'aliexpress.affiliate.product.query',
        keywords: query,
        tracking_id: TRACKING_ID,
        target_currency: 'USD',
        target_language: 'EN',
        ship_to_country: 'US',
        page_no: String(page),
        page_size: '20',
        sort: 'SALE_PRICE_ASC',
        fields: 'product_id,product_title,product_main_image_url,target_sale_price,target_original_price,evaluate_rate',
      });

      const response = await fetch(`${apiUrl}?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) return [];

      const data = await response.json();
      const products = data?.aliexpress_affiliate_product_query_resp?.result?.products?.product || [];

      return products.map((p: Record<string, string>) => ({
        productId: p.product_id,
        title: p.product_title,
        description: p.product_title,
        price: parseFloat(p.target_sale_price || '0'),
        originalPrice: parseFloat(p.target_original_price || '0'),
        images: [p.product_main_image_url],
        variants: [
          { color: 'Default', size: 'Standard', sku: `AE-${p.product_id}`, stock: 100, priceModifier: 0 },
        ],
        shippingFrom: 'US',
        estimatedDelivery: '5-12 business days',
        rating: parseFloat(p.evaluate_rate || '4.5'),
        orders: 0,
      }));
    } catch (error) {
      console.error('AliExpress search error:', error);
      return [];
    }
  }

  // Development: Filter demo products by query
  const q = query.toLowerCase();
  return Object.values(DEMO_PRODUCTS).filter(
    (p) =>
      p.shippingFrom === 'US' &&
      (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  );
}
