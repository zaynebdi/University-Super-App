"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  Megaphone,
  Search,
  Pin,
  Clock3,
  CalendarDays,
  ChevronRight,
  Bell,
  CheckCheck,
} from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  description: string;
  category: "Academic" | "Events" | "Examination" | "Administration";
  priority: "High" | "Normal";
  date: string;
  time: string;
  author: string;
  pinned?: boolean;
  unread?: boolean;
};

const announcements: Announcement[] = [
  {
    id: 1,
    title: "Final Examination Schedule Released",
    description:
      "The final examination schedule for Fall 2026 has been published. Students are advised to review their examination dates, times and assigned rooms.",
    category: "Examination",
    priority: "High",
    date: "24 Sep 2026",
    time: "10:30 AM",
    author: "Examination Department",
    pinned: true,
    unread: true,
  },
  {
    id: 2,
    title: "Fall 2026 Course Registration Deadline",
    description:
      "Students are reminded that the course registration and add/drop period will close this Friday. Please complete any pending academic registration.",
    category: "Academic",
    priority: "High",
    date: "23 Sep 2026",
    time: "02:15 PM",
    author: "Academic Office",
    pinned: true,
    unread: true,
  },
  {
    id: 3,
    title: "Annual University Tech Conference",
    description:
      "Registration is now open for the annual technology conference featuring industry speakers, technical workshops and student project showcases.",
    category: "Events",
    priority: "Normal",
    date: "22 Sep 2026",
    time: "11:00 AM",
    author: "Student Affairs",
    unread: true,
  },
  {
    id: 4,
    title: "Mid-Semester Academic Advising",
    description:
      "Students can now schedule academic advising sessions with their department advisors to discuss course progress and upcoming semester planning.",
    category: "Academic",
    priority: "Normal",
    date: "20 Sep 2026",
    time: "09:30 AM",
    author: "Department of Software Engineering",
  },
  {
    id: 5,
    title: "Campus Network Maintenance",
    description:
      "University network services may experience intermittent disruption during scheduled infrastructure maintenance.",
    category: "Administration",
    priority: "Normal",
    date: "18 Sep 2026",
    time: "04:00 PM",
    author: "IT Services",
  },
  {
    id: 6,
    title: "Project Submission Guidelines Updated",
    description:
      "Updated guidelines for final-year project submissions are now available. Students should review the latest formatting and evaluation requirements.",
    category: "Academic",
    priority: "Normal",
    date: "16 Sep 2026",
    time: "01:20 PM",
    author: "FYP Committee",
  },
];

const categories = [
  "All",
  "Academic",
  "Examination",
  "Events",
  "Administration",
];

export default function AnnouncementsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const query = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query);

      const matchesUnread = !showUnreadOnly || item.unread;

      return matchesCategory && matchesSearch && matchesUnread;
    });
  }, [activeCategory, search, showUnreadOnly]);

  return (
    <AppShell>
      <div className="mx-auto max-w-325">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              <Megaphone size={15} />
              University Communications
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Announcements
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Stay updated with important university notices and updates.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5">
            <Bell size={16} className="text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700">
              3 unread announcements
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs font-medium text-gray-500">
              Total Announcements
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {announcements.length}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-medium text-gray-500">Unread</p>
            <p className="mt-2 text-2xl font-bold text-indigo-600">
              {announcements.filter((item) => item.unread).length}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-medium text-gray-500">High Priority</p>
            <p className="mt-2 text-2xl font-bold text-rose-600">
              {announcements.filter((item) => item.priority === "High").length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 xl:max-w-md">
              <Search size={17} className="text-gray-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search announcements..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-semibold transition",
                    activeCategory === category
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {category}
                </button>
              ))}

              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={[
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
                  showUnreadOnly
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                ].join(" ")}
              >
                <Bell size={13} />
                Unread only
              </button>
            </div>
          </div>
        </Card>

        {/* Announcement List */}
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => (
            <Card
              key={item.id}
              className={[
                "group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg",
                item.unread ? "border-indigo-100" : "",
              ].join(" ")}
            >
              <div className="p-5 sm:p-6">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={[
                      "hidden h-11 w-11 shrink-0 place-items-center rounded-xl sm:grid",
                      item.priority === "High"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-indigo-50 text-indigo-600",
                    ].join(" ")}
                  >
                    <Megaphone size={19} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {item.pinned && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600">
                              <Pin size={10} />
                              Pinned
                            </span>
                          )}

                          <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                            {item.category}
                          </span>

                          {item.priority === "High" && (
                            <span className="rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600">
                              High Priority
                            </span>
                          )}

                          {item.unread && (
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          )}
                        </div>

                        <h2 className="text-base font-bold text-gray-950 sm:text-lg">
                          {item.title}
                        </h2>
                      </div>

                      <button className="flex shrink-0 items-center gap-1 self-start text-xs font-semibold text-indigo-600 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                        Read more
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-500">
                      {item.description}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <CalendarDays size={13} />
                        {item.date}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Clock3 size={13} />
                        {item.time}
                      </div>

                      <div className="text-[11px] font-medium text-gray-500">
                        {item.author}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredAnnouncements.length === 0 && (
            <Card className="p-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-gray-400">
                <Search size={20} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-gray-900">
                No announcements found
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Try changing your search or category filter.
              </p>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between px-2 text-xs text-gray-400">
          <span>
            Showing {filteredAnnouncements.length} of {announcements.length}{" "}
            announcements
          </span>

          <button className="flex items-center gap-1.5 font-semibold text-gray-500 hover:text-indigo-600">
            <CheckCheck size={14} />
            Mark all as read
          </button>
        </div>
      </div>
    </AppShell>
  );
}
