import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Script from 'next/script'
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://simpletaxcalculator.app'),
  title: {
    default: 'Simple Tax Calculator — Free US Tax Tools',
    template: '%s — simpletaxcalculator.app',
  },
  description:
    'Free, accurate US tax calculators for sales tax, capital gains, property tax, and more. Updated rates for 2026. No signup required.',
  keywords: ['tax calculator', 'sales tax', 'capital gains calculator', 'US tax tools'],
  authors: [{ name: 'simpletaxcalculator.app' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simpletaxcalculator.app',
    siteName: 'Simple Tax Calculator',
    title: 'Simple Tax Calculator — Free US Tax Tools',
    description:
      'Free, accurate US tax calculators for sales tax, capital gains, property tax, and more.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],

  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simple Tax Calculator — Free US Tax Tools',
    description: 'Free, accurate US tax calculators. Updated rates for 2026.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16' },
      { url: '/favicon-32.png', sizes: '32x32' },
      { url: '/favicon-192.png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <Script
          id="mediavine-script-wrapper"
          src="https://scripts.scriptwrapper.com/tags/f8631653-1135-4909-abd7-137716619448.js"
          strategy="afterInteractive"
          async
          data-noptimize="1"
          data-cfasync="false"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* Journey by Mediavine — Grow */}
        <Script
          id="grow-initializer"
          strategy="afterInteractive"
          data-grow-initializer=""
          dangerouslySetInnerHTML={{
            __html: `
              !(function(){
                window.growMe || (
                  (window.growMe = function(e) {
                    window.growMe._.push(e);
                  }),
                  (window.growMe._ = [])
                );
                var e = document.createElement("script");
                e.type = "text/javascript";
                e.src = "https://faves.grow.me/main.js";
                e.defer = true;
                e.setAttribute(
                  "data-grow-faves-site-id",
                  "U2l0ZTpjODYzMjEzMC1hZGFiLTQ3NWYtYmVhZS03ZDFjMzkyMzcwM2U="
                );
                var t = document.getElementsByTagName("script")[0];
                t.parentNode.insertBefore(e, t);
              })();
            `,
          }}
        />

        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!}
        />

        {/* Google AdSense Script 
        <Script
          id="adsense-init"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8013456464637205"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />*/}

        <Script src="https://scripts.simpleanalyticscdn.com/latest.js" strategy="lazyOnload" />

      </body>
    </html>
  )
}