"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

import Card from "@/components/ui/Card";

type AttendanceStatus = "Present" | "Absent" | "Late";

type StudentAttendance = {
  id: string;
  name: string;
  studentId: string;
  initials: string;
  status: AttendanceStatus;
  attendance: number;
  lastAttendance: string;
};

const initialStudents: StudentAttendance[] = [
  {
    id: "std-001",
    name: "Ahmed Hassan",
    studentId: "SE-2022-041",
    initials: "AH",
    status: "Present",
    attendance: 98,
    lastAttendance: "Present · Sep 23",
  },
  {
    id: "std-002",
    name: "Ayesha Malik",
    studentId: "SE-2022-057",
    initials: "AM",
    status: "Present",
    attendance: 94,
    lastAttendance: "Present · Sep 23",
  },
  {
    id: "std-003",
    name: "Hamza Ali",
    studentId: "SE-2022-063",
    initials: "HA",
    status: "Late",
    attendance: 82,
    lastAttendance: "Late · Sep 23",
  },
  {
    id: "std-004",
    name: "Fatima Noor",
    studentId: "SE-2022-071",
    initials: "FN",
    status: "Present",
    attendance: 91,
    lastAttendance: "Present · Sep 23",
  },
  {
    id: "std-005",
    name: "Usman Tariq",
    studentId: "SE-2022-084",
    initials: "UT",
    status: "Absent",
    attendance: 76,
    lastAttendance: "Absent · Sep 23",
  },
  {
    id: "std-006",
    name: "Maham Khan",
    studentId: "SE-2022-091",
    initials: "MK",
    status: "Present",
    attendance: 89,
    lastAttendance: "Present · Sep 23",
  },
  {
    id: "std-007",
    name: "Bilal Ahmed",
    studentId: "SE-2022-103",
    initials: "BA",
    status: "Absent",
    attendance: 71,
    lastAttendance: "Absent · Sep 23",
  },
  {
    id: "std-008",
    name: "Hira Shah",
    studentId: "SE-2022-118",
    initials: "HS",
    status: "Present",
    attendance: 96,
    lastAttendance: "Present · Sep 23",
  },
  {
    id: "std-009",
    name: "Zainab Iqbal",
    studentId: "SE-2022-124",
    initials: "ZI",
    status: "Present",
    attendance: 93,
    lastAttendance: "Present · Sep 23",
  },
  {
    id: "std-010",
    name: "Danish Raza",
    studentId: "SE-2022-137",
    initials: "DR",
    status: "Present",
    attendance: 87,
    lastAttendance: "Present · Sep 23",
  },
];

const statusStyles: Record<AttendanceStatus, string> = {
  Present: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Absent: "bg-rose-50 text-rose-700 border-rose-100",
  Late: "bg-amber-50 text-amber-700 border-amber-100",
};

