import type { Metadata } from "next";
import { Syne, Karla } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-karla",
});

export const metadata: Metadata = {
  title: "RepairSync | AI Damage Assessment",
  description: "AI-powered fair market repair estimates and parts pricing.",
};

import { Github } from "lucide-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${karla.variable}`}>
      <body className="antialiased">
        {children}
        <a 
          href="https://github.com/toothless-pilot/RepairSync"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-[100] flex items-center gap-2.5 px-5 py-2.5 bg-[#1C1E27] border border-white/10 rounded-full text-[11px] font-bold text-white hover:bg-[#252833] hover:border-white/20 transition-all shadow-2xl group"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <Github className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
          <span>Upstream Repo</span>
        </a>
      </body>
    </html>
  );
}
