import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryAlert extends Document {
  productId: string;
  productTitle: string;
  variantSku: string;
  type: 'low_stock' | 'out_of_stock' | 'auto_reorder';
  threshold: number;
  currentStock: number;
  reorderQuantity: number;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryAlertSchema = new Schema<IInventoryAlert>(
  {
    productId: { type: String, required: true, index: true },
    productTitle: { type: String, required: true },
    variantSku: { type: String, required: true },
    type: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'auto_reorder'],
      required: true,
    },
    threshold: { type: Number, default: 5 },
    currentStock: { type: Number, required: true },
    reorderQuantity: { type: Number, default: 50 },
    isResolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IInventoryAlert>('InventoryAlert', InventoryAlertSchema);
