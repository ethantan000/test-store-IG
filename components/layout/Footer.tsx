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
                <Link href="/products?category=gadgets" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Gadgets
                </Link>
              </li>
              <li>
                <Link href="/products?category=lighting" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Lighting
                </Link>
              </li>
              <li>
                <Link href="/products?category=decor" className="text-sm text-white/50 hover:text-accent-light transition-colors">
                  Decor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm text-white/80 mb-4 uppercase tracking-wider">Support</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-white/50">Shipping Policy</span>
              </li>
              <li>
                <span className="text-sm text-white/50">Returns & Refunds</span>
              </li>
              <li>
                <span className="text-sm text-white/50">FAQ</span>
              </li>
              <li>
                <span className="text-sm text-white/50">Contact Us</span>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="font-semibold text-sm text-white/80 mb-4 uppercase tracking-wider">Trust & Safety</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Secure Checkout
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Free Shipping 50+
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                30-Day Returns
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} ViralGoods. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/30">Privacy</span>
            <span className="text-xs text-white/30">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
