"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Heatmap", icon: "🔥" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/squad", label: "Squads", icon: "👥" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "var(--color-bg-primary)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold" style={{ color: "var(--color-accent)" }}>
            ⚡
          </span>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Pulse
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: isActive ? "var(--color-bg-secondary)" : "transparent",
                  color: isActive
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                }}
              >
                <span className="mr-1.5 hidden sm:inline">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Status + Connect Wallet (placeholder) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="live-dot" />
            <span
              className="text-xs font-medium hidden sm:block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Live
            </span>
          </div>
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "#ffffff",
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
}
