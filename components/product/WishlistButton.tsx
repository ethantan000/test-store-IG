'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { useWishlistStore } from '@/store/wishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WishlistButton({ productId, className, size = 'md' }: WishlistButtonProps) {
  const { token, isAuthenticated } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const [loading, setLoading] = useState(false);

  const inWishlist = isInWishlist(productId);
  const sizeClass = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }[size];

  const handleToggle = async () => {
    if (!isAuthenticated() || !token) {
      toast.error('Sign in to save items to your wishlist');
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(token, productId);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(token, productId);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'transition-all hover:scale-110 active:scale-95',
        loading && 'opacity-50',
        className
      )}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={cn(sizeClass, inWishlist ? 'text-red-500' : 'text-white/40 hover:text-red-400')}
        fill={inWishlist ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
