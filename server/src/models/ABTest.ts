import mongoose, { Schema, Document } from 'mongoose';

export interface IABTestVariant {
  name: string;
  weight: number;
  impressions: number;
  conversions: number;
  config: Record<string, string>;
}

export interface IABTest extends Document {
  name: string;
  slug: string;
  isActive: boolean;
  variants: IABTestVariant[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ABTestVariantSchema = new Schema<IABTestVariant>({
  name: { type: String, required: true },
  weight: { type: Number, default: 50 },
  impressions: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  config: { type: Schema.Types.Mixed, default: {} },
});

const ABTestSchema = new Schema<IABTest>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    variants: [ABTestVariantSchema],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IABTest>('ABTest', ABTestSchema);
