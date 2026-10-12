"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Loader2,
  MessageSquare,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";

import Card from "@/components/ui/Card";
import {
  api,
  ApiError,
  gradeFromMarks,
  type CourseDTO,
  type CourseResultsDTO,
  type TeacherProfileDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type GradeStatus = "Graded" | "Pending";

type GradeRow = {
  id: string;
  student: string;
  rollNo: string;
  email: string;
  initials: string;
  status: GradeStatus;
  marks: number | null;
  grade: string | null;
  resultId: string | null;
  feedback: string;
};

type CourseData = {
  me: TeacherProfileDTO;
  courses: CourseDTO[];
};

type Roster = {
  key: string;
  data: CourseResultsDTO;
};

const statusStyles: Record<GradeStatus, string> = {
  Graded: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Pending: "bg-gray-100 text-gray-500 border-gray-200",
};

const TOTAL_MARKS = 100;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function FacultyGradesPage() {
  const { data, loading, error } = useApiResource<CourseData>(async () => {
    const me = await api.teachers.me();
    const courses = await api.courses.list({ teacherId: me.id });
    return { me, courses };
  });

  const courses = data?.courses ?? [];

  const [courseId, setCourseId] = useState("");
  const [activeTab, setActiveTab] = useState<"Overview" | "Submissions">(
    "Overview",
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRow, setSelectedRow] = useState<GradeRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [roster, setRoster] = useState<Roster | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedCourseId = courseId || courses[0]?.id || "";
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);

  useEffect(() => {
    if (!selectedCourseId) return;

    let active = true;

    (async () => {
      try {
        const data = await api.results.byCourse(selectedCourseId);

        if (!active) return;

        setRoster({ key: selectedCourseId, data });
        setRosterError(null);
      } catch (e) {
        if (active) {
          setRosterError(
            e instanceof ApiError ? e.message : "Failed to load students",
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedCourseId, refreshKey]);

  const rosterReady = roster !== null && roster.key === selectedCourseId;

  const rows = useMemo<GradeRow[]>(() => {
    const list =
      roster && roster.key === selectedCourseId ? roster.data.students : [];

    return list.map((student) => ({
      id: student.id,
      student: student.name ?? "Unknown student",
      rollNo: student.rollNo,
      email: student.email ?? "",
      initials: initials(student.name ?? "?"),
      status: student.resultId ? "Graded" : "Pending",
      marks: student.marks,
      grade: student.grade,
      resultId: student.resultId,
      feedback: student.feedback ?? "",
    }));
  }, [roster, selectedCourseId]);

  const gradedCount = rows.filter((row) => row.status === "Graded").length;
  const pendingCount = rows.length - gradedCount;

  const averageMarks = useMemo(() => {
    if (roster && roster.key === selectedCourseId) {
      return roster.data.classAverage;
    }
    return 0;
  }, [roster, selectedCourseId]);

  const distribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      if (!row.grade) continue;
      map.set(row.grade, (map.get(row.grade) ?? 0) + 1);
    }
    return Array.from(map.entries());
  }, [rows]);

  const filteredRows = rows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      row.student.toLowerCase().includes(query) ||
      row.rollNo.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || row.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const rosterLoading = Boolean(selectedCourseId) && !rosterReady;

  const saveGrade = async (
    studentId: string,
    marks: number,
    feedback: string,
  ) => {
    if (!selectedCourseId) return;

    const grade = gradeFromMarks(marks);
    const row = rows.find((item) => item.id === studentId);
    const trimmedFeedback = feedback.trim();

    setNotice(null);

    try {
      if (row?.resultId) {
        await api.results.update(row.resultId, {
          marks,
          grade,
          feedback: trimmedFeedback,
        });
      } else {
        await api.results.create({
          studentId,
          courseId: selectedCourseId,
          marks,
          grade,
          feedback: trimmedFeedback,
        });
      }

      setSelectedRow(null);
      setRefreshKey((key) => key + 1);
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to save grade");
    }
  };

  const courseCode = selectedCourse?.code ?? "—";
  const courseTitle = selectedCourse?.title ?? "Gradebook";
  const semester = selectedCourse ? String(selectedCourse.semester) : "—";
  const creditHours = selectedCourse
    ? `${selectedCourse.creditHours} credits`
    : "—";

  return (
    <div className="mx-auto max-w-375 space-y-7">
      {/* Back */}
      <Link
        href="/faculty/courses"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft size={15} />
        Back to Courses
      </Link>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading && !data && (
        <Card className="p-10">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Loading gradebook…
          </div>
        </Card>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {notice}
        </div>
      )}

      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="relative bg-linear-to-br from-gray-950 via-indigo-950 to-violet-900 px-6 py-7 text-white lg:px-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col justify-between gap-6 lg:flex-row">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-indigo-200">
                  <FileText size={13} />
                  {courseCode} · Gradebook
                </div>

                <h1 className="max-w-3xl text-2xl font-bold tracking-tight lg:text-3xl">
                  {courseTitle}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                  Course Gradebook · Faculty Workspace
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white/70">
                    <CalendarDays size={12} />
                    Semester {semester}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white/70">
                    <Award size={12} />
                    {creditHours}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white/70">
                    <FileText size={12} />
                    {TOTAL_MARKS} marks
                  </span>
                </div>
              </div>

              <div className="grid min-w-57.5 grid-cols-2 gap-3 self-start">
                <HeroMetric label="Students" value={`${rows.length}`} />

                <HeroMetric label="Graded" value={`${gradedCount}`} />

                <HeroMetric label="Pending" value={`${pendingCount}`} />

                <HeroMetric
                  label="Avg. Marks"
                  value={`${averageMarks}/${TOTAL_MARKS}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Course selector + Tabs */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex overflow-x-auto">
            {(["Overview", "Submissions"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative whitespace-nowrap px-5 py-3 text-xs font-semibold transition ${
                  activeTab === tab
                    ? "text-indigo-600"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab}

                {tab === "Submissions" && (
                  <span className="ml-2 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px]">
                    {rows.length}
                  </span>
                )}

                {activeTab === tab && (
                  <span className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-indigo-600" />
                )}
              </button>
            ))}
          </div>

          <select
            value={selectedCourseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setSelectedRow(null);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-600 outline-none focus:border-indigo-400 lg:w-72"
          >
            {courses.length === 0 && <option value="">No courses</option>}
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} · {course.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {rosterError && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {rosterError}
        </div>
      )}

      {activeTab === "Overview" ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <Card className="p-6">
              <SectionHeader
                icon={<FileText size={17} />}
                title="Course Details"
                subtitle="Gradebook information"
              />

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900">
                  Instructions
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  Select a course to review enrolled students and record their
                  marks. Grades are derived from the entered marks.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Course"
                  value={`${courseCode} · ${courseTitle}`}
                />

                <InfoItem label="Semester" value={semester} />

                <InfoItem label="Credit Hours" value={creditHours} />

                <InfoItem
                  label="Maximum Marks"
                  value={`${TOTAL_MARKS} marks`}
                />
              </div>
            </Card>

            <Card className="p-6">
              <SectionHeader
                icon={<BarIcon />}
                title="Grading Progress"
                subtitle="Current course activity"
              />

              <div className="mt-6 space-y-5">
                <AnalyticsRow
                  label="Grading Progress"
                  value={`${Math.round(
                    (gradedCount / Math.max(rows.length, 1)) * 100,
                  )}%`}
                  percentage={Math.round(
                    (gradedCount / Math.max(rows.length, 1)) * 100,
                  )}
                />

                <AnalyticsRow
                  label="Pending Grading"
                  value={`${pendingCount}`}
                  percentage={Math.round(
                    (pendingCount / Math.max(rows.length, 1)) * 100,
                  )}
                />

                <AnalyticsRow
                  label="Average Marks"
                  value={`${averageMarks}/${TOTAL_MARKS}`}
                  percentage={Math.round((averageMarks / TOTAL_MARKS) * 100)}
                />
              </div>

              <button
                onClick={() => setActiveTab("Submissions")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Users size={15} />
                Review Students
              </button>
            </Card>
          </div>

          {/* Grade distribution */}
          <Card className="p-6">
            <SectionHeader
              icon={<Award size={17} />}
              title="Grade Distribution"
              subtitle="Grades recorded for this course"
            />

            {distribution.length === 0 ? (
              <p className="mt-6 text-sm text-gray-400">
                No grades recorded yet.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {distribution.map(([grade, count]) => (
                  <Criterion
                    key={grade}
                    title={grade}
                    percentage={`${count}`}
                    description={`${count} student${count === 1 ? "" : "s"}`}
                  />
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          {/* Student workspace */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    Enrolled Students
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Review students and record their marks.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 sm:w-64">
                    <Search size={15} className="text-gray-400" />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search student..."
                      className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={["All", "Graded", "Pending"]}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-237.5">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Student
                    </th>

                    <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Email
                    </th>

                    <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Status
                    </th>

                    <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Marks
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {rosterLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Loader2 size={16} className="animate-spin" />
                          Loading students…
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row.id}
                        className="transition hover:bg-gray-50/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                              {row.initials}
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-900">
                                {row.student}
                              </p>

                              <p className="mt-0.5 text-[10px] text-gray-400">
                                {row.rollNo}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-xs text-gray-500">
                          {row.email || "—"}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${statusStyles[row.status]}`}
                          >
                            {row.status}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          {row.marks !== null ? (
                            <span className="text-sm font-bold text-gray-800">
                              {row.marks}
                              <span className="text-[10px] font-normal text-gray-400">
                                /{TOTAL_MARKS}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedRow(row)}
                            className="rounded-xl bg-indigo-50 px-3 py-2 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            {row.status === "Graded"
                              ? "Update Grade"
                              : "Add Grade"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!rosterLoading && filteredRows.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Search className="mx-auto text-gray-300" size={22} />

                <p className="mt-3 text-sm font-semibold text-gray-800">
                  No students found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {rows.length === 0
                    ? "No students are enrolled in this course."
                    : "Try another student or status."}
                </p>
              </div>
            )}
          </Card>

          {/* Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SmallMetric
              label="Students"
              value={`${rows.length}`}
              description="Enrolled in course"
              icon={<Users size={17} />}
            />

            <SmallMetric
              label="Graded"
              value={`${gradedCount}`}
              description="Results recorded"
              icon={<CheckCircle2 size={17} />}
            />

            <SmallMetric
              label="Pending"
              value={`${pendingCount}`}
              description="Awaiting a grade"
              icon={<Clock3 size={17} />}
            />

            <SmallMetric
              label="Average Marks"
              value={`${averageMarks}/${TOTAL_MARKS}`}
              description="Across graded students"
              icon={<Award size={17} />}
            />
          </div>
        </>
      )}

      {/* Grading modal */}
      {selectedRow && (
        <GradeModal
          row={selectedRow}
          totalMarks={TOTAL_MARKS}
          onClose={() => setSelectedRow(null)}
          onSave={saveGrade}
        />
      )}
    </div>
  );
}

