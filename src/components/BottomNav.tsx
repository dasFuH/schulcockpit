"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

// Schüleransicht: voller Funktionsumfang
const studentNav: NavItem[] = [
  { href: "/", label: "Heute", icon: "🏠" },
  { href: "/hausaufgaben", label: "HA", icon: "📝" },
  { href: "/notizen", label: "Notizen", icon: "📒" },
  { href: "/klassenarbeiten", label: "Arbeiten", icon: "🎯" },
  { href: "/woche", label: "Woche", icon: "📅" },
];

// Elternansicht: bewusst reduziert (nur Überblick)
const parentNav: NavItem[] = [
  { href: "/", label: "Überblick", icon: "🏠" },
];

export function BottomNav({ role }: { role: "STUDENT" | "PARENT" }) {
  const pathname = usePathname();
  const items = role === "PARENT" ? parentNav : studentNav;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <ul
        className="mx-auto flex max-w-md items-stretch justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition ${
                  active ? "text-brand" : "text-slate-400"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
