import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Product from './models/Product';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/viralgoods';

const seedProducts = [
  {
    title: 'HypeWidget Pro',
    slug: 'hypewidget-pro',
    description:
      'The ultimate desk gadget that combines a wireless charger, Bluetooth speaker, and ambient LED lighting in one sleek device. Perfect for your workspace or gaming setup.',
    brand: 'ViralGoods',
    category: 'gadgets',
    price: 49.99,
    comparePrice: 79.99,
    costPrice: 18.5,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    ],
    variants: [
      { color: 'Midnight Black', size: 'Standard', sku: 'HW-PRO-BLK', stock: 50, priceModifier: 0 },
      { color: 'Arctic White', size: 'Standard', sku: 'HW-PRO-WHT', stock: 35, priceModifier: 0 },
      { color: 'Cosmic Purple', size: 'Standard', sku: 'HW-PRO-PUR', stock: 20, priceModifier: 5 },
    ],
    isActive: true,
    isDropship: false,
    shippingFrom: 'US',
    estimatedDelivery: '3-5 business days',
    tags: ['gadget', 'wireless', 'speaker', 'LED', 'trending'],
    rating: 4.8,
    reviewCount: 342,
  },
  {
    title: 'GlowRing Desk Lamp',
    slug: 'glowring-desk-lamp',
    description:
      'Modern LED ring light desk lamp with 5 brightness levels and 3 color temperatures. USB-C powered with a flexible gooseneck arm.',
    brand: 'ViralGoods',
    category: 'lighting',
    price: 34.99,
    comparePrice: 54.99,
    costPrice: 12.0,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
    ],
    variants: [
      { color: 'White', size: 'Standard', sku: 'GR-LAMP-WHT', stock: 80, priceModifier: 0 },
      { color: 'Black', size: 'Standard', sku: 'GR-LAMP-BLK', stock: 60, priceModifier: 0 },
      { color: 'Rose Gold', size: 'Standard', sku: 'GR-LAMP-RG', stock: 25, priceModifier: 3 },
    ],
    isActive: true,
    isDropship: false,
    shippingFrom: 'US',
    estimatedDelivery: '3-5 business days',
    tags: ['lamp', 'LED', 'desk', 'lighting', 'trending'],
    rating: 4.6,
    reviewCount: 189,
  },
  {
    title: 'Crystal Galaxy Night Light',
    slug: 'crystal-galaxy-night-light',
    description:
      'Mesmerizing 3D laser-engraved crystal ball with a solid wood base and USB-powered LED. Features the solar system design that creates an ethereal glow.',
    brand: 'ViralGoods',
    category: 'lighting',
    price: 29.99,
    comparePrice: 44.99,
    costPrice: 6.8,
    images: [
      'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?w=600',
    ],
    variants: [
      { color: 'Galaxy', size: '60mm', sku: 'CG-NL-G60', stock: 120, priceModifier: 0 },
      { color: 'Galaxy', size: '80mm', sku: 'CG-NL-G80', stock: 75, priceModifier: 8 },
      { color: 'Solar System', size: '60mm', sku: 'CG-NL-S60', stock: 90, priceModifier: 2 },
    ],
    isActive: true,
    isDropship: true,
    aliexpressId: '1005009122347',
    shippingFrom: 'US',
    estimatedDelivery: '3-7 business days',
    tags: ['night light', 'crystal', 'galaxy', 'gift', 'trending'],
    rating: 4.8,
    reviewCount: 567,
  },
  {
    title: 'Smart Mug Warmer',
    slug: 'smart-mug-warmer',
    description:
      'Keep your coffee or tea at the perfect temperature with this electric mug warmer. Features 3 heat settings, auto shut-off safety, and a premium non-slip base.',
    brand: 'ViralGoods',
    category: 'kitchen',
    price: 24.99,
    comparePrice: 39.99,
    costPrice: 9.15,
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
    ],
    variants: [
      { color: 'White', size: 'Standard', sku: 'MW-STD-WHT', stock: 200, priceModifier: 0 },
      { color: 'Black', size: 'Standard', sku: 'MW-STD-BLK', stock: 180, priceModifier: 0 },
    ],
    isActive: true,
    isDropship: true,
    aliexpressId: '1005007998800',
    shippingFrom: 'US',
    estimatedDelivery: '3-7 business days',
    tags: ['mug warmer', 'kitchen', 'coffee', 'trending'],
    rating: 4.4,
    reviewCount: 234,
  },
  {
    title: 'Levitating Globe Display',
    slug: 'levitating-globe-display',
    description:
      'Floating magnetic globe with mesmerizing LED lights on a C-shaped base. Auto-rotating and gravity-defying — a perfect conversation piece for any room.',
    brand: 'ViralGoods',
    category: 'decor',
    price: 59.99,
    comparePrice: 89.99,
    costPrice: 14.2,
    images: [
      'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600',
    ],
    variants: [
      { color: 'Gold Base', size: '6 inch', sku: 'LG-GOLD-6', stock: 40, priceModifier: 0 },
      { color: 'Silver Base', size: '6 inch', sku: 'LG-SILV-6', stock: 30, priceModifier: 0 },
      { color: 'Gold Base', size: '8 inch', sku: 'LG-GOLD-8', stock: 15, priceModifier: 15 },
    ],
    isActive: true,
    isDropship: true,
    aliexpressId: '1005008912034',
    shippingFrom: 'US',
    estimatedDelivery: '3-7 business days',
    tags: ['globe', 'levitating', 'magnetic', 'decor', 'trending'],
    rating: 4.5,
    reviewCount: 412,
  },
  {
    title: 'Mini Portable Photo Printer',
    slug: 'mini-portable-photo-printer',
    description:
      'Pocket-sized Bluetooth thermal printer for photos, labels, and notes. No ink required, wireless connection to your phone app. Print memories anywhere.',
    brand: 'ViralGoods',
    category: 'gadgets',
    price: 39.99,
    comparePrice: 64.99,
    costPrice: 11.3,
    images: [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600',
    ],
    variants: [
      { color: 'White', size: 'Standard', sku: 'MPP-WHT', stock: 100, priceModifier: 0 },
      { color: 'Pink', size: 'Standard', sku: 'MPP-PNK', stock: 75, priceModifier: 0 },
      { color: 'Sky Blue', size: 'Standard', sku: 'MPP-BLU', stock: 60, priceModifier: 0 },
    ],
    isActive: true,
    isDropship: true,
    aliexpressId: '1005006443221',
    shippingFrom: 'US',
    estimatedDelivery: '3-7 business days',
    tags: ['printer', 'portable', 'bluetooth', 'photo', 'trending'],
    rating: 4.3,
    reviewCount: 178,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = new User({
      email: process.env.ADMIN_EMAIL || 'admin@viralgoods.com',
      password: process.env.ADMIN_PASSWORD || 'admin12345',
      role: 'owner',
      name: 'Store Admin',
    });
    await admin.save();
    console.log('Admin user created:', admin.email);

    // Create products
    await Product.insertMany(seedProducts);
    console.log(`${seedProducts.length} products created`);

    console.log('\nSeed completed successfully!');
    console.log('Admin login: admin@viralgoods.com / admin12345');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
