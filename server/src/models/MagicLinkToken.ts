import mongoose, { Schema, Document } from 'mongoose';

export interface IMagicLinkToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
}

const MagicLinkTokenSchema = new Schema<IMagicLinkToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IMagicLinkToken>('MagicLinkToken', MagicLinkTokenSchema);
