"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Users,
  ClipboardCheck,
  FileText,
  BarChart3,
  Upload,
  Plus,
  CalendarDays,
  MapPin,
  Clock3,
  MoreHorizontal,
  Search,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  GraduationCap,
  Download,
} from "lucide-react";
import Card from "@/components/ui/Card";

type Student = {
  id: string;
  name: string;
  studentId: string;
  attendance: number;
  grade: string;
  performance: number;
  status: "On Track" | "Needs Attention";
};

const course = {
  code: "SE-401",
  name: "Software Architecture",
  description:
    "Architectural patterns, distributed application design and scalable software systems.",
  students: 42,
  credits: 3,
  attendance: 94,
  performance: 88,
  progress: 82,
  room: "Lab 3",
  schedule: "Monday · 09:00 AM",
  semester: "Fall 2026",
};

const students: Student[] = [
  {
    id: "1",
    name: "Ahmed Hassan",
    studentId: "SE-2022-101",
    attendance: 96,
    grade: "A",
    performance: 92,
    status: "On Track",
  },
  {
    id: "2",
    name: "Ayesha Malik",
    studentId: "SE-2022-102",
    attendance: 94,
    grade: "A-",
    performance: 88,
    status: "On Track",
  },
  {
    id: "3",
    name: "Hamza Ali",
    studentId: "SE-2022-103",
    attendance: 91,
    grade: "B+",
    performance: 84,
    status: "On Track",
  },
  {
    id: "4",
    name: "Fatima Noor",
    studentId: "SE-2022-105",
    attendance: 82,
    grade: "B",
    performance: 76,
    status: "Needs Attention",
  },
  {
    id: "5",
    name: "Usman Tariq",
    studentId: "SE-2022-106",
    attendance: 88,
    grade: "B+",
    performance: 81,
    status: "On Track",
  },
  {
    id: "6",
    name: "Maham Khan",
    studentId: "SE-2022-107",
    attendance: 79,
    grade: "C+",
    performance: 68,
    status: "Needs Attention",
  },
];

const assignments = [
  {
    title: "Microservices Architecture Report",
    type: "Report",
    due: "26 Sep 2026",
    submissions: "30 / 42",
    status: "Active",
  },
  {
    title: "Architecture Pattern Analysis",
    type: "Assignment",
    due: "02 Oct 2026",
    submissions: "18 / 42",
    status: "Active",
  },
  {
    title: "Distributed System Design",
    type: "Project",
    due: "10 Oct 2026",
    submissions: "0 / 42",
    status: "Draft",
  },
];

const resources = [
  {
    title: "Lecture 08 — Microservices Architecture",
    type: "Lecture Slides",
    size: "4.8 MB",
  },
  {
    title: "Software Architecture Complete Notes",
    type: "PDF Notes",
    size: "2.1 MB",
  },
  {
    title: "Architecture Patterns Reference",
    type: "Reference",
    size: "1.4 MB",
  },
];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "students", label: "Students" },
  { id: "assignments", label: "Assignments" },
  { id: "resources", label: "Resources" },
];

