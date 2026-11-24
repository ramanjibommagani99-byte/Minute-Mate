"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthNav from "@/components/AuthNav";

const links = [
  { href: "/", label: "Overview", icon: "⌂" },
  { href: "/meetings/new", label: "New meeting", icon: "+" },
  { href: "/demo", label: "Guided demo", icon: "▷" },
  { href: "/dashboard", label: "Task dashboard", icon: "▤" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/design-preview")) return <>{children}</>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="MinuteMate overview">
          <span className="brand-mark">M</span><span className="brand-name">minute<span>mate</span></span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href) || (link.href === "/dashboard" && pathname.startsWith("/tasks"));
            return <Link className={`side-link${active ? " active" : ""}`} href={link.href} key={link.href} aria-current={active ? "page" : undefined}>
              <span className="side-icon" aria-hidden="true">{link.icon}</span>{link.label}
              {link.href === "/meetings/new" && <span className="side-add" aria-hidden="true">↗</span>}
            </Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card"><span className="privacy-dot" />PRIVATE WORKSPACE<p>Your meeting sources stay under your control.</p></div>
          <div className="sidebar-version">MINUTEMATE <span>·</span> FOCUS ROOM</div>
        </div>
      </aside>
      <section className="app-frame">
        <header className="topbar">
          <div className="topbar-context"><span className="context-pulse" />FOCUS ROOM <span className="context-divider">/</span><span className="context-sub">Meeting workspace</span></div>
          <div className="account-nav">{pathname.startsWith("/demo") ? <span className="demo-topbar-label">SAMPLE MODE</span> : <AuthNav />}</div>
        </header>
        <div className="app-content">{children}</div>
      </section>
    </div>
  );
}
