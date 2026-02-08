'use client';

import { useState, useEffect } from 'react';
import { api, Review, ReviewsResponse } from '@/lib/api';
import { useCustomerStore } from '@/store/customer';
import { formatDate } from '@/lib/utils';

interface ProductReviewsProps {
  productId: string;
}

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          className={`w-5 h-5 ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(star)}
        >
          <svg
            viewBox="0 0 20 20"
            fill={(hover || rating) >= star ? '#f59e0b' : '#374151'}
            className="w-full h-full"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { token, customer } = useCustomerStore();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });
  const [error, setError] = useState('');

  const loadReviews = () => {
    api.reviews
      .getForProduct(productId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setError('');
    try {
      await api.reviews.create(token, { productId, ...form });
      setShowForm(false);
      setForm({ rating: 5, title: '', body: '' });
      loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const result = await api.reviews.markHelpful(reviewId);
      setData((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map((r) =>
                r._id === reviewId ? { ...r, helpful: result.helpful } : r
              ),
            }
          : prev
      );
    } catch {}
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-white/5 rounded-xl" />;
  }

  const totalReviews = data?.pagination.total || 0;
  const breakdown = data?.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-display font-bold mb-6">
        Customer Reviews {totalReviews > 0 && `(${totalReviews})`}
      </h2>

      {/* Rating Breakdown */}
      {totalReviews > 0 && (
        <div className="card p-6 mb-6">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = breakdown[star] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-right text-white/60">{star}</span>
                  <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-white/40">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {customer && !showForm && (
        <button onClick={() => setShowForm(true)} className="btn-secondary mb-6">
          Write a Review
        </button>
      )}

      {!customer && (
        <p className="text-sm text-white/40 mb-6">
          <a href="/account" className="text-brand-light hover:underline">Sign in</a> to write a review.
        </p>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <h3 className="font-display font-bold">Write Your Review</h3>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Rating</label>
            <StarRating rating={form.rating} interactive onChange={(r) => setForm({ ...form, rating: r })} />
          </div>
          <input
            type="text"
            placeholder="Review title"
            required
            maxLength={200}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="Share your experience..."
            required
            maxLength={2000}
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="input-field resize-none"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {data?.reviews.map((review) => (
          <div key={review._id} className="card p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="font-semibold text-sm">{review.title}</span>
                </div>
                <p className="text-xs text-white/40 mt-1">
                  {review.customerName}
                  {review.isVerifiedPurchase && (
                    <span className="ml-2 text-green-400">Verified Purchase</span>
                  )}
                  <span className="ml-2">{formatDate(review.createdAt)}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70 mt-2">{review.body}</p>
            <button
              onClick={() => handleHelpful(review._id)}
              className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Helpful ({review.helpful})
            </button>
          </div>
        ))}
      </div>

      {totalReviews === 0 && (
        <p className="text-center text-white/40 py-8">No reviews yet. Be the first to review this product!</p>
      )}
    </div>
  );
}
