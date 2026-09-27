"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  MoreHorizontal,
  UserRound,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  CalendarDays,
  FileText,
  Award,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import Card from "@/components/ui/Card";

type Course = {
  code: string;
  name: string;
  attendance: number;
  grade: string;
  score: number;
  progress: number;
};

const studentData = {
  "std-001": {
    name: "Ahmed Hassan",
    studentId: "SE-2022-041",
    initials: "AH",
    program: "BS Software Engineering",
    department: "Department of Software Engineering",
    semester: "8th Semester",
    status: "Active",
    email: "ahmed.hassan@university.edu",
    phone: "+92 300 1234567",
    joined: "Fall 2022",
    gpa: 3.91,
    cgpa: 3.84,
    attendance: 96,
    credits: 108,
    totalCredits: 132,
    courses: [
      {
        code: "SE-401",
        name: "Software Architecture",
        attendance: 98,
        grade: "A",
        score: 92,
        progress: 88,
      },
      {
        code: "AI-402",
        name: "Artificial Intelligence",
        attendance: 95,
        grade: "A",
        score: 90,
        progress: 84,
      },
      {
        code: "CS-405",
        name: "Cyber Security",
        attendance: 96,
        grade: "A+",
        score: 95,
        progress: 91,
      },
      {
        code: "SE-406",
        name: "Web Engineering",
        attendance: 94,
        grade: "A-",
        score: 88,
        progress: 82,
      },
      {
        code: "SE-407",
        name: "Software Testing",
        attendance: 93,
        grade: "A",
        score: 91,
        progress: 79,
      },
      {
        code: "DS-408",
        name: "Distributed Systems",
        attendance: 95,
        grade: "A-",
        score: 87,
        progress: 76,
      },
    ] as Course[],
  },

  "std-002": {
    name: "Ayesha Malik",
    studentId: "SE-2022-057",
    initials: "AM",
    program: "BS Software Engineering",
    department: "Department of Software Engineering",
    semester: "8th Semester",
    status: "Active",
    email: "ayesha.malik@university.edu",
    phone: "+92 301 4567890",
    joined: "Fall 2022",
    gpa: 3.82,
    cgpa: 3.79,
    attendance: 93,
    credits: 108,
    totalCredits: 132,
    courses: [
      {
        code: "SE-401",
        name: "Software Architecture",
        attendance: 94,
        grade: "A-",
        score: 88,
        progress: 88,
      },
      {
        code: "AI-402",
        name: "Artificial Intelligence",
        attendance: 91,
        grade: "A",
        score: 91,
        progress: 84,
      },
      {
        code: "CS-405",
        name: "Cyber Security",
        attendance: 95,
        grade: "A",
        score: 93,
        progress: 91,
      },
      {
        code: "SE-406",
        name: "Web Engineering",
        attendance: 92,
        grade: "A-",
        score: 87,
        progress: 82,
      },
      {
        code: "SE-407",
        name: "Software Testing",
        attendance: 93,
        grade: "A",
        score: 90,
        progress: 79,
      },
      {
        code: "DS-408",
        name: "Distributed Systems",
        attendance: 92,
        grade: "B+",
        score: 84,
        progress: 76,
      },
    ] as Course[],
  },

  "std-003": {
    name: "Hamza Ali",
    studentId: "SE-2022-063",
    initials: "HA",
    program: "BS Software Engineering",
    department: "Department of Software Engineering",
    semester: "8th Semester",
    status: "At Risk",
    email: "hamza.ali@university.edu",
    phone: "+92 302 9876543",
    joined: "Fall 2022",
    gpa: 2.94,
    cgpa: 3.02,
    attendance: 78,
    credits: 105,
    totalCredits: 132,
    courses: [
      {
        code: "SE-401",
        name: "Software Architecture",
        attendance: 82,
        grade: "B",
        score: 74,
        progress: 88,
      },
      {
        code: "AI-402",
        name: "Artificial Intelligence",
        attendance: 76,
        grade: "C+",
        score: 68,
        progress: 84,
      },
      {
        code: "CS-405",
        name: "Cyber Security",
        attendance: 81,
        grade: "B-",
        score: 71,
        progress: 91,
      },
      {
        code: "SE-406",
        name: "Web Engineering",
        attendance: 79,
        grade: "B",
        score: 73,
        progress: 82,
      },
      {
        code: "SE-407",
        name: "Software Testing",
        attendance: 75,
        grade: "C+",
        score: 66,
        progress: 79,
      },
      {
        code: "DS-408",
        name: "Distributed Systems",
        attendance: 74,
        grade: "C",
        score: 62,
        progress: 76,
      },
    ] as Course[],
  },
};

