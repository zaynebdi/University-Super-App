"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  Library,
  Search,
  FileText,
  FileArchive,
  Link2,
  Download,
  Filter,
  Clock3,
  BookOpen,
  FolderOpen,
  ChevronDown,
} from "lucide-react";

type Resource = {
  id: number;
  title: string;
  description: string;
  course: string;
  courseName: string;
  type: "Lecture Slides" | "PDF Notes" | "Past Paper" | "Reference" | "Link";
  size?: string;
  date: string;
  downloads: number;
};

const resources: Resource[] = [
  {
    id: 1,
    title: "Microservices Architecture — Lecture 08",
    description:
      "Service decomposition, API gateways, service discovery and distributed communication patterns.",
    course: "SE-401",
    courseName: "Software Architecture",
    type: "Lecture Slides",
    size: "4.8 MB",
    date: "23 Sep 2026",
    downloads: 42,
  },
  {
    id: 2,
    title: "Software Architecture Complete Notes",
    description:
      "Comprehensive notes covering architectural styles, patterns, quality attributes and system design.",
    course: "SE-401",
    courseName: "Software Architecture",
    type: "PDF Notes",
    size: "8.2 MB",
    date: "20 Sep 2026",
    downloads: 67,
  },
  {
    id: 3,
    title: "Artificial Intelligence — Search Algorithms",
    description:
      "BFS, DFS, Uniform Cost Search, Greedy Search and A* algorithm lecture material.",
    course: "AI-402",
    courseName: "Artificial Intelligence",
    type: "Lecture Slides",
    size: "3.6 MB",
    date: "22 Sep 2026",
    downloads: 51,
  },
  {
    id: 4,
    title: "AI-402 Midterm Past Paper 2025",
    description:
      "Previous semester examination paper for Artificial Intelligence.",
    course: "AI-402",
    courseName: "Artificial Intelligence",
    type: "Past Paper",
    size: "1.4 MB",
    date: "18 Sep 2026",
    downloads: 103,
  },
  {
    id: 5,
    title: "Network Security Fundamentals",
    description:
      "Authentication, network attacks, firewalls, IDS/IPS and secure network architecture.",
    course: "CS-405",
    courseName: "Cyber Security",
    type: "PDF Notes",
    size: "6.7 MB",
    date: "19 Sep 2026",
    downloads: 89,
  },
  {
    id: 6,
    title: "OWASP Web Security Resources",
    description:
      "Recommended external resources for understanding modern web application security.",
    course: "CS-405",
    courseName: "Cyber Security",
    type: "Link",
    date: "17 Sep 2026",
    downloads: 38,
  },
  {
    id: 7,
    title: "Next.js Full Stack Development",
    description:
      "Server components, routing, API integration, authentication and deployment concepts.",
    course: "SE-406",
    courseName: "Web Engineering",
    type: "Lecture Slides",
    size: "5.1 MB",
    date: "16 Sep 2026",
    downloads: 74,
  },
  {
    id: 8,
    title: "Software Testing — Unit Testing Guide",
    description:
      "Practical guide to unit testing, integration testing, test cases and automation.",
    course: "SE-407",
    courseName: "Software Testing",
    type: "PDF Notes",
    size: "3.9 MB",
    date: "15 Sep 2026",
    downloads: 46,
  },
  {
    id: 9,
    title: "Distributed Systems Past Paper",
    description: "Previous examination questions for Distributed Systems.",
    course: "DS-408",
    courseName: "Distributed Systems",
    type: "Past Paper",
    size: "1.1 MB",
    date: "12 Sep 2026",
    downloads: 61,
  },
];

const types = [
  "All",
  "Lecture Slides",
  "PDF Notes",
  "Past Paper",
  "Reference",
  "Link",
];

const courses = [
  "All Courses",
  "SE-401",
  "AI-402",
  "CS-405",
  "SE-406",
  "SE-407",
  "DS-408",
];

function ResourceIcon({ type }: { type: Resource["type"] }) {
  if (type === "Link") {
    return <Link2 size={19} />;
  }

  if (type === "Past Paper") {
    return <FileArchive size={19} />;
  }

  return <FileText size={19} />;
}

function getIconStyle(type: Resource["type"]) {
  if (type === "Past Paper") {
    return "bg-amber-50 text-amber-600";
  }

  if (type === "Link") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (type === "PDF Notes") {
    return "bg-rose-50 text-rose-600";
  }

  return "bg-indigo-50 text-indigo-600";
}

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const query = search.toLowerCase();

      const matchesSearch =
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.courseName.toLowerCase().includes(query) ||
        resource.course.toLowerCase().includes(query);

      const matchesType = activeType === "All" || resource.type === activeType;

      const matchesCourse =
        selectedCourse === "All Courses" || resource.course === selectedCourse;

      return matchesSearch && matchesType && matchesCourse;
    });
  }, [search, activeType, selectedCourse]);

  return (
    <AppShell>
      <div className="mx-auto max-w-350">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              <Library size={15} />
              Academic Library
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Resources
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Access lecture materials, notes, past papers and academic
              resources.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
            <FolderOpen size={16} className="text-indigo-600" />
            <span className="text-xs font-semibold text-gray-600">
              {resources.length} resources available
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Resources</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">128</p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Library size={18} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Lecture Materials</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">54</p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <BookOpen size={18} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Past Papers</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">31</p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <FileArchive size={18} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Your Downloads</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">26</p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Download size={18} />
              </div>
            </div>
          </Card>
        </div>

        {/* Search + Course Filter */}
        <Card className="mb-5 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3">
              <Search size={17} className="text-gray-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources, courses or topics..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-xs font-semibold text-gray-600 outline-none focus:border-indigo-400 lg:w-45"
              >
                {courses.map((course) => (
                  <option key={course}>{course}</option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </Card>

        {/* Type filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="mr-1 flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Filter size={14} />
            Type:
          </div>

          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={[
                "rounded-lg px-3 py-2 text-xs font-semibold transition",
                activeType === type
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Recent resources */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-950">
              Course Resources
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Materials shared by your university and instructors.
            </p>
          </div>

          <span className="text-xs text-gray-400">
            {filteredResources.length} results
          </span>
        </div>

        {/* Resource list */}
        <Card className="overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="group flex flex-col gap-4 p-5 transition hover:bg-gray-50/70 sm:flex-row sm:items-center"
              >
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${getIconStyle(
                    resource.type,
                  )}`}
                >
                  <ResourceIcon type={resource.type} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                      {resource.course}
                    </span>

                    <span className="text-[10px] font-medium text-gray-400">
                      {resource.type}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-gray-900">
                    {resource.title}
                  </h3>

                  <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                    {resource.description}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-400">
                    <span>{resource.courseName}</span>

                    <span className="flex items-center gap-1">
                      <Clock3 size={11} />
                      {resource.date}
                    </span>

                    <span>{resource.downloads} downloads</span>

                    {resource.size && <span>{resource.size}</span>}
                  </div>
                </div>

                <button
                  className={[
                    "flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition",
                    resource.type === "Link"
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-indigo-600 text-white hover:bg-indigo-700",
                  ].join(" ")}
                >
                  {resource.type === "Link" ? (
                    <>
                      <Link2 size={14} />
                      Open Link
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      Download
                    </>
                  )}
                </button>
              </div>
            ))}

            {filteredResources.length === 0 && (
              <div className="p-14 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-gray-400">
                  <Search size={20} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-gray-900">
                  No resources found
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Try another search or filter.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Bottom info */}
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
          <div className="flex gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
              <Library size={16} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Academic Resource Library
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Resources uploaded by authorized university departments and
                faculty members are organized here for easy student access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
