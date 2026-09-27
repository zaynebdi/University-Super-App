"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  BookOpen,
  UserCheck,
  CalendarRange,
  X,
} from "lucide-react";

type ClassSession = {
  id: string;
  courseCode: string;
  courseName: string;
  day: string;
  start: string;
  end: string;
  room: string;
  students: number;
  type: "Lecture" | "Lab" | "Tutorial";
  color: string;
};

const initialSessions: ClassSession[] = [
  {
    id: "session-001",
    courseCode: "SE-401",
    courseName: "Software Architecture",
    day: "Monday",
    start: "09:00",
    end: "10:00",
    room: "Lab 3",
    students: 42,
    type: "Lecture",
    color: "indigo",
  },
  {
    id: "session-002",
    courseCode: "SE-406",
    courseName: "Web Engineering",
    day: "Monday",
    start: "11:00",
    end: "12:00",
    room: "Lab 2",
    students: 48,
    type: "Lab",
    color: "violet",
  },
  {
    id: "session-003",
    courseCode: "AI-402",
    courseName: "Artificial Intelligence",
    day: "Tuesday",
    start: "11:00",
    end: "12:00",
    room: "A-204",
    students: 46,
    type: "Lecture",
    color: "emerald",
  },
  {
    id: "session-004",
    courseCode: "SE-407",
    courseName: "Software Testing",
    day: "Wednesday",
    start: "10:00",
    end: "11:00",
    room: "B-112",
    students: 44,
    type: "Lecture",
    color: "amber",
  },
  {
    id: "session-005",
    courseCode: "CS-405",
    courseName: "Cyber Security",
    day: "Wednesday",
    start: "01:00",
    end: "02:00",
    room: "Cyber Lab",
    students: 40,
    type: "Lab",
    color: "rose",
  },
  {
    id: "session-006",
    courseCode: "SE-401",
    courseName: "Software Architecture",
    day: "Thursday",
    start: "09:00",
    end: "10:00",
    room: "Lab 3",
    students: 42,
    type: "Tutorial",
    color: "indigo",
  },
  {
    id: "session-007",
    courseCode: "SE-406",
    courseName: "Web Engineering",
    day: "Thursday",
    start: "01:00",
    end: "02:00",
    room: "Lab 2",
    students: 48,
    type: "Lecture",
    color: "violet",
  },
  {
    id: "session-008",
    courseCode: "DS-408",
    courseName: "Distributed Systems",
    day: "Friday",
    start: "02:00",
    end: "03:00",
    room: "A-301",
    students: 52,
    type: "Lecture",
    color: "cyan",
  },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
];

const courseOptions = [
  "SE-401",
  "SE-406",
  "SE-407",
  "AI-402",
  "CS-405",
  "DS-408",
];

