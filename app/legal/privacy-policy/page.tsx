export const metadata = {
  title: 'Privacy Policy | ViralGoods',
  description: 'Learn how ViralGoods collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Privacy Policy</h1>
        <p className="mt-3 text-white/50">Last updated: Feb 08, 2026</p>
      </header>

      <div className="prose prose-invert max-w-none">
        <p>
          This Privacy Policy explains how ViralGoods collects, uses, and shares your information when you
          visit or make a purchase from our website.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>Contact information such as your name, email, and shipping address</li>
          <li>Payment details processed securely by our payment providers</li>
          <li>Order history, browsing behavior, and device data</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process orders, fulfill deliveries, and provide customer support</li>
          <li>To improve our products, services, and on-site experience</li>
          <li>To send updates about your order and, when opted-in, marketing messages</li>
        </ul>

        <h2>Sharing Your Information</h2>
        <p>
          We only share information with trusted service providers such as payment processors and shipping
          partners, and only as needed to complete your order.
        </p>

        <h2>Your Choices</h2>
        <p>
          You can update your preferences or request data deletion by contacting support. You may also opt out
          of marketing communications at any time.
        </p>

        <h2>Contact Us</h2>
        <p>Questions about this policy? Email us at support@viralgoods.com.</p>
      </div>
    </main>
  );
}
