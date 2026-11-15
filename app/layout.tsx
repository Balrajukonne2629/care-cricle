import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareCircle — Tactile Elderly Healthcare & Family Circle',
  description: 'Medical-grade warmth, voice interaction, clinical drug interaction safety, and dual elder/caregiver dashboards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fbfaf8] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
