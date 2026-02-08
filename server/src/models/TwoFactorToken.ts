import mongoose, { Schema, Document } from 'mongoose';

export interface ITwoFactorToken extends Document {
  userId: mongoose.Types.ObjectId;
  codeHash: string;
  expiresAt: Date;
  usedAt?: Date;
}

const TwoFactorTokenSchema = new Schema<ITwoFactorToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ITwoFactorToken>('TwoFactorToken', TwoFactorTokenSchema);
