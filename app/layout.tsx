import './globals.css';
import CustomCursor from '../components/CustomCursor';
import ScrollBlur from '../components/ScrollBlur';

export const metadata = {
  title: 'ViralGoods',
  description: 'ViralGoods storefront',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative">
        <CustomCursor />
        <ScrollBlur />
        {children}
      </body>
    </html>
  );
}
