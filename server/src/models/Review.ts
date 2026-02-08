import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: String, required: true, index: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 2000 },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ReviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
