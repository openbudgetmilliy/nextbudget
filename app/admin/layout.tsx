import './admin.css';

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
