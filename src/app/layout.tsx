import './globals.css';
import SiteChrome from '@/components/SiteChrome';

export const metadata = {
  title: 'Smith Standard & Co. Detailing',
  description: 'Premium mobile detailing serving Napa, Sonoma, and surrounding Bay Area markets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col bg-black font-sans text-white antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
