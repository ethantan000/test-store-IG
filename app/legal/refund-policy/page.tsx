export const metadata = {
  title: 'Refund Policy | ViralGoods',
  description: 'Read the ViralGoods refund policy and eligibility requirements.',
};

export default function RefundPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Refund Policy</h1>
        <p className="mt-3 text-white/50">Last updated: Feb 08, 2026</p>
      </header>

      <div className="prose prose-invert max-w-none">
        <h2>Eligibility</h2>
        <p>
          Refunds are available for eligible items returned within 30 days of delivery in original, unused
          condition with all packaging intact.
        </p>

        <h2>Refund Process</h2>
        <p>
          Once your return is received and inspected, we will notify you of approval. Approved refunds are
          processed back to your original payment method within 5-7 business days.
        </p>

        <h2>Shipping Costs</h2>
        <p>
          Original shipping fees are non-refundable. Return shipping costs are the responsibility of the
          customer unless the item is defective or damaged.
        </p>

        <h2>Non-Refundable Items</h2>
        <p>Gift cards, final-sale items, and downloadable products are not eligible for refunds.</p>

        <h2>Contact Support</h2>
        <p>Need help with a return? Contact us at support@viralgoods.com.</p>
      </div>
    </main>
  );
}
