import mongoose, { Schema, Document } from 'mongoose';

export interface ICmsContent extends Document {
  slug: string;
  type: 'page' | 'banner' | 'announcement' | 'faq' | 'policy';
  title: string;
  body: string;
  metadata: Record<string, string>;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CmsContentSchema = new Schema<ICmsContent>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['page', 'banner', 'announcement', 'faq', 'policy'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ICmsContent>('CmsContent', CmsContentSchema);
