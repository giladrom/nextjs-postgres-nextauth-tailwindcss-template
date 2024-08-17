import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Next.js App Router + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">
        <main>{children}</main>
        <Toaster />
      </body>
      
      <Analytics />
      
    </html>
  );
}
