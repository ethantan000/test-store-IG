import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-brand-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">VG</span>
              </div>
              <span className="font-display font-bold text-lg">ViralGoods</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Discover trending products curated for the modern lifestyle. Quality guaranteed.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-sm text-white/80 mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products/new-arrivals" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products/bestsellers" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Shop Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm text-white/80 mb-4 uppercase tracking-wider">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support/shipping-info" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/support/returns" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/support/faq" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support/contact-us" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm text-white/80 mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy-policy" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-of-service" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/refund-policy" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} ViralGoods. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy-policy" className="text-xs text-white/30 hover:text-white/70">Privacy</Link>
            <Link href="/legal/terms-of-service" className="text-xs text-white/30 hover:text-white/70">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
