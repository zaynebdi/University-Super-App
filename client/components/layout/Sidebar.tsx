"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Megaphone,
  Calendar,
  Library,
  CreditCard,
  MessageSquareWarning,
  Bot,
  Map,
  BriefcaseBusiness,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Loader2,
} from "lucide-react";

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

const navigation = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/student/courses", icon: BookOpen },
  { label: "Timetable", href: "/student/timetable", icon: CalendarDays },
  { label: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
  { label: "Assignments", href: "/student/assignments", icon: FileText },
  { label: "Grades", href: "/student/grades", icon: GraduationCap },
  { label: "Announcements", href: "/student/announcements", icon: Megaphone },
  { label: "Events", href: "/student/events", icon: Calendar },
  { label: "Resources", href: "/student/resources", icon: Library },
  { label: "Fees", href: "/student/fees", icon: CreditCard },
];

const advanced = [
  { label: "AI Copilot", href: "/student/ai-copilot", icon: Bot },
  { label: "3D Campus", href: "/student/campus", icon: Map },
  { label: "Career Hub", href: "/student/career", icon: BriefcaseBusiness },
];

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // Stop loading animation once the new page has loaded
  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  const handleNavigation = (href: string) => {
    if (href !== pathname) {
      setLoadingPath(href);
    }
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
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
          <Link
            href="/student/dashboard"
            onClick={() => handleNavigation("/student/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
              <GraduationCap size={21} />
            </div>

            <div>
              <div className="text-[17px] font-bold tracking-tight">
                UniSphere
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                Digital Campus
              </div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Workspace
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const loading = loadingPath === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    handleNavigation(item.href);
                    onClose?.();
                  }}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5",
                    "text-[13px] font-medium transition-all duration-200",
                    active
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                      : "text-white/60 hover:bg-white/7 hover:text-white hover:translate-x-0.5",
                  ].join(" ")}
                >
                  {loading ? (
                    <Loader2
                      size={17}
                      strokeWidth={1.8}
                      className="animate-spin"
                    />
                  ) : (
                    <Icon size={17} strokeWidth={1.8} />
                  )}

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mb-3 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Smart Campus
          </div>

          <nav className="space-y-1">
            {advanced.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const loading = loadingPath === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    handleNavigation(item.href);
                    onClose?.();
                  }}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5",
                    "text-[13px] font-medium transition-all duration-200",
                    active
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                      : "text-white/60 hover:bg-white/7 hover:text-white hover:translate-x-0.5",
                  ].join(" ")}
                >
                  {loading ? (
                    <Loader2
                      size={17}
                      strokeWidth={1.8}
                      className="animate-spin"
                    />
                  ) : (
                    <Icon size={17} strokeWidth={1.8} />
                  )}

                  <span>{item.label}</span>

                  {item.label === "AI Copilot" && (
                    <span className="ml-auto rounded-full bg-indigo-400/15 px-2 py-0.5 text-[9px] font-semibold text-indigo-300">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <Link
            href="/student/complaints"
            onClick={() => handleNavigation("/student/complaints")}
            className={[
              "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5",
              "text-[13px] transition-all duration-200",
              isActive("/student/complaints")
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                : "text-white/55 hover:bg-white/7 hover:text-white hover:translate-x-0.5",
            ].join(" ")}
          >
            <MessageSquareWarning size={17} />
            Help & Support
          </Link>

          <Link
            href="/student/settings"
            onClick={() => handleNavigation("/student/settings")}
            className={[
              "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5",
              "text-[13px] transition-all duration-200",
              isActive("/student/settings")
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                : "text-white/55 hover:bg-white/7 hover:text-white hover:translate-x-0.5",
            ].join(" ")}
          >
            <Settings size={17} />
            Settings
          </Link>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-white/55 transition-all duration-200 hover:bg-white/7 hover:text-white hover:translate-x-0.5">
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
