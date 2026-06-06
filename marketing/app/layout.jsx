import { Instrument_Serif } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

export const metadata = {
  title: 'Kiness — Stay close to your loved one in elder care',
  description: 'Kiness connects families to loved ones in assisted living through daily updates, real moments, and peace of mind. Join the waitlist.',
  metadataBase: new URL('https://kiness.ai'),
  openGraph: {
    title: 'Kiness — Stay close to your loved one in elder care',
    description: 'Daily updates from the care team. One app for the whole family.',
    url: 'https://kiness.ai',
    siteName: 'Kiness',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiness — Stay close to your loved one in elder care',
    description: 'Daily updates from the care team. One app for the whole family.',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={instrumentSerif.variable}>
      <body>{children}</body>
    </html>
  );
}
