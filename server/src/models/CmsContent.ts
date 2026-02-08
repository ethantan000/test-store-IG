import mongoose, { Schema, Document } from 'mongoose';

export interface ICmsContent extends Document {
  key: string;
  title: string;
  content: string;
  contentType: 'page' | 'banner' | 'announcement' | 'faq' | 'policy';
  isPublished: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const CmsContentSchema = new Schema<ICmsContent>(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    contentType: {
      type: String,
      enum: ['page', 'banner', 'announcement', 'faq', 'policy'],
      default: 'page',
    },
    isPublished: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model<ICmsContent>('CmsContent', CmsContentSchema);
