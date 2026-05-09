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
          <svg className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          <span>Upstream Repo</span>
        </a>
      </body>
    </html>
  );
}
