import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Shop | ViralGoods',
  description: 'Browse all ViralGoods products and trending collections.',
};

export default function ShopPage() {
  redirect('/products');
}
