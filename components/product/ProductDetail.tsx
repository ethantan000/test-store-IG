'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { Product, ProductVariant } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import { formatPrice, getDiscountPercent, cn } from '@/lib/utils';
import WishlistButton from '@/components/product/WishlistButton';
import { trackMetaAddToCart } from '@/components/analytics/MetaPixel';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const discount = getDiscountPercent(product.price, product.comparePrice);
  const variantPrice = product.price + (selectedVariant?.priceModifier || 0);
  const inStock = selectedVariant?.stock > 0;

  // Get unique colors and sizes
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = [...new Set(product.variants.map((v) => v.size))];

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant || !inStock) return;

    addItem(product, selectedVariant, quantity);
    openCart();
    toast.success(`${product.title} added to cart!`);
    trackEvent('add_to_cart', 'ecommerce', product.title, variantPrice);
    trackMetaAddToCart(product._id, variantPrice, product.title);

    // Confetti celebration
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#0070f3', '#a855f7', '#6b21a8'],
    });
  }, [product, selectedVariant, quantity, inStock, addItem, openCart]);

  const selectColor = (color: string) => {
    const variant = product.variants.find(
      (v) => v.color === color && (sizes.length <= 1 || v.size === selectedVariant?.size)
    );
    if (variant) setSelectedVariant(variant);
  };

  const selectSize = (size: string) => {
    const variant = product.variants.find(
      (v) => v.size === size && (colors.length <= 1 || v.color === selectedVariant?.color)
    );
    if (variant) setSelectedVariant(variant);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Images */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={`${product.title} - Image ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  No image available
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {discount > 0 && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-lg bg-accent text-white text-sm font-bold shadow-accent">
                -{discount}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  'relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                  i === selectedImage
                    ? 'border-brand shadow-brand'
                    : 'border-white/10 hover:border-white/30'
                )}
              >
                <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          <p className="text-sm text-accent-light font-medium uppercase tracking-wider mb-2">
            {product.brand}
          </p>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-white">
              {product.title}
            </h1>
            <WishlistButton productId={product._id} size="lg" className="mt-2 flex-shrink-0" />
          </div>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex" role="img" aria-label={`${product.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-white/20'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-white/50">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold gradient-text">{formatPrice(variantPrice)}</span>
          {product.comparePrice > product.price && (
            <span className="text-lg text-white/40 line-through">
              {formatPrice(product.comparePrice + (selectedVariant?.priceModifier || 0))}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-white/70 leading-relaxed">{product.description}</p>

        {/* Color Selection */}
        {colors.length > 1 && (
          <div>
            <label className="text-sm font-medium text-white/80 mb-2 block">
              Color: <span className="text-white">{selectedVariant?.color}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => selectColor(color)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                    selectedVariant?.color === color
                      ? 'bg-brand/20 border-brand text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {sizes.length > 1 && (
          <div>
            <label className="text-sm font-medium text-white/80 mb-2 block">
              Size: <span className="text-white">{selectedVariant?.size}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => selectSize(size)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                    selectedVariant?.size === size
                      ? 'bg-brand/20 border-brand text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity & Add to Cart */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="btn-primary flex-1"
          >
            {inStock ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>

        {/* Stock indicator */}
        {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 10 && (
          <p className="text-sm text-amber-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Only {selectedVariant.stock} left in stock!
          </p>
        )}

        {/* Trust signals */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            {product.estimatedDelivery}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Secure Checkout
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            30-Day Returns
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Ships from US
          </div>
        </div>
      </div>
    </div>
  );
}
