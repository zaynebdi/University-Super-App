"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Library,
  Megaphone,
  BarChart3,
  Bot,
  Lightbulb,
  MessageSquareWarning,
  Settings,
  LogOut,
  X,
  Loader2,
} from "lucide-react";

type FacultySidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/faculty/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Courses",
    href: "/faculty/courses",
    icon: BookOpen,
  },
  {
    label: "My Students",
    href: "/faculty/students",
    icon: Users,
  },
  {
    label: "Timetable",
    href: "/faculty/timetable",
    icon: CalendarDays,
  },
  {
    label: "Attendance",
    href: "/faculty/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Assignments",
    href: "/faculty/assignments",
    icon: FileText,
  },
  {
    label: "Grades & Evaluation",
    href: "/faculty/grades",
    icon: GraduationCap,
  },
];

const teaching = [
  {
    label: "Resources",
    href: "/faculty/resources",
    icon: Library,
  },
  {
    label: "Announcements",
    href: "/faculty/announcements",
    icon: Megaphone,
  },
  {
    label: "Course Analytics",
    href: "/faculty/analytics",
    icon: BarChart3,
  },
];

const smartFaculty = [
  {
    label: "AI Teaching Assistant",
    href: "/faculty/ai-assistant",
    icon: Bot,
  },
  {
    label: "Student Insights",
    href: "/faculty/student-insights",
    icon: Lightbulb,
  },
];

export default function FacultySidebar({
  mobileOpen = false,
  onClose,
}: FacultySidebarProps) {
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

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

  const renderNavigation = (
    items: {
      label: string;
      href: string;
      icon: typeof LayoutDashboard;
    }[],
  ) => {
    return items.map((item) => {
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
            <Loader2 size={17} strokeWidth={1.8} className="animate-spin" />
          ) : (
            <Icon size={17} strokeWidth={1.8} />
          )}

          <span>{item.label}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close faculty sidebar"
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
        {/* Header */}
        <div className="flex h-19 items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/faculty/dashboard"
            onClick={() => handleNavigation("/faculty/dashboard")}
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
                Faculty Portal
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

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* Workspace */}
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Workspace
          </div>

          <nav className="space-y-1">{renderNavigation(navigation)}</nav>

          {/* Teaching */}
          <div className="mb-3 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Teaching
          </div>

          <nav className="space-y-1">{renderNavigation(teaching)}</nav>

          {/* Smart Faculty */}
          <div className="mb-3 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Smart Faculty
          </div>

          <nav className="space-y-1">
            {smartFaculty.map((item) => {
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

                  {item.label === "AI Teaching Assistant" && (
                    <span className="ml-auto rounded-full bg-indigo-400/15 px-2 py-0.5 text-[9px] font-semibold text-indigo-300">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/faculty/help"
            onClick={() => handleNavigation("/faculty/help")}
            className={[
              "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5",
              "text-[13px] transition-all duration-200",
              isActive("/faculty/help")
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                : "text-white/55 hover:bg-white/7 hover:text-white hover:translate-x-0.5",
            ].join(" ")}
          >
            <MessageSquareWarning size={17} />
            Help & Support
          </Link>

          <Link
            href="/faculty/settings"
            onClick={() => handleNavigation("/faculty/settings")}
            className={[
              "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5",
              "text-[13px] transition-all duration-200",
              isActive("/faculty/settings")
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
