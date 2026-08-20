import { redirect } from 'next/navigation';

/**
 * Narx boshqaruvi Sozlamalarga ko'chdi (`price_one_vote` maydoni) — landing
 * paket kartalarini ko'rsatmay qo'ygach alohida sahifaning keragi qolmadi.
 * Eski xatcho'plar sinmasin deb marshrut redirect bo'lib turibdi.
 */
export default function PricesMoved() {
  redirect('/admin/settings');
}
