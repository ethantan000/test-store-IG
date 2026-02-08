import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryAlert extends Document {
  productId: mongoose.Types.ObjectId;
  variantSku: string;
  type: 'low_stock' | 'out_of_stock' | 'reorder';
  threshold: number;
  currentStock: number;
  isResolved: boolean;
  autoReorder: boolean;
  reorderQuantity: number;
  notifiedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryAlertSchema = new Schema<IInventoryAlert>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, required: true },
    type: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'reorder'],
      required: true,
    },
    threshold: { type: Number, default: 10 },
    currentStock: { type: Number, required: true },
    isResolved: { type: Boolean, default: false },
    autoReorder: { type: Boolean, default: false },
    reorderQuantity: { type: Number, default: 50 },
    notifiedAt: { type: Date },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

InventoryAlertSchema.index({ productId: 1, variantSku: 1, isResolved: 1 });

export default mongoose.model<IInventoryAlert>('InventoryAlert', InventoryAlertSchema);
