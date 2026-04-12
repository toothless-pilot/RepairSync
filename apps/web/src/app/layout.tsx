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
      <body className="antialiased">{children}</body>
    </html>
  );
}
