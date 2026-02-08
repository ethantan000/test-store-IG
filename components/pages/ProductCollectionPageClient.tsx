'use client';

import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionDiv';
import ProductCard from '@/components/product/ProductCard';
import { ProductsResponse } from '@/lib/api';

interface ProductCollectionPageClientProps {
  title: string;
  description: string;
  initialProducts: ProductsResponse;
}

export default function ProductCollectionPageClient({
  title,
  description,
  initialProducts,
}: ProductCollectionPageClientProps) {
  const products = initialProducts.products;

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-display font-bold">{title}</h1>
            <p className="mt-3 text-white/50 max-w-2xl">{description}</p>
          </div>
        </FadeIn>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg">No products available yet.</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <StaggerItem key={product._id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
