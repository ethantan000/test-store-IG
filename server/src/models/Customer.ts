import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ICustomer extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  shippingAddresses: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }[];
  wishlist: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    name: { type: String, required: true },
    phone: { type: String },
    shippingAddresses: [
      {
        label: { type: String, default: 'Home' },
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, default: 'US' },
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: String }],
  },
  { timestamps: true }
);

CustomerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

CustomerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
