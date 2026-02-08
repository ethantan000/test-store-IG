export const metadata = {
  title: 'Shipping Info | ViralGoods Support',
  description: 'Shipping options, delivery estimates, and rates for ViralGoods orders.',
};

export default function ShippingInfoPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Shipping Information</h1>
        <p className="mt-3 text-white/50">Everything you need to know about delivery times and shipping rates.</p>
      </header>

      <div className="prose prose-invert max-w-none">
        <h2>Shipping Rates</h2>
        <ul>
          <li>Standard Shipping (3-7 business days): $5.99</li>
          <li>Free Standard Shipping: Orders over $50</li>
          <li>Expedited Shipping (2-3 business days): $12.99</li>
        </ul>

        <h2>Processing Time</h2>
        <p>
          Orders are processed within 1-2 business days. You will receive a confirmation email with tracking
          details once your package is on the way.
        </p>

        <h2>Delivery Estimates</h2>
        <p>
          Delivery estimates begin once your order ships. We partner with trusted carriers to get your items
          to you as quickly as possible. Rural locations may take an extra 1-2 days.
        </p>

        <h2>International Shipping</h2>
        <p>
          Currently, ViralGoods ships within the continental United States only. We are working on expanding
          to additional regions soon.
        </p>
      </div>
    </main>
  );
}
