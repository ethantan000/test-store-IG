export const metadata = {
  title: 'Terms of Service | ViralGoods',
  description: 'Review the terms and conditions that apply to using ViralGoods.',
};

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Terms of Service</h1>
        <p className="mt-3 text-white/50">Last updated: Feb 08, 2026</p>
      </header>

      <div className="prose prose-invert max-w-none">
        <p>
          These Terms of Service govern your use of the ViralGoods website and services. By accessing our
          site, you agree to these terms.
        </p>

        <h2>Eligibility</h2>
        <p>You must be at least 18 years old or have permission from a legal guardian to use our services.</p>

        <h2>Orders & Payments</h2>
        <p>
          All orders are subject to acceptance and availability. We reserve the right to refuse or cancel
          any order at our discretion. Prices and promotions may change at any time.
        </p>

        <h2>User Conduct</h2>
        <p>
          You agree not to misuse the website or attempt to gain unauthorized access to our systems. Any
          fraudulent activity will result in immediate termination of access.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          ViralGoods is not liable for indirect, incidental, or consequential damages arising from use of
          our services. Our total liability is limited to the amount you paid for the product.
        </p>

        <h2>Changes to Terms</h2>
        <p>We may update these terms periodically. Continued use of the site constitutes acceptance.</p>
      </div>
    </main>
  );
}
