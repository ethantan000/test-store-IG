'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { token, user, isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await api.reviews.create(token || '', {
        productId,
        rating,
        title,
        body,
        userName: isAuthenticated() ? user!.name : guestName,
      });
      toast.success('Review submitted! It will appear after approval.');
      setSubmitted(true);
      onReviewSubmitted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="font-medium">Thank you for your review!</p>
        <p className="text-sm text-white/50 mt-1">Your review will be visible after it is approved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h3 className="font-display font-bold text-lg">Write a Review</h3>

      <div>
        <label className="text-sm text-white/70 mb-2 block">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <svg
                className={cn(
                  'w-7 h-7 transition-colors',
                  star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-white/20'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {!isAuthenticated() && (
        <input
          type="text"
          placeholder="Your Name"
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="input-field"
        />
      )}

      <input
        type="text"
        placeholder="Review Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-field"
      />

      <textarea
        placeholder="Tell others about your experience..."
        required
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="input-field resize-none"
      />

      <button type="submit" disabled={loading || rating === 0} className="btn-primary w-full">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
