'use client';

import { useState, useEffect } from 'react';
import { api, Review, ReviewsResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ReviewListProps {
  productId: string;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(sizeClass, star <= rating ? 'text-yellow-400' : 'text-white/20')}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-white/60">{stars}★</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-8 text-white/40 text-right">{count}</span>
    </div>
  );
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reviews
      .forProduct(productId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const handleHelpful = async (reviewId: string) => {
    try {
      const updated = await api.reviews.helpful(reviewId);
      if (data) {
        setData({
          ...data,
          reviews: data.reviews.map((r) => (r._id === reviewId ? updated : r)),
        });
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/50">No reviews yet. Be the first to leave a review!</p>
      </div>
    );
  }

  const { reviews, aggregation } = data;

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold gradient-text">{aggregation.average.toFixed(1)}</p>
            <StarRating rating={Math.round(aggregation.average)} size="md" />
            <p className="text-sm text-white/50 mt-1">{aggregation.total} reviews</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar
              key={stars}
              stars={stars}
              count={aggregation.distribution[stars] || 0}
              total={aggregation.total}
            />
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="card p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={review.rating} />
                  {review.isVerifiedPurchase && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-sm">{review.title}</h4>
              </div>
              <span className="text-xs text-white/40">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-white/70 mb-3">{review.body}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">by {review.userName}</span>
              <button
                onClick={() => handleHelpful(review._id)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48a4.53 4.53 0 01-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                </svg>
                Helpful ({review.helpfulCount})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
