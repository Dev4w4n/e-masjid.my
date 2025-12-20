import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  generateMetadata as generateSEOMetadata,
  generateStructuredData,
} from "@/lib/seo";
import "@/styles/globals.css";
import "@/styles/islamic-theme.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
  preload: true,
  variable: "--font-amiri",
});

export const metadata: Metadata = generateSEOMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate Organization structured data
  const organizationData = generateStructuredData("Organization", {
    name: "Open E Masjid",
    description: "Platform digital untuk komuniti masjid di Malaysia",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://tv.masjid",
  });

  return (
    <html lang="ms" className={`${inter.variable} ${amiri.variable}`}>
      <head>
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />

        {/* Theme Color */}
        <meta name="theme-color" content="#338CF5" />

        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
      </head>
      <body className="bg-gray-50 min-h-screen flex flex-col font-sans overflow-x-hidden">
        <Header />
        <main className="flex-1 w-full pt-20">
          <div className="container-custom py-8">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
