import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'E-Masjid TV Display',
  description: 'Digital signage system for Malaysian mosques',
  keywords: 'mosque, masjid, digital signage, TV display, prayer times, sponsorship',
  robots: 'noindex, nofollow', // Prevent search engine indexing for TV displays
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="theme-color" content="#000000" />
        
        {/* TV Display optimizations */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Prevent caching for real-time content */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}