function GradeModal({
  row,
  totalMarks,
  onClose,
  onSave,
}: {
  row: GradeRow;
  totalMarks: number;
  onClose: () => void;
  onSave: (studentId: string, marks: number, feedback: string) => void;
}) {
  const [marks, setMarks] = useState(row.marks?.toString() || "");
  const [feedback, setFeedback] = useState(row.feedback);

  const numericMarks = Number(marks);
  const validMarks =
    marks.trim() !== "" &&
    !Number.isNaN(numericMarks) &&
    numericMarks >= 0 &&
    numericMarks <= totalMarks;
  const grade = validMarks ? gradeFromMarks(numericMarks) : null;

  const handleSave = () => {
    if (!validMarks) return;
    onSave(row.id, numericMarks, feedback);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {row.initials}
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-950">
                {row.student}
              </h2>

              <p className="mt-0.5 text-[11px] text-gray-400">{row.rollNo}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Marks */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Marks
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={totalMarks}
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="h-12 w-28 rounded-xl border border-gray-200 bg-white px-4 text-lg font-bold text-gray-900 outline-none focus:border-indigo-400"
              />

              <span className="text-sm text-gray-400">
                / {totalMarks} marks
              </span>
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Grade
            </label>

            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 min-w-16 items-center justify-center rounded-xl bg-indigo-50 px-4 text-lg font-bold text-indigo-700">
                {grade ?? "—"}
              </span>

              <span className="text-sm text-gray-400">
                Derived from marks
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Feedback
            </label>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              placeholder="Write feedback for the student..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-indigo-400"
            />
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex gap-3">
              <MessageSquare
                size={16}
                className="mt-0.5 shrink-0 text-indigo-600"
              />

              <p className="text-[11px] leading-5 text-indigo-700/75">
                Saving this grade records the marks, the derived grade and your
                feedback for the student in this course.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={!validMarks}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send size={14} />
            Save Grade
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3">
      <p className="text-[9px] uppercase tracking-wider text-white/40">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-950">{title}</h2>
        <p className="text-[11px] text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <p className="text-[10px] uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1.5 text-xs font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function AnalyticsRow({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-bold text-gray-800">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function Criterion({
  title,
  percentage,
  description,
}: {
  title: string;
  percentage: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-800">{title}</p>

        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
          {percentage}
        </span>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-gray-400">{description}</p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className="mt-2 text-xl font-bold text-gray-950">{value}</p>

          <p className="mt-2 text-[10px] text-gray-400">{description}</p>
        </div>

        <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 min-w-33.75 appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-9 text-xs text-gray-600 outline-none focus:border-indigo-400"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-3 text-gray-400"
      />
    </div>
  );
}

function BarIcon() {
  return (
    <div className="flex h-4 items-end gap-0.5">
      <span className="h-2 w-1.5 rounded-sm bg-indigo-400" />
      <span className="h-3 w-1.5 rounded-sm bg-indigo-500" />
      <span className="h-4 w-1.5 rounded-sm bg-indigo-600" />
    </div>
  );
}
