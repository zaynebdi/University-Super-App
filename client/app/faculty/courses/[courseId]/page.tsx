"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  MoreHorizontal,
  Search,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  GraduationCap,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import {
  api,
  ApiError,
  type CourseDTO,
  type CourseStudentDTO,
  type TimetableEntryDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type CourseDetailsData = {
  course: CourseDTO;
  students: CourseStudentDTO[];
  timetable: TimetableEntryDTO[];
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "students", label: "Students" },
  { id: "assignments", label: "Assignments" },
  { id: "resources", label: "Resources" },
];

export default function FacultyCourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [studentSearch, setStudentSearch] = useState("");
  const { data, loading, error } = useApiResource<CourseDetailsData>(async () => {
    try {
      const [course, students, timetable] = await Promise.all([
        api.courses.get(courseId),
        api.courses.students(courseId),
        api.timetable.me(),
      ]);
      return { course, students, timetable };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        throw new Error("Course not found");
      }
      throw e;
    }
  });

  const filteredStudents = useMemo(() => {
    const list = data?.students ?? [];
    const q = studentSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.rollNo.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.department.toLowerCase().includes(q),
    );
  }, [data, studentSearch]);

  if (loading) {
    return (
      <div className="mx-auto max-w-375">
        <Card className="flex items-center gap-2 p-8 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading course…
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-375">
        <Link
          href="/faculty/courses"
          className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={15} />
          Back to My Courses
        </Link>

        <Card className="flex flex-col items-center gap-2 p-12 text-center">
          <AlertCircle size={22} className="text-gray-300" />
          <p className="text-sm font-semibold text-gray-800">
            {error ?? "Course not found"}
          </p>
        </Card>
      </div>
    );
  }

  const course = data.course;
  const students = data.students;
  const slot = data.timetable.find((entry) => entry.courseId === courseId);

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

                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-white/60">
                    Semester {course.semester}
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">
                  {course.title}
                </h1>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/45">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} />
                    {students.length} students
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {slot ? `${slot.day} · ${slot.startTime}` : "No scheduled slot"}
                  </span>

                  {slot?.room && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} />
                      {slot.room}
                    </span>
                  )}

                  <span>{course.creditHours} credits</span>
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
              <p className="mt-1 text-xl font-bold">{students.length}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Attendance
              </p>
              <p className="mt-1 text-xl font-bold">—</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Performance
              </p>
              <p className="mt-1 text-xl font-bold">—</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Completion
              </p>
              <p className="mt-1 text-xl font-bold">—</p>
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
                    value="—"
                    change="Not available"
                    positive={false}
                  />

                  <Metric
                    label="Pass Rate"
                    value="—"
                    change="Not available"
                    positive={false}
                  />

                  <Metric
                    label="At Risk"
                    value="—"
                    change="Not available"
                    positive={false}
                  />
                </div>

                <div className="mt-8">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Assessment performance
                    </span>

                    <span className="text-xs font-bold text-gray-900">—</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full w-0 rounded-full bg-indigo-500" />
                  </div>

                  <div className="mt-3 flex justify-between text-[10px] text-gray-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <PerformanceBar label="Assignments" value={null} />
                  <PerformanceBar label="Quizzes" value={null} />
                  <PerformanceBar label="Projects" value={null} />
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
                  {students.length} students enrolled in {course.code}.
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
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Department
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Semester
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

                        <p className="text-xs font-semibold text-gray-900">
                          {student.name}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-700">
                        {student.rollNo}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600">
                        {student.department}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600">
                        {student.email}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                        {student.semester}
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

          <div className="py-14 text-center">
            <FileText size={22} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-gray-700">
              No assignments yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Assignments will appear once the assignments API is connected.
            </p>
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

          <div className="py-14 text-center">
            <FileText size={22} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-gray-700">
              No resources yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Resources will appear once the resources API is connected.
            </p>
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
              Course details and enrolled students are powered by the course and
              enrollment APIs. Attendance, assignment, submission, grade and
              resource data will connect in a later phase.
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

function PerformanceBar({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="flex justify-between">
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className="text-[10px] font-semibold text-gray-700">
          {value === null ? "—" : `${value}%`}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${value ?? 0}%` }}
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
