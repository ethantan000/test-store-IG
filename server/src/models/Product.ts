import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  color: string;
  size: string;
  sku: string;
  stock: number;
  priceModifier: number;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  comparePrice: number;
  costPrice: number;
  images: string[];
  variants: IProductVariant[];
  isActive: boolean;
  isDropship: boolean;
  aliexpressId?: string;
  shippingFrom: string;
  estimatedDelivery: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  color: { type: String, required: true },
  size: { type: String, required: true },
  sku: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  priceModifier: { type: Number, default: 0 },
});

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    brand: { type: String, default: 'ViralGoods' },
    category: { type: String, default: 'general', index: true },
    price: { type: Number, required: true },
    comparePrice: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    images: [{ type: String }],
    variants: [ProductVariantSchema],
    isActive: { type: Boolean, default: true, index: true },
    isDropship: { type: Boolean, default: false },
    aliexpressId: { type: String, sparse: true },
    shippingFrom: { type: String, default: 'US' },
    estimatedDelivery: { type: String, default: '3-7 business days' },
    tags: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
