"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Product",      href: "/assessment" },
  { label: "How It Works", href: "/how-it-works.html" },
  { label: "Contact",      href: "/contact.html" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        padding: "1.2rem 3.5rem",
        background: "#0A0B0F",
        borderBottom: "1px solid rgba(247,248,242,0.07)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        prefetch={false}
        className="no-underline"
        style={{
          fontFamily: "var(--font-syne), 'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "1.1rem",
          letterSpacing: "-0.03em",
          color: "#F7F8F2",
        }}
      >
        Repair<em style={{ fontStyle: "normal", color: "#C6E83A" }}>Sync</em>
      </Link>

      {/* Links */}
      <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              prefetch={false}
              className="no-underline transition-colors"
              style={{
                color: isActive ? "#F7F8F2" : "#7A7D8A",
                fontSize: "0.875rem",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#0A0B0F", color: "#F7F8F2" }}>
      <Header />
      <main style={{ paddingTop: "5rem", padding: "5rem 2rem 5rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
