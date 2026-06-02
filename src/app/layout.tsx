import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NBI Hockey",
  description: "Hockey analysis, research, and data-driven insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-white">
        <header className="border-b border-white/10">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link href="/" className="text-xl font-bold">
              NBI Hockey
            </Link>

            <div className="flex gap-6 text-sm text-gray-300">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="/articles" className="hover:text-white">
                Articles
              </Link>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </div>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}