import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import client-side ThemeRegistry component
import ThemeRegistry from './components/ThemeRegistry';
import TopNavigation from './components/TopNavigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Full Stack Assessment",
  description: "A Next.js full-stack application with SQL and React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeRegistry>
          <TopNavigation />
          <main style={{ padding: '2rem' }}>
            {children}
          </main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
