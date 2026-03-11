import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IT Contract Tracker',
  description: 'AI-powered IT Services Contract Intelligence Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
