import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import SmoothScroll from '@/components/SmoothScroll';
import { person, seo } from '@/lib/content';
import './globals.css';

// Self-hosted: no request ever leaves the domain.
const monaSans = localFont({
  src: './fonts/mona-sans-latin.woff2',
  weight: '200 900',
  style: 'normal',
  variable: '--font-sans',
  display: 'swap',
});

const fragmentMono = localFont({
  src: './fonts/fragment-mono-latin.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-mono',
  display: 'swap',
  preload: false, // only the session log at the bottom uses it
});

export const metadata: Metadata = {
  metadataBase: new URL(person.url),
  title: seo.title,
  description: seo.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    url: '/',
    siteName: person.name,
    title: seo.shareTitle,
    description: seo.shareDescription,
    firstName: 'Etem Utku',
    lastName: 'Oylum',
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.shareTitle,
    description: seo.shareDescription,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// Motion states are only hidden once JS runs. If the motion layer has not started
// after 2.5s (blocked script, slow network), everything is shown as is.
const boot = `document.documentElement.classList.replace('no-js','js');setTimeout(function(){if(!window.__motionReady)document.documentElement.classList.remove('js')},2500);`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`no-js ${monaSans.variable} ${fragmentMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
