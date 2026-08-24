import './globals.css';
import { inter, sora } from '@/styles/fonts';

export const metadata = {
  title: 'KYC Onboarding — Allvest (Demo)',
  description:
    'Frontend-only KYC onboarding demo. Every value in this flow is dummy test data.',
  robots: { index: false, follow: false },
  icons: { icon: '/assets/logo/allvest-mark.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1a1a',
};

export default function RootLayout({ children }) {
  // The reference app defaults to the dark theme, applied via `class="dark"`
  // on <html> — kept identical here so every token resolves the same way.
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${sora.variable} font-inter theme-layout antialiased`}>
        {children}
      </body>
    </html>
  );
}
