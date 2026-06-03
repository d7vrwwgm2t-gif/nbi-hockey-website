import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import {
  FaInstagram,
  FaLinkedin,
  FaRss,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" className={`${poppins.className} h-full antialiased`}>
      <body className="min-h-full bg-[#07111F] text-white">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-24 top-0 h-0 w-0 border-t-[420px] border-r-[420px] border-t-[#4DB5FF]/18 border-r-transparent" />
          <div className="absolute -left-10 top-0 h-0 w-0 border-t-[300px] border-r-[300px] border-t-[#07111F]/60 border-r-transparent" />
          <div className="absolute left-0 top-0 h-0 w-0 border-t-[230px] border-r-[230px] border-t-[#7CC7FF]/14 border-r-transparent" />

          <div className="absolute -right-20 top-0 h-0 w-0 border-t-[360px] border-l-[360px] border-t-[#FFD54A]/22 border-l-transparent" />
          <div className="absolute right-0 top-0 h-0 w-0 border-t-[260px] border-l-[260px] border-t-[#4DB5FF]/16 border-l-transparent" />
          <div className="absolute -right-8 top-0 h-0 w-0 border-t-[190px] border-l-[190px] border-t-[#07111F]/50 border-l-transparent" />

          <div className="absolute -left-16 bottom-0 h-0 w-0 border-b-[280px] border-r-[280px] border-b-[#FFD54A]/12 border-r-transparent" />
          <div className="absolute -right-16 bottom-0 h-0 w-0 border-b-[340px] border-l-[340px] border-b-[#4DB5FF]/16 border-l-transparent" />
        </div>

        <div className="relative z-10">
          <header className="border-b border-white/10 bg-[#07111F]/90 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <Link
                href="/"
                className="flex items-center gap-3 transition hover:opacity-90"
              >
                <Image
                  src="/nbi_logo copy 2.png"
                  alt="NBI Hockey Logo"
                  width={64}
                  height={64}
                  priority
                />

                <span className="text-lg font-bold">NBI Hockey</span>
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