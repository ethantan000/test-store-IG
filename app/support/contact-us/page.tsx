import ContactForm from '@/components/support/ContactForm';

export const metadata = {
  title: 'Contact Us | ViralGoods Support',
  description: 'Reach out to the ViralGoods team with questions about your order.',
};

export default function ContactUsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Contact Us</h1>
        <p className="mt-3 text-white/50">We usually respond within 1 business day.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
        <aside className="card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Support Hours</h3>
            <p className="text-white/50 mt-2">Monday - Friday, 9am - 5pm PST</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Email</h3>
            <p className="text-white/50 mt-2">support@viralgoods.com</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Order Updates</h3>
            <p className="text-white/50 mt-2">Track orders in your account dashboard.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
