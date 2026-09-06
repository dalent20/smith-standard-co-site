'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import SocialIcons from '@/components/SocialIcons';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const internal = pathname.startsWith('/admin') || pathname.startsWith('/team');

  if (internal) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <SocialIcons />
    </>
  );
}
