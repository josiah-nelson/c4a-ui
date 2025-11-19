import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crawl4AI Control Panel',
  description: 'Web frontend for Crawl4AI v0.7.x with LiteLLM integration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
