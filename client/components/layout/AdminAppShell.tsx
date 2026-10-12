"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Building2,
  ClipboardCheck,
  CalendarDays,
  Megaphone,
  GraduationCap,
  Menu,
  LogOut,
  X,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Enrollments", href: "/admin/enrollments", icon: ClipboardCheck },
  { label: "Timetable", href: "/admin/timetable", icon: CalendarDays },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
];

export default function AdminAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const name = session?.user?.name ?? "Administrator";

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-50 flex h-screen w-62.5 flex-col",
          "bg-[#111827] text-white transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-19 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
              <GraduationCap size={21} />
            </div>
            <div>
              <div className="text-[17px] font-bold tracking-tight">
                UniSphere
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                Admin Console
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5",
                  "text-[13px] font-medium transition-all duration-200",
                  active
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                    : "text-white/60 hover:bg-white/7 hover:text-white hover:translate-x-0.5",
                ].join(" ")}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-white/55 transition-all duration-200 hover:bg-white/7 hover:text-white hover:translate-x-0.5"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-62.5">
        <header className="sticky top-0 z-30 flex h-19 items-center justify-between border-b border-gray-200 bg-white/90 px-5 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="text-sm font-semibold text-gray-900">
              Administration
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-[13px] font-semibold text-gray-900">
                {name}
              </div>
              <div className="text-[11px] text-gray-400">Administrator</div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