export default function FacultyTimetablePage() {
  const [sessions, setSessions] = useState(initialSessions);
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(
    null,
  );

  const [showCreate, setShowCreate] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(
    null,
  );

  const [form, setForm] = useState({
    courseCode: "SE-401",
    day: "Monday",
    start: "09:00",
    end: "10:00",
    room: "",
    students: "42",
    type: "Lecture",
  });

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const courseMatch =
        selectedCourse === "All Courses" ||
        session.courseCode === selectedCourse;

      const typeMatch =
        selectedType === "All Types" || session.type === selectedType;

      return courseMatch && typeMatch;
    });
  }, [sessions, selectedCourse, selectedType]);

  const totalClasses = sessions.length;
  const totalStudents = sessions.reduce(
    (sum, session) => sum + session.students,
    0,
  );
  const uniqueRooms = new Set(sessions.map((s) => s.room)).size;
  const labs = sessions.filter((s) => s.type === "Lab").length;

  const getSession = (day: string, time: string) => {
    return filteredSessions.find(
      (session) => session.day === day && session.start === time,
    );
  };

  const resetForm = () => {
    setForm({
      courseCode: "SE-401",
      day: "Monday",
      start: "09:00",
      end: "10:00",
      room: "",
      students: "42",
      type: "Lecture",
    });
  };

  const createSession = () => {
    if (!form.room.trim()) return;

    const courseNames: Record<string, string> = {
      "SE-401": "Software Architecture",
      "SE-406": "Web Engineering",
      "SE-407": "Software Testing",
      "AI-402": "Artificial Intelligence",
      "CS-405": "Cyber Security",
      "DS-408": "Distributed Systems",
    };

    const newSession: ClassSession = {
      id: `session-${Date.now()}`,
      courseCode: form.courseCode,
      courseName: courseNames[form.courseCode],
      day: form.day,
      start: form.start,
      end: form.end,
      room: form.room,
      students: Number(form.students) || 0,
      type: form.type as ClassSession["type"],
      color: getCourseColor(form.courseCode),
    };

    setSessions((current) => [...current, newSession]);
    resetForm();
    setShowCreate(false);
  };

  const saveEdit = () => {
    if (!editingSession || !form.room.trim()) return;

    const courseNames: Record<string, string> = {
      "SE-401": "Software Architecture",
      "SE-406": "Web Engineering",
      "SE-407": "Software Testing",
      "AI-402": "Artificial Intelligence",
      "CS-405": "Cyber Security",
      "DS-408": "Distributed Systems",
    };

    setSessions((current) =>
      current.map((session) =>
        session.id === editingSession.id
          ? {
              ...session,
              courseCode: form.courseCode,
              courseName: courseNames[form.courseCode],
              day: form.day,
              start: form.start,
              end: form.end,
              room: form.room,
              students: Number(form.students) || 0,
              type: form.type as ClassSession["type"],
              color: getCourseColor(form.courseCode),
            }
          : session,
      ),
    );

    setEditingSession(null);
    resetForm();
  };

  const deleteSession = (id: string) => {
    setSessions((current) => current.filter((session) => session.id !== id));

    setSelectedSession(null);
  };

  const openEdit = (session: ClassSession) => {
    setEditingSession(session);

    setForm({
      courseCode: session.courseCode,
      day: session.day,
      start: session.start,
      end: session.end,
      room: session.room,
      students: String(session.students),
      type: session.type,
    });
  };

  return (
    <div className="mx-auto max-w-375">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
            <CalendarDays size={13} />
            Faculty Schedule Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Timetable
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Manage your weekly teaching schedule, classrooms, sessions and
            academic workload.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:flex">
            <CalendarRange size={16} />
            Academic Calendar
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
          >
            <Plus size={17} />
            Add Session
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Weekly Classes"
          value={String(totalClasses)}
          description="Scheduled teaching sessions"
          icon={CalendarDays}
        />

        <Stat
          label="Students Taught"
          value={String(totalStudents)}
          description="Total weekly class capacity"
          icon={Users}
        />

        <Stat
          label="Classrooms"
          value={String(uniqueRooms)}
          description="Rooms currently assigned"
          icon={MapPin}
        />

        <Stat
          label="Lab Sessions"
          value={String(labs)}
          description="Practical teaching sessions"
          icon={BookOpen}
        />
      </div>

      {/* Filters */}
      <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)] md:flex-row">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-indigo-400"
        >
          <option>All Courses</option>
          {courseOptions.map((course) => (
            <option key={course}>{course}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-indigo-400"
        >
          <option>All Types</option>
          <option>Lecture</option>
          <option>Lab</option>
          <option>Tutorial</option>
        </select>

        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <Clock3 size={14} />
          Fall 2026 · Week 05
        </div>
      </div>

      {/* Week Navigator */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4">
        <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">
            September 21 — September 25, 2026
          </p>
          <p className="mt-1 text-[11px] text-gray-400">
            Current Academic Week
          </p>
        </div>

        <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Desktop Timetable */}
      <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)] lg:block">
        <div className="min-w-262.5">
          {/* Day Header */}
          <div className="grid grid-cols-[90px_repeat(5,1fr)] border-b border-gray-200">
            <div className="border-r border-gray-100 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Time
              </span>
            </div>

            {days.map((day) => (
              <div
                key={day}
                className="border-r border-gray-100 p-4 text-center last:border-r-0"
              >
                <p className="text-xs font-bold text-gray-900">{day}</p>
                <p className="mt-1 text-[10px] text-gray-400">
                  {getDateForDay(day)}
                </p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid grid-cols-[90px_repeat(5,1fr)] border-b border-gray-100 last:border-b-0"
            >
              <div className="border-r border-gray-100 px-4 py-5 text-[11px] font-medium text-gray-400">
                {formatTime(time)}
              </div>

              {days.map((day) => {
                const session = getSession(day, time);

                return (
                  <div
                    key={`${day}-${time}`}
                    className="min-h-25 border-r border-gray-100 p-2 last:border-r-0"
                  >
                    {session && (
                      <button
                        onClick={() => setSelectedSession(session)}
                        className={[
                          "h-full min-h-21 w-full rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                          getCourseStyles(session.color),
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold">
                            {session.courseCode}
                          </span>

                          <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold">
                            {session.type}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs font-semibold">
                          {session.courseName}
                        </p>

                        <div className="mt-3 space-y-1 text-[10px] opacity-70">
                          <div className="flex items-center gap-1.5">
                            <Clock3 size={10} />
                            {formatTime(session.start)} —{" "}
                            {formatTime(session.end)}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <MapPin size={10} />
                            {session.room}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Schedule */}
      <div className="mt-5 space-y-3 lg:hidden">
        {days.map((day) => {
          const daySessions = filteredSessions.filter(
            (session) => session.day === day,
          );

          return (
            <div
              key={day}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{day}</h3>
                  <p className="text-[10px] text-gray-400">
                    {getDateForDay(day)}
                  </p>
                </div>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
                  {daySessions.length} classes
                </span>
              </div>

              {daySessions.length === 0 ? (
                <div className="rounded-xl bg-gray-50 p-5 text-center text-xs text-gray-400">
                  No classes scheduled
                </div>
              ) : (
                <div className="space-y-2">
                  {daySessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={[
                        "w-full rounded-xl border p-4 text-left",
                        getCourseStyles(session.color),
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold">
                            {session.courseCode}
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {session.courseName}
                          </p>
                        </div>

                        <span className="rounded-full bg-white/70 px-2 py-1 text-[9px] font-semibold">
                          {session.type}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-[10px] opacity-70">
                        <span className="flex items-center gap-1">
                          <Clock3 size={11} />
                          {formatTime(session.start)} —{" "}
                          {formatTime(session.end)}
                        </span>

                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {session.room}
                        </span>

                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {session.students}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Panels */}
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserCheck size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Teaching Load
              </h3>
              <p className="text-[11px] text-gray-400">
                Weekly workload overview
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-950">8</span>
              <span className="text-[11px] text-gray-400">hours / week</span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: "64%" }}
              />
            </div>

            <p className="mt-3 text-[11px] text-gray-400">
              64% of recommended weekly teaching capacity.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <MapPin size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Classroom Usage
              </h3>
              <p className="text-[11px] text-gray-400">
                Your assigned teaching rooms
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <RoomRow room="Lab 3" classes={2} />
            <RoomRow room="Lab 2" classes={2} />
            <RoomRow room="Cyber Lab" classes={1} />
            <RoomRow room="A-301" classes={1} />
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
              <CalendarDays size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-indigo-950">
                Schedule Management
              </h3>
              <p className="text-[11px] text-indigo-900/50">
                Backend-ready timetable workflow
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-indigo-900/65">
            Faculty sessions will later be loaded from the university timetable
            API. Room conflicts, faculty conflicts and student schedule
            conflicts can also be validated by the backend.
          </p>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <Modal title="Class Session" onClose={() => setSelectedSession(null)}>
          <div className="space-y-5">
            <div className="rounded-2xl bg-gray-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
                    {selectedSession.courseCode}
                  </span>

                  <h2 className="mt-3 text-xl font-bold text-gray-950">
                    {selectedSession.courseName}
                  </h2>
                </div>

                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-600 shadow-sm">
                  {selectedSession.type}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                icon={CalendarDays}
                label="Day"
                value={selectedSession.day}
              />

              <Info
                icon={Clock3}
                label="Time"
                value={`${formatTime(
                  selectedSession.start,
                )} — ${formatTime(selectedSession.end)}`}
              />

              <Info
                icon={MapPin}
                label="Classroom"
                value={selectedSession.room}
              />

              <Info
                icon={Users}
                label="Students"
                value={`${selectedSession.students} enrolled`}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => {
                  openEdit(selectedSession);
                  setSelectedSession(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={15} />
                Edit Session
              </button>

              <button
                onClick={() => deleteSession(selectedSession.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-100 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {(showCreate || editingSession) && (
        <Modal
          title={editingSession ? "Edit Class Session" : "Add Class Session"}
          onClose={() => {
            setShowCreate(false);
            setEditingSession(null);
            resetForm();
          }}
        >
          <SessionForm
            form={form}
            setForm={setForm}
            editing={Boolean(editingSession)}
            onCancel={() => {
              setShowCreate(false);
              setEditingSession(null);
              resetForm();
            }}
            onSubmit={editingSession ? saveEdit : createSession}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Components ---------------- */

function Stat({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
            {value}
          </p>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-4 text-[11px] text-gray-400">{description}</p>
    </div>
  );
}

function RoomRow({ room, classes }: { room: string; classes: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-700">{room}</span>
      </div>

      <span className="text-[10px] font-semibold text-gray-400">
        {classes} classes
      </span>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        <Icon size={12} />
        {label}
      </div>

      <p className="mt-2 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-base font-bold text-gray-950">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function SessionForm({
  form,
  setForm,
  editing,
  onCancel,
  onSubmit,
}: {
  form: {
    courseCode: string;
    day: string;
    start: string;
    end: string;
    room: string;
    students: string;
    type: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  editing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Course">
          <select
            value={form.courseCode}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                courseCode: e.target.value,
              }))
            }
            className="form-select"
          >
            {courseOptions.map((course) => (
              <option key={course}>{course}</option>
            ))}
          </select>
        </Field>

        <Field label="Session Type">
          <select
            value={form.type}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                type: e.target.value,
              }))
            }
            className="form-select"
          >
            <option>Lecture</option>
            <option>Lab</option>
            <option>Tutorial</option>
          </select>
        </Field>

        <Field label="Day">
          <select
            value={form.day}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                day: e.target.value,
              }))
            }
            className="form-select"
          >
            {days.map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>
        </Field>

        <Field label="Classroom">
          <input
            value={form.room}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                room: e.target.value,
              }))
            }
            placeholder="e.g. Lab 3"
            className="form-input"
          />
        </Field>

        <Field label="Start Time">
          <input
            type="time"
            value={form.start}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                start: e.target.value,
              }))
            }
            className="form-input"
          />
        </Field>

        <Field label="End Time">
          <input
            type="time"
            value={form.end}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                end: e.target.value,
              }))
            }
            className="form-input"
          />
        </Field>
      </div>

      <Field label="Expected Students">
        <input
          type="number"
          min="0"
          value={form.students}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              students: e.target.value,
            }))
          }
          className="form-input"
        />
      </Field>

      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
        In the backend, the timetable service will validate room availability,
        faculty conflicts and overlapping sessions before saving.
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onClick={onSubmit}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {editing ? "Save Changes" : "Add Session"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      {children}
    </div>
  );
}

function getCourseStyles(color: string) {
  const styles: Record<string, string> = {
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-900",
    violet: "border-violet-100 bg-violet-50 text-violet-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900",
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    rose: "border-rose-100 bg-rose-50 text-rose-900",
    cyan: "border-cyan-100 bg-cyan-50 text-cyan-900",
  };

  return styles[color] || styles.indigo;
}

function getCourseColor(courseCode: string) {
  const colors: Record<string, string> = {
    "SE-401": "indigo",
    "SE-406": "violet",
    "SE-407": "amber",
    "AI-402": "emerald",
    "CS-405": "rose",
    "DS-408": "cyan",
  };

  return colors[courseCode] || "indigo";
}

function formatTime(time: string) {
  const [hourString, minute] = time.split(":");
  let hour = Number(hourString);

  const suffix = hour >= 12 ? "PM" : "AM";

  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;

  return `${hour}:${minute} ${suffix}`;
}

function getDateForDay(day: string) {
  const dates: Record<string, string> = {
    Monday: "21 Sep",
    Tuesday: "22 Sep",
    Wednesday: "23 Sep",
    Thursday: "24 Sep",
    Friday: "25 Sep",
  };

  return dates[day];
}
