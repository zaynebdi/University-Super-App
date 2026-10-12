"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Loader2,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

import Card from "@/components/ui/Card";
import {
  api,
  ApiError,
  type AttendanceStatus,
  type CourseDTO,
  type CourseStudentDTO,
  type TeacherProfileDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type RosterData = {
  me: TeacherProfileDTO;
  courses: CourseDTO[];
};

type Roster = {
  key: string;
  students: CourseStudentDTO[];
  marks: Record<string, AttendanceStatus>;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function FacultyAttendancePage() {
  const { data, error } = useApiResource<RosterData>(async () => {
    const me = await api.teachers.me();
    const courses = await api.courses.list({ teacherId: me.id });
    return { me, courses };
  });

  const courses = data?.courses ?? [];

  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState("2026-09-24");
  const [session, setSession] = useState("09:00 AM – 10:00 AM");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roster, setRoster] = useState<Roster | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const selectedCourseId = courseId || courses[0]?.id || "";
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const courseLabel = selectedCourse
    ? `${selectedCourse.code} · ${selectedCourse.title}`
    : "—";
  const rosterKey = selectedCourseId ? `${selectedCourseId}|${date}` : "";

  useEffect(() => {
    if (!selectedCourseId) return;

    let active = true;

    (async () => {
      try {
        const [students, attendance] = await Promise.all([
          api.courses.students(selectedCourseId),
          api.attendance.byCourse(selectedCourseId, date),
        ]);

        if (!active) return;

        const marks: Record<string, AttendanceStatus> = {};
        for (const student of students) marks[student.id] = "present";
        for (const record of attendance) {
          if (record.studentId in marks) marks[record.studentId] = record.status;
        }

        setRoster({ key: `${selectedCourseId}|${date}`, students, marks });
        setRosterError(null);
        setSaved(false);
      } catch (e) {
        if (active) {
          setRosterError(
            e instanceof ApiError ? e.message : "Failed to load attendance",
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedCourseId, date, rosterKey]);

  const rosterReady = roster !== null && roster.key === rosterKey;
  const rosterLoading = Boolean(rosterKey) && !rosterReady;
  const students = rosterReady ? roster.students : [];
  const marks = rosterReady ? roster.marks : {};

  const filteredStudents = useMemo(() => {
    if (!rosterReady || !roster) return [];
    const query = search.trim().toLowerCase();
    if (!query) return roster.students;
    return roster.students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query),
    );
  }, [roster, rosterReady, search]);

  const presentCount = students.filter(
    (student) => marks[student.id] === "present",
  ).length;

  const absentCount = students.filter(
    (student) => marks[student.id] === "absent",
  ).length;

  const attendanceRate = students.length
    ? Math.round((presentCount / students.length) * 100)
    : 0;

  const setAttendance = (studentId: string, status: AttendanceStatus) => {
    setRoster((current) =>
      current && current.key === rosterKey
        ? { ...current, marks: { ...current.marks, [studentId]: status } }
        : current,
    );

    setSaved(false);
  };

  const markAll = (status: AttendanceStatus) => {
    setRoster((current) =>
      current && current.key === rosterKey
        ? {
            ...current,
            marks: Object.fromEntries(
              current.students.map((student) => [student.id, status]),
            ),
          }
        : current,
    );

    setSaved(false);
  };

  const saveAttendance = async () => {
    if (!rosterReady || students.length === 0) return;

    setSaving(true);
    setRosterError(null);

    try {
      await api.attendance.save({
        courseId: selectedCourseId,
        date,
        records: students.map((student) => ({
          studentId: student.id,
          status: marks[student.id],
        })),
      });

      setSaved(true);
    } catch (e) {
      setRosterError(
        e instanceof ApiError ? e.message : "Failed to save attendance",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-375 space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700">
            <ClipboardCheck size={13} />
            Faculty Attendance Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Attendance
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Record, review, and manage attendance for your courses with a single
            attendance workspace.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Download size={16} />
            Export Report
          </button>

          <button
            onClick={saveAttendance}
            disabled={saving || !rosterReady}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saved ? <Check size={16} /> : <ClipboardCheck size={16} />}
            {saved ? "Attendance Saved" : "Save Attendance"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {rosterError && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {rosterError}
        </div>
      )}

      {/* Course / Session selector */}
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Course
            </label>

            <select
              value={selectedCourseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setSaved(false);
              }}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-indigo-400"
            >
              {courses.length === 0 && <option value="">No courses</option>}
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Attendance Date
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSaved(false);
                }}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-700 outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Class Session
            </label>

            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-400"
            >
              <option>09:00 AM – 10:00 AM</option>
              <option>11:00 AM – 12:00 PM</option>
              <option>02:00 PM – 03:00 PM</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AttendanceStat
          label="Total Students"
          value={students.length.toString()}
          description="Enrolled in course"
          icon={<Users size={18} />}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <AttendanceStat
          label="Present"
          value={presentCount.toString()}
          description="Marked present"
          icon={<UserCheck size={18} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <AttendanceStat
          label="Absent"
          value={absentCount.toString()}
          description="Marked absent"
          icon={<UserX size={18} />}
          iconClass="bg-rose-50 text-rose-600"
        />

        <AttendanceStat
          label="Session Rate"
          value={`${attendanceRate}%`}
          description="Current attendance"
          icon={<ClipboardCheck size={18} />}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Main attendance workspace */}
      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-950">
                Mark Attendance
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {courseLabel} · {date} · {session}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 sm:w-64">
                <Search size={16} className="text-gray-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student..."
                  className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                onClick={() => markAll("present")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <CheckCircle2 size={15} />
                Mark All Present
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Student
                </th>

                <th className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Roll No
                </th>

                <th className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Department
                </th>

                <th className="px-3 py-3.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Attendance
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {rosterLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Loader2 size={16} className="animate-spin" />
                      Loading students…
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const status = marks[student.id];

                  return (
                    <tr
                      key={student.id}
                      className="transition hover:bg-gray-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                            {initials(student.name)}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {student.name}
                            </p>

                            <p className="mt-0.5 text-[11px] text-gray-400">
                              {student.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <span className="text-xs font-semibold text-gray-700">
                          {student.rollNo}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <span className="text-xs text-gray-500">
                          {student.department || "—"}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex justify-center gap-2">
                          <AttendanceButton
                            label="Present"
                            active={status === "present"}
                            type="present"
                            onClick={() => setAttendance(student.id, "present")}
                          />

                          <AttendanceButton
                            label="Absent"
                            active={status === "absent"}
                            type="absent"
                            onClick={() => setAttendance(student.id, "absent")}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {!rosterLoading && filteredStudents.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Search className="mx-auto text-gray-300" size={22} />

              <p className="mt-3 text-sm font-semibold text-gray-800">
                No students found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {students.length === 0
                  ? "No students are enrolled in this course."
                  : "Try another student name or roll number."}
              </p>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col justify-between gap-3 border-t border-gray-100 bg-gray-50/40 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{presentCount} Present</span>

            <div className="ml-2 h-2 w-2 rounded-full bg-rose-500" />
            <span>{absentCount} Absent</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => markAll("absent")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Mark All Absent
            </button>

            <button
              onClick={saveAttendance}
              disabled={saving || !rosterReady}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Save Session
            </button>
          </div>
        </div>
      </Card>

      {/* Attendance insights */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardCheck size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-950">
                Attendance Overview
              </h2>

              <p className="text-[11px] text-gray-400">
                Current session breakdown
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
              <div
                className="bg-emerald-500"
                style={{
                  width: `${students.length ? (presentCount / students.length) * 100 : 0}%`,
                }}
              />

              <div
                className="bg-rose-400"
                style={{
                  width: `${students.length ? (absentCount / students.length) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <Breakdown
                label="Present"
                value={presentCount}
                total={students.length}
                dot="bg-emerald-500"
              />

              <Breakdown
                label="Absent"
                value={absentCount}
                total={students.length}
                dot="bg-rose-400"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <ClipboardCheck size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-950">
                Attendance Notes
              </h2>

              <p className="text-[11px] text-gray-400">
                Faculty workflow guidance
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Note
              icon={<Check size={14} />}
              text="Present students are included in the session attendance."
            />

            <Note
              icon={<X size={14} />}
              text="Absent students are excluded from the session attendance."
            />
          </div>
        </Card>
      </div>

      {/* Backend note */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
        <div className="flex gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <ClipboardCheck size={17} />
          </div>

          <div>
            <p className="text-xs font-semibold text-indigo-900">
              Attendance records workspace
            </p>

            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-indigo-700/70">
              Attendance sessions and student records are loaded and persisted
              through the university API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceStat({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
            {value}
          </p>

          <p className="mt-3 text-[11px] text-gray-400">{description}</p>
        </div>

        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

function AttendanceButton({
  label,
  active,
  type,
  onClick,
}: {
  label: string;
  active: boolean;
  type: AttendanceStatus;
  onClick: () => void;
}) {
  const base =
    "rounded-lg border px-3 py-2 text-[10px] font-semibold transition";

  const activeClasses =
    type === "present"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  const inactiveClasses =
    "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600";

  return (
    <button
      onClick={onClick}
      className={`${base} ${active ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
}

function Breakdown({
  label,
  value,
  total,
  dot,
}: {
  label: string;
  value: number;
  total: number;
  dot: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>

      <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>

      <p className="text-[10px] text-gray-400">
        {total ? Math.round((value / total) * 100) : 0}% of class
      </p>
    </div>
  );
}

function Note({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-gray-500 shadow-sm">
        {icon}
      </div>

      <p className="text-[11px] leading-5 text-gray-500">{text}</p>
    </div>
  );
}
