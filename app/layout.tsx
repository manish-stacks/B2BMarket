import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: { default: "B2B Marketplace - India's Leading B2B Portal", template: '%s | B2B Marketplace' },
  description: "Connect with verified suppliers and buyers. India's trusted B2B marketplace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
