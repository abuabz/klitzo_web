import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://klitzo.com'),
  title: {
    default: 'klitzo',
    template: '%s | klitzo',
  },
  description: 'Cleaning made simple',
  keywords: ['cleaning', 'home', 'services', 'klitzo'],
  authors: [{ name: 'klitzo', url: 'https://klitzo.com' }],
  creator: 'klitzo',
  publisher: 'klitzo',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  icons: {
    icon: '/klitzo-logoletter.png',
    shortcut: '//klitzo-logoletter.png',
    apple: '/klitzo-logoletter.png',
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
      { rel: 'android-chrome-192x192', url: '/klitzo-logoletter.png' },
      { rel: 'android-chrome-512x512', url: '/klitzo-logoletter.png' },
      { rel: 'mask-icon', url: '/klitzo-logoletter.png' },
    ],
  },
  openGraph: {
    title: 'klitzo',
    description: 'Cleaning made simple',
    url: 'https://klitzo.com',
    siteName: 'klitzo',
    images: [
      {
        url: '/klitzo-logo.png',
        width: 1200,
        height: 630,
        alt: 'klitzo cleaning',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'klitzo',
    description: 'Cleaning made simple',
    creator: '@klitzo',
    images: ['/klitzo-logoletter.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  )
}
