import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface ProductVariant {
  color: string;
  size: string;
  sku: string;
  stock: number;
  priceModifier: number;
}

export interface AliExpressProduct {
  productId: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  variants: ProductVariant[];
  shippingFrom: string;
  estimatedDelivery: string;
  rating: number;
  orders: number;
}

export interface ImportRequest {
  productUrl?: string;
  productId?: string;
  searchQuery?: string;
  customTitle?: string;
  customDescription?: string;
  brand?: string;
  markupMultiplier?: number;
  category?: string;
}
