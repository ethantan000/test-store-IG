import mongoose, { Schema, Document } from 'mongoose';

export interface IAbTest extends Document {
  name: string;
  key: string;
  variants: {
    id: string;
    name: string;
    weight: number;
    content: Record<string, unknown>;
  }[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  metrics: {
    variantId: string;
    impressions: number;
    conversions: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AbTestSchema = new Schema<IAbTest>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    variants: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        weight: { type: Number, default: 50 },
        content: { type: Schema.Types.Mixed, default: {} },
      },
    ],
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    metrics: [
      {
        variantId: { type: String, required: true },
        impressions: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IAbTest>('AbTest', AbTestSchema);
