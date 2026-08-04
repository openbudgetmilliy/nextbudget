import LoginForm from '@/components/admin/LoginForm';
import { SITE } from '@/lib/content';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kirish' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="a-login">
      <div className="a-login-box">
        <img className="a-login-mark" src="/logo-mark.webp" alt="" width={44} height={44} />
        <h1>{SITE.brand} admin</h1>
        <p>Panelga kirish uchun login va parolni kiriting.</p>
        <LoginForm next={next ?? '/admin'} />
      </div>
    </div>
  );
}
