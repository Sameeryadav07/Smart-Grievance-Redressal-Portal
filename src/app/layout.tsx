import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'Jan-Samadhan | Smart Grievance Redressal & AI Fake Detection Portal',
  description:
    'Government citizen grievance redressal system powered by AI image manipulation detection, duplicate submission filtering, and automated department routing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