export default function FacultyStudentDetailsPage() {
  const params = useParams<{ studentId: string }>();

  const student =
    studentData[params.studentId as keyof typeof studentData] ??
    studentData["std-001"];

  const completedPercentage = Math.round(
    (student.credits / student.totalCredits) * 100,
  );

  return (
    <div className="mx-auto max-w-375 space-y-7">
      {/* Back */}
      <Link
        href="/faculty/students"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to Students
      </Link>

      {/* Student Hero */}
      <Card className="overflow-hidden">
        <div className="bg-linear-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white lg:p-8">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/10 text-xl font-bold shadow-xl ring-1 ring-white/10">
                {student.initials}
              </div>

              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-200">
                  <UserRound size={12} />
                  Student Profile
                </div>

                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  {student.name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
                  <span>{student.studentId}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
                  <span>{student.program}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
                  <span>{student.semester}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15">
                <Mail size={15} />
                Email
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-gray-900 transition hover:bg-gray-100">
                <MessageSquare size={15} />
                Message
              </button>

              <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/10 text-white hover:bg-white/15">
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Current GPA
              </p>
              <p className="mt-2 text-2xl font-bold">
                {student.gpa.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Cumulative CGPA
              </p>
              <p className="mt-2 text-2xl font-bold">
                {student.cgpa.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Attendance
              </p>
              <p className="mt-2 text-2xl font-bold">{student.attendance}%</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Academic Status
              </p>
              <p className="mt-2 text-lg font-bold">{student.status}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">Enrolled Courses</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">
                {student.courses.length}
              </p>
              <p className="mt-3 text-[11px] text-gray-400">Current semester</p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={18} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">Completed Credits</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">
                {student.credits}
                <span className="text-sm font-medium text-gray-400">
                  {" "}
                  / {student.totalCredits}
                </span>
              </p>
              <p className="mt-3 text-[11px] text-gray-400">
                Degree progress {completedPercentage}%
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <GraduationCap size={18} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">Academic Performance</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">
                {Math.round(
                  student.courses.reduce(
                    (sum, course) => sum + course.score,
                    0,
                  ) / student.courses.length,
                )}
                %
              </p>
              <p className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600">
                <TrendingUp size={12} />
                Current average
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Award size={18} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">Attendance</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">
                {student.attendance}%
              </p>
              <p className="mt-3 text-[11px] text-gray-400">
                Overall attendance
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <ClipboardCheck size={18} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        {/* Courses */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="text-base font-bold text-gray-950">
                Current Courses
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Academic performance across enrolled courses
              </p>
            </div>

            <button className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              Full Academic Record
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {student.courses.map((course) => (
              <div
                key={course.code}
                className="p-5 transition hover:bg-gray-50/60"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-[10px] font-bold text-indigo-600">
                      {course.code.split("-")[0]}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {course.name}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-400">
                        {course.code}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Attendance
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-800">
                        {course.attendance}%
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Score
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-800">
                        {course.score}%
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Grade
                      </p>
                      <p className="mt-1 text-sm font-bold text-indigo-600">
                        {course.grade}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      Course progress
                    </span>
                    <span className="text-[10px] font-semibold text-gray-600">
                      {course.progress}%
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contact */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <UserRound size={17} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-gray-950">
                  Student Information
                </h2>
                <p className="text-[11px] text-gray-400">
                  Profile and contact details
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {student.email}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Phone
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {student.phone}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Department
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {student.department}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Joined
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {student.joined}
                </p>
              </div>
            </div>
          </Card>

          {/* Academic Progress */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <GraduationCap size={17} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-gray-950">
                  Degree Progress
                </h2>
                <p className="text-[11px] text-gray-400">Credit completion</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-950">
                    {completedPercentage}%
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {student.credits} of {student.totalCredits} credits
                  </p>
                </div>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
                  {student.totalCredits - student.credits} remaining
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${completedPercentage}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock3 size={17} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-gray-950">
                  Recent Activity
                </h2>
                <p className="text-[11px] text-gray-400">
                  Latest student interactions
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Activity
                icon={<FileText size={14} />}
                title="Submitted assignment"
                description="Microservices Architecture Report"
                time="Today · 10:42 AM"
              />

              <Activity
                icon={<ClipboardCheck size={14} />}
                title="Attendance recorded"
                description="Software Architecture"
                time="Today · 09:58 AM"
              />

              <Activity
                icon={<BookOpen size={14} />}
                title="Viewed course resource"
                description="Architecture Patterns Reference"
                time="Yesterday · 04:15 PM"
              />

              <Activity
                icon={<CalendarDays size={14} />}
                title="Joined class session"
                description="Artificial Intelligence"
                time="Yesterday · 11:02 AM"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Faculty Actions */}
      <Card className="p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-indigo-600" />

              <h2 className="text-sm font-bold text-gray-950">
                Faculty Actions
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Quickly access common academic management actions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <ClipboardCheck size={15} />
              Attendance
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <Award size={15} />
              Grades
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <FileText size={15} />
              Assignments
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
              <MessageSquare size={15} />
              Contact Student
            </button>
          </div>
        </div>
      </Card>

      {/* Backend Ready */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
        <div className="flex gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <ShieldCheck size={17} />
          </div>

          <div>
            <p className="text-xs font-semibold text-indigo-900">
              Backend-ready student profile
            </p>

            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-indigo-700/70">
              This page is structured to consume student identity, enrollment,
              attendance, grades, course progress, and activity from FastAPI and
              PostgreSQL instead of relying on permanent frontend data.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "GET /api/faculty/students/{id}",
                "GET /api/faculty/students/{id}/academic",
                "GET /api/faculty/students/{id}/attendance",
                "GET /api/faculty/students/{id}/courses",
              ].map((api) => (
                <code
                  key={api}
                  className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] text-indigo-700 shadow-sm"
                >
                  {api}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Activity({
  icon,
  title,
  description,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-800">{title}</p>
        <p className="mt-0.5 truncate text-[11px] text-gray-400">
          {description}
        </p>
        <p className="mt-1 text-[10px] text-gray-300">{time}</p>
      </div>
    </div>
  );
}
