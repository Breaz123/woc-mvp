import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/nav/Sidebar';
import { Topbar } from '@/components/nav/Topbar';
import { BottomNav } from '@/components/nav/BottomNav';
import { BreadcrumbsWrapper } from '@/components/nav/BreadcrumbsWrapper';
import { CookieBanner } from '@/components/CookieBanner';
import { getSession } from '@/lib/auth/session';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { session, profile } = await getSession();
  return (
    <html lang="nl">
      <body className="min-h-screen flex bg-gradient-to-br from-background via-background to-muted/20">
        <Sidebar role={profile?.role} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar session={session} profile={profile} />
          <main className="flex-1 p-6 pb-20 md:pb-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full">
              <BreadcrumbsWrapper />
              {children}
            </div>
          </main>
        </div>
        <BottomNav session={session} />
        <CookieBanner />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