export default function FacultyAttendancePage() {
  const [students, setStudents] =
    useState<StudentAttendance[]>(initialStudents);

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("SE-401 · Software Architecture");
  const [date, setDate] = useState("2026-09-24");
  const [session, setSession] = useState("09:00 AM – 10:00 AM");
  const [saved, setSaved] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.studentId.toLowerCase().includes(search.toLowerCase()),
    );
  }, [students, search]);

  const presentCount = students.filter(
    (student) => student.status === "Present",
  ).length;

  const absentCount = students.filter(
    (student) => student.status === "Absent",
  ).length;

  const lateCount = students.filter(
    (student) => student.status === "Late",
  ).length;

  const attendanceRate = Math.round(
    ((presentCount + lateCount) / students.length) * 100,
  );

  const setAttendance = (studentId: string, status: AttendanceStatus) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId ? { ...student, status } : student,
      ),
    );

    setSaved(false);
  };

  const markAllPresent = () => {
    setStudents((current) =>
      current.map((student) => ({
        ...student,
        status: "Present",
      })),
    );

    setSaved(false);
  };

  const markAllAbsent = () => {
    setStudents((current) =>
      current.map((student) => ({
        ...student,
        status: "Absent",
      })),
    );

    setSaved(false);
  };

  const saveAttendance = () => {
    setSaved(true);
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
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            {saved ? <Check size={16} /> : <ClipboardCheck size={16} />}
            {saved ? "Attendance Saved" : "Save Attendance"}
          </button>
        </div>
      </div>

      {/* Course / Session selector */}
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Course
            </label>

            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-indigo-400"
            >
              <option>SE-401 · Software Architecture</option>
              <option>SE-406 · Web Engineering</option>
              <option>SE-407 · Software Testing</option>
              <option>SE-408 · Distributed Systems</option>
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
          label="Late"
          value={lateCount.toString()}
          description="Arrived late"
          icon={<Clock3 size={18} />}
          iconClass="bg-amber-50 text-amber-600"
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
                {course} · {date} · {session}
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
                onClick={markAllPresent}
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
                  Overall Attendance
                </th>

                <th className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Last Record
                </th>

                <th className="px-3 py-3.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Attendance
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="transition hover:bg-gray-50/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                        {student.initials}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {student.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          {student.studentId}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${student.attendance}%` }}
                        />
                      </div>

                      <span className="text-xs font-semibold text-gray-700">
                        {student.attendance}%
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <span className="text-xs text-gray-500">
                      {student.lastAttendance}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex justify-center gap-2">
                      <AttendanceButton
                        label="Present"
                        active={student.status === "Present"}
                        type="present"
                        onClick={() => setAttendance(student.id, "Present")}
                      />

                      <AttendanceButton
                        label="Late"
                        active={student.status === "Late"}
                        type="late"
                        onClick={() => setAttendance(student.id, "Late")}
                      />

                      <AttendanceButton
                        label="Absent"
                        active={student.status === "Absent"}
                        type="absent"
                        onClick={() => setAttendance(student.id, "Absent")}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Search className="mx-auto text-gray-300" size={22} />

              <p className="mt-3 text-sm font-semibold text-gray-800">
                No students found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Try another student name or ID.
              </p>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col justify-between gap-3 border-t border-gray-100 bg-gray-50/40 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{presentCount} Present</span>

            <div className="ml-2 h-2 w-2 rounded-full bg-amber-500" />
            <span>{lateCount} Late</span>

            <div className="ml-2 h-2 w-2 rounded-full bg-rose-500" />
            <span>{absentCount} Absent</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={markAllAbsent}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Mark All Absent
            </button>

            <button
              onClick={saveAttendance}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
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
                  width: `${(presentCount / students.length) * 100}%`,
                }}
              />

              <div
                className="bg-amber-400"
                style={{
                  width: `${(lateCount / students.length) * 100}%`,
                }}
              />

              <div
                className="bg-rose-400"
                style={{
                  width: `${(absentCount / students.length) * 100}%`,
                }}
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">
              <Breakdown
                label="Present"
                value={presentCount}
                total={students.length}
                dot="bg-emerald-500"
              />

              <Breakdown
                label="Late"
                value={lateCount}
                total={students.length}
                dot="bg-amber-400"
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
              <Clock3 size={17} />
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
              icon={<Clock3 size={14} />}
              text="Late students remain recorded as attending the session."
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
              Backend-ready attendance architecture
            </p>

            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-indigo-700/70">
              The current interface uses local state for the prototype. During
              backend integration, attendance sessions and student records will
              be loaded and persisted through FastAPI and PostgreSQL.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "GET /api/faculty/attendance",
                "GET /api/faculty/attendance/session/{id}",
                "POST /api/faculty/attendance/session",
                "PATCH /api/faculty/attendance/{id}",
                "GET /api/faculty/attendance/course/{course_id}",
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
  type: "present" | "late" | "absent";
  onClick: () => void;
}) {
  const base =
    "rounded-lg border px-3 py-2 text-[10px] font-semibold transition";

  const activeClasses =
    type === "present"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : type === "late"
        ? "border-amber-200 bg-amber-50 text-amber-700"
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
        {Math.round((value / total) * 100)}% of class
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
