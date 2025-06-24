import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Footer from '@/components/layout/footer';
import { AppProviders } from '@/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'autoHODL',
  description:
    'Save USDC in your Circle wallet while you pay using MetaMask Card and earn yield cross-chain with LiFi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <AppProviders>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans min-h-screen flex flex-col items-center justify-start`}
        >
          {children}
          <Footer />
        </body>
      </AppProviders>
    </html>
  );
}
