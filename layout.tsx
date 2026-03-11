import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LINKINTEL — Paste a link. Get intelligence.',
  description: 'Paste any video URL. Get transcript, insights, and content assets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="scan-line" />
        {children}
      </body>
    </html>
  );
}