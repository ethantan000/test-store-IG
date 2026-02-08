export const metadata = {
  title: 'Returns & Refunds | ViralGoods Support',
  description: 'Learn about our returns, exchanges, and refund policies.',
};

export default function ReturnsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Returns & Refunds</h1>
        <p className="mt-3 text-white/50">We want you to love your purchase. Here is how returns work.</p>
      </header>

      <div className="prose prose-invert max-w-none">
        <h2>Return Window</h2>
        <p>We accept returns within 30 days of delivery for unused items in their original packaging.</p>

        <h2>Refund Timeline</h2>
        <p>
          Once we receive and inspect your return, refunds are processed within 5-7 business days to the
          original payment method.
        </p>

        <h2>Exchanges</h2>
        <p>
          Need a different size or color? Contact our support team and we’ll help arrange an exchange
          if the product is available.
        </p>

        <h2>Non-Returnable Items</h2>
        <p>
          Items marked as final sale, gift cards, and downloadable products are not eligible for return.
        </p>
      </div>
    </main>
  );
}
