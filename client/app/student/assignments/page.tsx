"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  FileText,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Search,
  Filter,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

const assignments = [
  {
    id: "software-architecture-01",
    title: "Microservices Architecture Report",
    course: "SE-401",
    courseName: "Software Architecture",
    dueDate: "26 Sep 2026",
    dueTime: "11:59 PM",
    status: "Pending",
    priority: "High",
    marks: "20 Marks",
  },
  {
    id: "ai-402-01",
    title: "Intelligent Search using A*",
    course: "AI-402",
    courseName: "Artificial Intelligence",
    dueDate: "28 Sep 2026",
    dueTime: "11:59 PM",
    status: "Pending",
    priority: "Medium",
    marks: "15 Marks",
  },
  {
    id: "cs-405-01",
    title: "Network Security Assessment",
    course: "CS-405",
    courseName: "Cyber Security",
    dueDate: "30 Sep 2026",
    dueTime: "05:00 PM",
    status: "Submitted",
    priority: "Medium",
    marks: "20 Marks",
  },
  {
    id: "se-406-01",
    title: "Next.js Full Stack Application",
    course: "SE-406",
    courseName: "Web Engineering",
    dueDate: "02 Oct 2026",
    dueTime: "11:59 PM",
    status: "Pending",
    priority: "High",
    marks: "25 Marks",
  },
  {
    id: "se-407-01",
    title: "Test Automation Project",
    course: "SE-407",
    courseName: "Software Testing",
    dueDate: "20 Sep 2026",
    dueTime: "11:59 PM",
    status: "Overdue",
    priority: "High",
    marks: "15 Marks",
  },
  {
    id: "ds-408-01",
    title: "Distributed Systems Case Study",
    course: "DS-408",
    courseName: "Distributed Systems",
    dueDate: "05 Oct 2026",
    dueTime: "11:59 PM",
    status: "Submitted",
    priority: "Low",
    marks: "10 Marks",
  },
];

const filters = ["All", "Pending", "Submitted", "Overdue"];

function getStatusStyle(status: string) {
  if (status === "Submitted") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (status === "Overdue") {
    return "bg-red-50 text-red-500";
  }

  return "bg-amber-50 text-amber-600";
}

function getPriorityStyle(priority: string) {
  if (priority === "High") {
    return "bg-red-50 text-red-500";
  }

  if (priority === "Medium") {
    return "bg-amber-50 text-amber-600";
  }

  return "bg-gray-100 text-gray-500";
}

export default function AssignmentsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(search.toLowerCase()) ||
        assignment.course.toLowerCase().includes(search.toLowerCase()) ||
        assignment.courseName.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || assignment.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const pendingCount = assignments.filter(
    (item) => item.status === "Pending",
  ).length;

  const submittedCount = assignments.filter(
    (item) => item.status === "Submitted",
  ).length;

  const overdueCount = assignments.filter(
    (item) => item.status === "Overdue",
  ).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
            <FileText size={15} />
            Academic Work
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Assignments
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track deadlines, submissions and coursework.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Assignments</p>

                <p className="mt-2 text-3xl font-bold text-gray-950">
                  {assignments.length}
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileText size={18} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Pending</p>

                <p className="mt-2 text-3xl font-bold text-gray-950">
                  {pendingCount}
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 size={18} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Submitted</p>

                <p className="mt-2 text-3xl font-bold text-gray-950">
                  {submittedCount}
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Overdue</p>

                <p className="mt-2 text-3xl font-bold text-gray-950">
                  {overdueCount}
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500">
                <AlertTriangle size={18} />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 lg:max-w-md">
              <Search size={17} className="text-gray-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assignments..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-1 flex items-center gap-2 text-xs text-gray-400">
                <Filter size={14} />
                Filter
              </div>

              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-semibold transition",
                    activeFilter === filter
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Assignments */}
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-base font-bold text-gray-950">
              All Assignments
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              {filteredAssignments.length} assignment
              {filteredAssignments.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredAssignments.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <FileText size={32} className="mx-auto text-gray-300" />

                <p className="mt-4 text-sm font-semibold text-gray-700">
                  No assignments found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Try changing your search or filter.
                </p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/student/assignments/${assignment.id}`}
                  className="group block px-6 py-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                    {/* Icon */}
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FileText size={19} />
                    </div>

                    {/* Main information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">
                          {assignment.course}
                        </span>

                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-semibold ${getPriorityStyle(
                            assignment.priority,
                          )}`}
                        >
                          {assignment.priority} Priority
                        </span>
                      </div>

                      <h3 className="mt-2 text-sm font-bold text-gray-900 group-hover:text-indigo-600">
                        {assignment.title}
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        {assignment.courseName}
                      </p>
                    </div>

                    {/* Due date */}
                    <div className="flex items-center gap-3 xl:w-47.5">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gray-50 text-gray-400">
                        <CalendarDays size={16} />
                      </div>

                      <div>
                        <p className="text-[10px] text-gray-400">Due Date</p>

                        <p className="mt-1 text-xs font-semibold text-gray-700">
                          {assignment.dueDate}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {assignment.dueTime}
                        </p>
                      </div>
                    </div>

                    {/* Marks */}
                    <div className="xl:w-25">
                      <p className="text-[10px] text-gray-400">Assessment</p>

                      <p className="mt-1 text-xs font-semibold text-gray-700">
                        {assignment.marks}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="xl:w-27.5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold ${getStatusStyle(
                          assignment.status,
                        )}`}
                      >
                        {assignment.status}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="hidden h-9 w-9 place-items-center rounded-lg bg-gray-50 text-gray-400 transition group-hover:bg-indigo-50 group-hover:text-indigo-600 xl:grid">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
