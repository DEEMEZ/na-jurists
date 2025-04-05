import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'N&A Jurists - Legal Consultants',
  description: 'Advocates, Corporate & Legal Consultants specializing in providing exceptional legal services with integrity and excellence.',
  keywords: 'law firm, legal consultants, corporate law, litigation, legal services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`${inter.className} antialiased bg-[#2b415e]`}>
        {children}
      </body>
    </html>
  )
}