import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import {
  FaInstagram,
  FaLinkedin,
  FaRss,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
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
      <body className="min-h-full bg-[#07111F] text-white">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-0 w-0 border-t-[340px] border-r-[340px] border-t-[#4DB5FF]/20 border-r-transparent" />
          <div className="absolute left-0 top-0 h-0 w-0 border-t-[250px] border-r-[250px] border-t-[#FFD54A]/18 border-r-transparent" />
          <div className="absolute left-0 top-0 h-0 w-0 border-t-[170px] border-r-[170px] border-t-[#4DB5FF]/25 border-r-transparent" />

          <div className="absolute right-0 top-0 h-0 w-0 border-t-[360px] border-l-[360px] border-t-[#FFD54A]/16 border-l-transparent" />
          <div className="absolute right-0 top-0 h-0 w-0 border-t-[260px] border-l-[260px] border-t-[#4DB5FF]/20 border-l-transparent" />
          <div className="absolute right-0 top-0 h-0 w-0 border-t-[160px] border-l-[160px] border-t-[#FFD54A]/22 border-l-transparent" />

          <div className="absolute bottom-0 left-0 h-0 w-0 border-b-[330px] border-r-[330px] border-b-[#FFD54A]/14 border-r-transparent" />
          <div className="absolute bottom-0 left-0 h-0 w-0 border-b-[240px] border-r-[240px] border-b-[#4DB5FF]/18 border-r-transparent" />

          <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[380px] border-l-[380px] border-b-[#4DB5FF]/18 border-l-transparent" />
          <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[270px] border-l-[270px] border-b-[#FFD54A]/16 border-l-transparent" />
        </div>

        <div className="relative z-10">
          <header className="border-b border-white/10 bg-[#07111F]/90 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <Link href="/" className="text-xl font-bold">
                NBI Hockey
              </Link>

              <div className="flex gap-6 text-sm text-gray-300">
                <Link href="/" className="hover:text-[#4DB5FF]">
                  Home
                </Link>
                <Link href="/articles" className="hover:text-[#4DB5FF]">
              Articles
            </Link>
            <Link href="/research" className="hover:text-[#4DB5FF]">
             Research
            </Link>
            <Link href="/model" className="hover:text-[#4DB5FF]">
            Model
            </Link>
            <Link href="/about" className="hover:text-[#4DB5FF]">
              About
            </Link>
              </div>
            </nav>
          </header>

          {children}

          <footer className="mt-24 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-6 py-10">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-white">NBI Hockey</h3>

                <p className="mt-2 text-sm text-gray-400">
                  Research. Analysis. Data.
                </p>
              </div>

              <div className="flex items-center justify-center gap-8">
                <a
                  href="https://www.instagram.com/nbi_hockey/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NBI Hockey Instagram"
                  className="text-[#4DB5FF] transition hover:scale-110 hover:text-[#FFD54A]"
                >
                  <FaInstagram size={28} />
                </a>

                <a
                  href="https://x.com/NBI_Hockey"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NBI Hockey on X"
                  className="text-[#4DB5FF] transition hover:scale-110 hover:text-[#FFD54A]"
                >
                  <FaXTwitter size={28} />
                </a>

                <a
                  href="https://www.youtube.com/channel/UC23IpSOAdZxuR6spv6FZkPw"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NBI Hockey YouTube"
                  className="text-[#4DB5FF] transition hover:scale-110 hover:text-[#FFD54A]"
                >
                  <FaYoutube size={28} />
                </a>

                <a
                  href="https://www.linkedin.com/in/george-lafleche-aa0164235/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="George LaFleche LinkedIn"
                  className="text-[#4DB5FF] transition hover:scale-110 hover:text-[#FFD54A]"
                >
                  <FaLinkedin size={28} />
                </a>

                <a
                  href="https://nbihockey.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NBI Hockey Substack"
                  className="text-[#4DB5FF] transition hover:scale-110 hover:text-[#FFD54A]"
                >
                  <FaRss size={28} />
                </a>
              </div>

              <div className="mt-6 text-center text-xs text-gray-500">
                © 2026 NBI Hockey
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}