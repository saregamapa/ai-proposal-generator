import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Proposal Generator — Win More Clients',
  description: 'Create professional business proposals in seconds using AI.',
  openGraph: { title: 'AI Proposal Generator', description: 'Create winning proposals in seconds with AI', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}<Toaster /></Providers>
      </body>
    </html>
  );
}
