"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  BookOpen,
  UserCheck,
  CalendarRange,
  X,
  Loader2,
} from "lucide-react";

import {
  api,
  ApiError,
  type CourseDTO,
  type TimetableEntryDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import { DaysOfWeek } from "@/lib/constants";

type ClassSession = {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  day: string;
  start: string;
  end: string;
  room: string;
  color: string;
};

const days = DaysOfWeek.filter((day) => day !== "Saturday");

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

type TimetableData = {
  entries: TimetableEntryDTO[];
  courses: CourseDTO[];
};

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function slotMinutes(slot: string) {
  const [rawHours, minutes] = slot.split(":").map(Number);
  const hours = rawHours < 7 ? rawHours + 12 : rawHours;
  return hours * 60 + (minutes || 0);
}

function slotForTime(start: string) {
  const target = toMinutes(start);
  let best = timeSlots[0];
  let bestStart = -Infinity;
  for (const slot of timeSlots) {
    const value = slotMinutes(slot);
    if (value <= target && value > bestStart) {
      bestStart = value;
      best = slot;
    }
  }
  return best;
}

export default function FacultyTimetablePage() {
  const { data, loading, error, reload } = useApiResource<TimetableData>(
    async () => {
      const me = await api.teachers.me();
      const [entries, courses] = await Promise.all([
        api.timetable.me(),
        api.courses.list({ teacherId: me.id }),
      ]);
      return { entries, courses };
    },
  );

  const courses = data?.courses ?? [];

  const sessions = useMemo<ClassSession[]>(() => {
    const list = data?.entries ?? [];
    return list.map((entry) => ({
      id: entry.id,
      courseId: entry.courseId ?? "",
      courseCode: entry.course?.code ?? "—",
      courseName: entry.course?.title ?? "—",
      day: entry.day,
      start: entry.startTime,
      end: entry.endTime,
      room: entry.room,
      color: getCourseColor(entry.course?.code ?? entry.id),
    }));
  }, [data]);

  const courseCodes = useMemo(() => {
    const list = data?.courses ?? [];
    return Array.from(new Set(list.map((course) => course.code)));
  }, [data]);

  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(
    null,
  );

  const [showCreate, setShowCreate] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState({
    courseId: "",
    day: "Monday",
    start: "09:00",
    end: "10:00",
    room: "",
  });

  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (session) =>
        selectedCourse === "All Courses" ||
        session.courseCode === selectedCourse,
    );
  }, [sessions, selectedCourse]);

  const grouped = useMemo(() => {
    const map: Record<string, Record<string, ClassSession>> = {};
    for (const day of days) map[day] = {};
    for (const session of filteredSessions) {
      const row = map[session.day];
      if (!row) continue;
      row[slotForTime(session.start)] = session;
    }
    return map;
  }, [filteredSessions]);

  const totalClasses = sessions.length;
  const weeklyMinutes = sessions.reduce((sum, session) => {
    const duration = toMinutes(session.end) - toMinutes(session.start);
    return sum + (duration > 0 ? duration : 0);
  }, 0);
  const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;
  const weeklyHoursLabel = Number.isInteger(weeklyHours)
    ? `${weeklyHours}h`
    : `${weeklyHours.toFixed(1)}h`;
  const uniqueRooms = new Set(sessions.map((s) => s.room)).size;
  const activeCourses = new Set(sessions.map((s) => s.courseCode)).size;

  const roomUsage = useMemo(() => {
    const map = new Map<string, number>();
    for (const session of sessions) {
      if (!session.room) continue;
      map.set(session.room, (map.get(session.room) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [sessions]);

  const getSession = (day: string, time: string) => grouped[day]?.[time];

  const resetForm = () => {
    setForm({
      courseId: "",
      day: "Monday",
      start: "09:00",
      end: "10:00",
      room: "",
    });
  };

  const createSession = async () => {
    if (!form.courseId || !form.room.trim()) return;

    setNotice(null);
    try {
      await api.timetable.create({
        courseId: form.courseId,
        day: form.day,
        startTime: form.start,
        endTime: form.end,
        room: form.room,
      });
      resetForm();
      setShowCreate(false);
      await reload();
    } catch (e) {
      setNotice(
        e instanceof ApiError ? e.message : "Failed to create session",
      );
    }
  };

  const saveEdit = async () => {
    if (!editingSession || !form.courseId || !form.room.trim()) return;

    setNotice(null);
    try {
      await api.timetable.update(editingSession.id, {
        courseId: form.courseId,
        day: form.day,
        startTime: form.start,
        endTime: form.end,
        room: form.room,
      });
      setEditingSession(null);
      resetForm();
      await reload();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to update session");
    }
  };

  const deleteSession = async (id: string) => {
    setNotice(null);
    try {
      await api.timetable.remove(id);
      setSelectedSession(null);
      await reload();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to delete session");
    }
  };

  const openEdit = (session: ClassSession) => {
    setEditingSession(session);

    setForm({
      courseId: session.courseId,
      day: session.day,
      start: session.start,
      end: session.end,
      room: session.room,
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

      {notice && (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {notice}
        </div>
      )}

      {/* Stats */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Weekly Classes"
          value={String(totalClasses)}
          description="Scheduled teaching sessions"
          icon={CalendarDays}
        />

        <Stat
          label="Weekly Hours"
          value={weeklyHoursLabel}
          description="Total weekly teaching time"
          icon={Clock3}
        />

        <Stat
          label="Classrooms"
          value={String(uniqueRooms)}
          description="Rooms currently assigned"
          icon={MapPin}
        />

        <Stat
          label="Active Courses"
          value={String(activeCourses)}
          description="Distinct courses scheduled"
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
          {courseCodes.map((course) => (
            <option key={course}>{course}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <Clock3 size={14} />
          Current Academic Week
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

      {loading ? (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          Loading timetable…
        </div>
      ) : error ? (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : sessions.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-gray-400">
            <CalendarDays size={20} />
          </div>
          <p className="mt-4 text-sm font-semibold text-gray-800">
            No classes scheduled
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Add a session to begin building your timetable.
          </p>
        </div>
      ) : (
        <>
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
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

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
              <span className="text-2xl font-bold text-gray-950">
                {weeklyHours}
              </span>
              <span className="text-[11px] text-gray-400">hours / week</span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: "0%" }}
              />
            </div>

            <p className="mt-3 text-[11px] text-gray-400">
              Teaching capacity is not tracked by the backend.
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
            {roomUsage.length === 0 ? (
              <p className="text-[11px] text-gray-400">
                No classrooms assigned yet.
              </p>
            ) : (
              roomUsage.map(([room, count]) => (
                <RoomRow key={room} room={room} classes={count} />
              ))
            )}
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
            Sessions are loaded from the university timetable API. Room
            conflicts and faculty conflicts are validated by the backend.
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
                value={selectedSession.room || "—"}
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
            courses={courses}
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
  courses,
  editing,
  onCancel,
  onSubmit,
}: {
  form: {
    courseId: string;
    day: string;
    start: string;
    end: string;
    room: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  courses: CourseDTO[];
  editing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Course">
          <select
            value={form.courseId}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                courseId: e.target.value,
              }))
            }
            className="form-select"
          >
            <option value="">Select course…</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} · {course.title}
              </option>
            ))}
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

      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
        The timetable service validates room availability, faculty conflicts and
        overlapping sessions before saving.
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
  const colors = ["indigo", "violet", "emerald", "amber", "rose", "cyan"];
  let hash = 0;

  for (let i = 0; i < courseCode.length; i += 1) {
    hash = (hash * 31 + courseCode.charCodeAt(i)) % colors.length;
  }

  return colors[hash] || "indigo";
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

  return dates[day] ?? "";
}
