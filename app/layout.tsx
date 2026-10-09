import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  title: 'FoodLens — Food Ingredient Safety & Health Analyzer',
  description:
    'Decode packaged food labels, E-numbers, INS additives, allergens, and health effects in English & Bangla with scientific evidence.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansBengali.variable}`}>
      <body className="min-h-screen flex flex-col text-slate-800 font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
        <LanguageProvider>
          <PreferencesProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-12">
              {children}
            </main>
            <Footer />
          </PreferencesProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
