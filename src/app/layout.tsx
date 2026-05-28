import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LoadingSpinner from '@/components/Website/Global/LoadingSpinner/LoadingSpinner';
import { Suspense } from 'react'; // Import Suspense

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'N&A Jurists - Legal Consultants',
  description: 'Advocates, Corporate & Legal Consultants specializing in providing exceptional legal services with integrity and excellence.',
  keywords: 'law firm, legal consultants, corporate law, litigation, legal services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/emblem-icon.png" type="image/png" />
        <link rel="shortcut icon" href="/emblem-icon.png" type="image/png" />
      </head>
      <body className={`${inter.className} antialiased bg-[#f7fafc]`}>
        <Suspense fallback={null}> {/* Wrap LoadingSpinner in Suspense */}
          <LoadingSpinner />
        </Suspense>
        {children}
      </body>
    </html>
  );
}