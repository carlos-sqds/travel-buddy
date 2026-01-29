import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flight Price Tracker',
  description: 'Track flight prices and display on TRMNL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