export default function FacultyCourseDetailsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [studentSearch, setStudentSearch] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.studentId.toLowerCase().includes(studentSearch.toLowerCase()),
    );
  }, [studentSearch]);

  return (
    <div className="mx-auto max-w-375">
      {/* Back */}
      <Link
        href="/faculty/courses"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={15} />
        Back to My Courses
      </Link>

      {/* Course Hero */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-linear-to-br from-gray-950 via-gray-900 to-indigo-950 p-6 text-white shadow-xl lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col justify-between gap-7 lg:flex-row">
            <div className="flex min-w-0 items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
                <BookOpen size={23} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold tracking-wider text-indigo-300">
                    {course.code}
                  </span>

                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300">
                    ACTIVE
                  </span>

                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-white/60">
                    {course.semester}
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">
                  {course.name}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  {course.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/45">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} />
                    {course.students} students
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {course.schedule}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} />
                    {course.room}
                  </span>

                  <span>{course.credits} credits</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10">
                <MoreHorizontal size={15} />
                More
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-gray-900 hover:bg-gray-100">
                <Upload size={15} />
                Upload Resource
              </button>
            </div>
          </div>

          {/* Hero metrics */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Students
              </p>
              <p className="mt-1 text-xl font-bold">{course.students}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Attendance
              </p>
              <p className="mt-1 text-xl font-bold">{course.attendance}%</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Performance
              </p>
              <p className="mt-1 text-xl font-bold">{course.performance}%</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Completion
              </p>
              <p className="mt-1 text-xl font-bold">{course.progress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "relative whitespace-nowrap px-5 py-4 text-xs font-semibold transition",
                activeTab === tab.id
                  ? "text-indigo-600"
                  : "text-gray-400 hover:text-gray-700",
              ].join(" ")}
            >
              {tab.label}

              {activeTab === tab.id && (
                <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            {/* Performance */}
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-950">
                      Course Performance
                    </h2>
                    <p className="mt-1 text-xs text-gray-400">
                      Current student performance across assessments.
                    </p>
                  </div>

                  <BarChart3 size={18} className="text-indigo-500" />
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-6 sm:grid-cols-3">
                  <Metric
                    label="Average Score"
                    value="88%"
                    change="+4.2%"
                    positive
                  />

                  <Metric
                    label="Pass Rate"
                    value="95%"
                    change="+2.8%"
                    positive
                  />

                  <Metric
                    label="At Risk"
                    value="4"
                    change="students"
                    positive={false}
                  />
                </div>

                <div className="mt-8">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Assessment performance
                    </span>

                    <span className="text-xs font-bold text-gray-900">88%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: "88%" }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-[10px] text-gray-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <PerformanceBar label="Assignments" value={91} />
                  <PerformanceBar label="Quizzes" value={86} />
                  <PerformanceBar label="Projects" value={83} />
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 p-6">
                <h2 className="font-semibold text-gray-950">Course Actions</h2>

                <p className="mt-1 text-xs text-gray-400">
                  Common teaching operations.
                </p>
              </div>

              <div className="grid gap-2 p-5">
                <ActionButton
                  icon={ClipboardCheck}
                  title="Take Attendance"
                  description="Record today's attendance"
                />

                <ActionButton
                  icon={Plus}
                  title="Create Assignment"
                  description="Publish new coursework"
                />

                <ActionButton
                  icon={GraduationCap}
                  title="Enter Grades"
                  description="Update student results"
                />

                <ActionButton
                  icon={Upload}
                  title="Upload Resource"
                  description="Share notes or lecture files"
                />

                <ActionButton
                  icon={Users}
                  title="View Students"
                  description="Open complete student list"
                />
              </div>
            </Card>
          </div>

          {/* Attendance + Upcoming */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-950">
                      Attendance Overview
                    </h2>
                    <p className="mt-1 text-xs text-gray-400">
                      Attendance distribution across the class.
                    </p>
                  </div>

                  <ClipboardCheck size={18} className="text-emerald-500" />
                </div>
              </div>

              <div className="space-y-5 p-6">
                <AttendanceRow label="90% – 100%" count={31} percentage={74} />

                <AttendanceRow label="80% – 89%" count={7} percentage={17} />

                <AttendanceRow
                  label="Below 80%"
                  count={4}
                  percentage={9}
                  warning
                />
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <div>
                  <h2 className="font-semibold text-gray-950">Upcoming Work</h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Important course deadlines.
                  </p>
                </div>

                <FileText size={18} className="text-indigo-500" />
              </div>

              <div className="divide-y divide-gray-100">
                {assignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.title} className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FileText size={15} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900">
                          {assignment.title}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-gray-400">
                          <span>Due {assignment.due}</span>
                          <span>{assignment.submissions} submitted</span>
                        </div>
                      </div>

                      <ChevronRight size={15} className="mt-1 text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Students */}
      {activeTab === "students" && (
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-semibold text-gray-950">
                  Enrolled Students
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {course.students} students enrolled in {course.code}.
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students..."
                  className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-xs outline-none focus:border-indigo-300 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Student
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                          {student.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {student.name}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {student.studentId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-700">
                        {student.attendance}%
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                        {student.grade}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{
                              width: `${student.performance}%`,
                            }}
                          />
                        </div>

                        <span className="text-[10px] font-semibold text-gray-600">
                          {student.performance}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold",
                          student.status === "On Track"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600",
                        ].join(" ")}
                      >
                        {student.status === "On Track" ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <AlertCircle size={11} />
                        )}
                        {student.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <ChevronRight size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="py-14 text-center">
              <Users size={22} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-700">
                No students found
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Assignments */}
      {activeTab === "assignments" && (
        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-gray-950">
                Course Assignments
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Create, manage and review course assessments.
              </p>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700">
              <Plus size={15} />
              New Assignment
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {assignments.map((assignment) => (
              <div
                key={assignment.title}
                className="p-6 transition hover:bg-gray-50/60"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {assignment.title}
                      </h3>

                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-[9px] font-bold",
                          assignment.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500",
                        ].join(" ")}
                      >
                        {assignment.status}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-gray-400">
                      <span>{assignment.type}</span>
                      <span>Due {assignment.due}</span>
                      <span>{assignment.submissions} submissions</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
                      Edit
                    </button>

                    <button className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-100">
                      Review
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resources */}
      {activeTab === "resources" && (
        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-gray-950">Course Resources</h2>
              <p className="mt-1 text-xs text-gray-400">
                Teaching material available to enrolled students.
              </p>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700">
              <Upload size={15} />
              Upload Resource
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {resources.map((resource) => (
              <div
                key={resource.title}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {resource.title}
                  </h3>

                  <div className="mt-1 flex gap-4 text-[10px] text-gray-400">
                    <span>{resource.type}</span>
                    <span>{resource.size}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
                    <Download size={13} />
                    Download
                  </button>

                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Backend note */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
            <TrendingUp size={16} />
          </div>

          <div>
            <p className="text-sm font-semibold text-indigo-950">
              Backend-ready course workspace
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-700/70">
              This page is currently powered by mock data. Later, each tab will
              connect to course, enrollment, attendance, assignment, submission,
              grade and resource APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
      <p className="text-[10px] text-gray-400">{label}</p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
        {value}
      </p>

      <p
        className={[
          "mt-2 text-[10px] font-semibold",
          positive ? "text-emerald-600" : "text-amber-600",
        ].join(" ")}
      >
        {positive ? "↑" : "•"} {change}
      </p>
    </div>
  );
}

function PerformanceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="flex justify-between">
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className="text-[10px] font-semibold text-gray-700">
          {value}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function AttendanceRow({
  label,
  count,
  percentage,
  warning = false,
}: {
  label: string;
  count: number;
  percentage: number;
  warning?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>

        <span
          className={[
            "text-xs font-semibold",
            warning ? "text-amber-600" : "text-gray-700",
          ].join(" ")}
        >
          {count} students
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={[
            "h-full rounded-full",
            warning ? "bg-amber-400" : "bg-indigo-500",
          ].join(" ")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ClipboardCheck;
  title: string;
  description: string;
}) {
  return (
    <button className="group flex items-center gap-3 rounded-xl border border-gray-200 p-3.5 text-left transition hover:border-indigo-100 hover:bg-indigo-50/40">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-indigo-100 group-hover:text-indigo-600">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-800">{title}</p>
        <p className="mt-0.5 text-[10px] text-gray-400">{description}</p>
      </div>

      <ChevronRight
        size={14}
        className="text-gray-300 transition group-hover:text-indigo-500"
      />
    </button>
  );
}
