export const metadata = {
  title: 'FAQ | ViralGoods Support',
  description: 'Answers to common questions about orders, shipping, and returns.',
};

const FAQS = [
  {
    question: 'When will my order ship?',
    answer:
      'Most orders ship within 1-2 business days. You will receive a confirmation email once your order is on the way.',
  },
  {
    question: 'Do you offer free shipping?',
    answer:
      'Yes! We offer free standard shipping on orders over $50 within the continental US.',
  },
  {
    question: 'Can I change or cancel my order?',
    answer:
      'Please contact support within 2 hours of placing your order. We can help update or cancel orders before they ship.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'We accept returns within 30 days of delivery for eligible products in their original condition.',
  },
  {
    question: 'How do I track my order?',
    answer:
      'Once your order ships, we send a tracking link by email. You can also find updates in your account page.',
  },
];

export default function FaqPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Frequently Asked Questions</h1>
        <p className="mt-3 text-white/50">
          Quick answers to the most common questions about ViralGoods orders, shipping, and returns.
        </p>
      </header>

      <div className="space-y-4">
        {FAQS.map((faq) => (
          <details key={faq.question} className="card p-5">
            <summary className="cursor-pointer font-semibold text-white/90">{faq.question}</summary>
            <p className="mt-3 text-white/60 leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
