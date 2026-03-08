import { Creepster, Outfit, Inter } from 'next/font/google';
import './globals.css';

const creepster = Creepster({ subsets: ['latin'], weight: '400', variable: '--font-creepster', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-outfit', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-inter', display: 'swap' });

export const metadata = {
    title: 'REPLACED 💀 — Find Your Career\'s Expiry Date',
    description: 'AI is coming for your job. Find out exactly WHEN. Get your AI Replaceability Score.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${creepster.variable} ${outfit.variable} ${inter.variable}`}>
            <body>{children}</body>
        </html>
    );
}
