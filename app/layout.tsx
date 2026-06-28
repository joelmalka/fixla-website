import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fixla — Kotipalvelut kätevästi',
  description:
    'Tilaa ikkunoiden pesu, renkaiden vaihto, siivous ja muut kotipalvelut. Helsinki, Espoo, Vantaa, Kauniainen.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#059669',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}
