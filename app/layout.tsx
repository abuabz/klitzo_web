import type { Metadata } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Footer from '@/components/footer'
import { Toaster } from 'sonner'
import Header from '@/components/header'
import WhatsappButton from '@/components/whatsappButton'
import AdminHide from '@/components/admin-hide'

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

import { GoogleProvider } from '@/components/google-provider'

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
        <GoogleProvider>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1557548879710692');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=1557548879710692&ev=PageView&noscript=1"
              alt=""
            />
          </noscript>
          <AdminHide>
            <Header />
          </AdminHide>
          {children}
          <Toaster position="bottom-right" expand={true} richColors />
          <AdminHide>
            <WhatsappButton />
            <Footer />
          </AdminHide>
        </GoogleProvider>
      </body>
    </html>
  )
}
