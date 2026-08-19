import './admin.css';
import type { Viewport } from 'next';

/** Admin to'q — ildiz layout'dagi oq themeColor bu yerda mobil brauzer
    chrome'ini begona rangga bo'yab qo'yardi */
export const viewport: Viewport = {
  themeColor: '#080a10',
  colorScheme: 'dark',
};

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/**
 * Bu layout faqat admin CSS'ini ulaydi — himoya `(dash)/layout.tsx` da,
 * chunki `/admin/login` chrome va guard'siz bo'lishi kerak.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
