import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ToastProvider from '@/components/ui/Toast';

export const metadata = {
  title: 'ViralGoods - Trending Products for the Modern Lifestyle',
  description:
    'Discover curated trending products at unbeatable prices. Gadgets, lighting, decor and more. Free shipping on orders over $50.',
  keywords: 'trending products, gadgets, home decor, LED lights, viral products, online store',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="relative min-h-screen flex flex-col">
        <CustomCursor />
        <Navbar />
        <CartDrawer />
        <ToastProvider />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
