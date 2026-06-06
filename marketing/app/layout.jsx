import { Instrument_Serif } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

export const metadata = {
  title: 'Kinness — Your family, always close.',
  description:
    'Kinness connects families to loved ones in assisted living through daily updates, real moments, and the reassurance that someone is watching over them.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={instrumentSerif.variable}>
      <body>{children}</body>
    </html>
  );
}
