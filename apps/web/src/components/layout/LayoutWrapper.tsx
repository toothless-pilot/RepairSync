"use client";

import { Plus, Info, HelpCircle, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "New Estimate", icon: Plus,         href: "/" },
  { label: "Dashboard",    icon: LayoutDashboard, href: "/dashboard" },
  { label: "How It Works", icon: Info,         href: "/how-it-works" },
  { label: "About",        icon: HelpCircle,   href: "/about" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-white/5 flex flex-col p-4 z-40 overflow-y-auto">
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-white/5 mt-auto">
        <button className="sidebar-item w-full">
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-white/5 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-serif text-white tracking-tight">
          RepairSync
        </Link>
        <div className="h-4 w-px bg-white/10 hidden sm:block" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent hidden sm:block">
          Market Intelligence
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 border border-accent/20">
          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Demo Mode</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10" />
      </div>
    </header>
  );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pt-16 pl-64 transition-all">
      <Header />
      <Sidebar />
      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
