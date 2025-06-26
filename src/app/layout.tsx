// src/app/layout.tsx
import './globals.css';              // ← must be first
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import SocialIcons from '@/components/SocialIcons';

export const metadata = {
  title: 'Smith Standard & Co.',
  description: 'Luxury auto detailing with precision.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-luxury text-white font-sans flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <SocialIcons /> {/* Add the icons to appear on all pages */}
      </body>
    </html>
  );
}
