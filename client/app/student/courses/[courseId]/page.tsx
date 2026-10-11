"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  MessageSquare,
  UserRound,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  api,
  ApiError,
  type CourseDTO,
  type StudentAttendanceSummaryDTO,
  type TimetableEntryDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type Data = {
  course: CourseDTO | null;
  attendance: StudentAttendanceSummaryDTO | null;
  grade: string | null;
  marks: number | null;
  timetable: TimetableEntryDTO[];
};

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();

  const { data, loading, error } = useApiResource<Data>(async () => {
    let course: CourseDTO | null = null;
    try {
      course = await api.courses.get(courseId);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return {
          course: null,
          attendance: null,
          grade: null,
          marks: null,
          timetable: [],
        };
      }
      throw e;
    }

    const [timetable, me] = await Promise.all([
      api.timetable.me(),
      api.students.me(),
    ]);

    const [attendance, results] = await Promise.all([
      api.attendance.byStudent(me.id, courseId),
      api.results.byStudent(me.id),
    ]);

    const result = results.results.find((r) => r.courseId === courseId) ?? null;

    return {
      course,
      attendance: attendance[0] ?? null,
      grade: result?.grade ?? null,
      marks: result?.marks ?? null,
      timetable,
    };
  });

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-375">
          <Card className="flex items-center gap-2 p-8 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading course…
          </Card>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl py-20 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>

          <p className="mt-3 text-sm text-red-600">{error}</p>

          <Link
            href="/student/courses"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
          >
            <ArrowLeft size={15} />
            Back to courses
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!data?.course) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl py-20 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>

          <Link
            href="/student/courses"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
          >
            <ArrowLeft size={15} />
            Back to courses
          </Link>
        </div>
      </AppShell>
    );
  }

  const course = data.course;
  const attendance = data.attendance;
  const slot =
    data.timetable.find((entry) => entry.courseId === courseId) ?? null;
  const courseSlots = data.timetable.filter(
    (entry) => entry.courseId === courseId
  );
  const instructor = course.teacher?.name ?? "Unassigned";
  const scheduleText = slot
    ? `${slot.day} · ${slot.startTime}–${slot.endTime}`
    : "No scheduled slot";

  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        <Link
          href="/student/courses"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to courses
        </Link>

        {/* Hero */}
        <section className="mb-5 overflow-hidden rounded-3xl bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-900/10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
                {course.code}
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {course.title}
              </h1>

              <p className="mt-3 text-sm text-indigo-100">{instructor}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Tag
                  icon={<BookOpen size={13} />}
                  text={`${course.creditHours} Credits`}
                />
                <Tag icon={<UserRound size={13} />} text={instructor} />
                <Tag icon={<CalendarDays size={13} />} text={scheduleText} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md lg:min-w-55">
              <p className="text-xs text-indigo-200">Current Grade</p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-4xl font-bold">{data.grade ?? "—"}</span>

                <span className="text-xs font-semibold text-emerald-300">
                  {data.marks !== null ? `${data.marks}/100` : "—"}
                </span>
              </div>

              <p className="mt-4 text-xs text-indigo-200">
                {attendance
                  ? `${attendance.percentage}% attendance`
                  : "No attendance recorded"}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<ClipboardCheck size={18} />}
            label="Attendance"
            value={attendance ? `${attendance.percentage}%` : "—"}
            description={
              attendance
                ? attendance.belowThreshold
                  ? "Below requirement"
                  : "Above requirement"
                : "No attendance yet"
            }
          />

          <Metric
            icon={<CheckCircle2 size={18} />}
            label="Classes Present"
            value={attendance ? `${attendance.present} / ${attendance.total}` : "—"}
            description="Recorded sessions"
          />

          <Metric
            icon={<BookOpen size={18} />}
            label="Credits"
            value={String(course.creditHours)}
            description="Credit hours"
          />

          <Metric
            icon={<Clock3 size={18} />}
            label="Next Class"
            value={slot ? slot.startTime : "—"}
            description={slot ? `${slot.day} · ${slot.room}` : "No scheduled slot"}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-950">Course progress</h2>
                <p className="mt-1 text-xs text-gray-400">
                  Your attendance record this semester
                </p>
              </div>

              <GraduationCap size={20} className="text-indigo-500" />
            </div>

            <div className="space-y-6">
              <ProgressItem
                title="Attendance"
                value={attendance?.percentage ?? 0}
              />

              <p className="text-xs text-gray-400">
                {attendance
                  ? `${attendance.present} of ${attendance.total} classes attended.`
                  : "No attendance has been recorded for this course yet."}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5">
              <h2 className="font-bold text-gray-950">Scheduled sessions</h2>
              <p className="mt-1 text-xs text-gray-400">
                Your weekly classes for this course
              </p>
            </div>

            <div className="space-y-2">
              {courseSlots.map((item) => (
                <Activity
                  key={item.id}
                  title={item.course?.title ?? course.title}
                  date={`${item.day} · ${item.startTime}–${item.endTime} · ${item.room}`}
                  icon={<CalendarDays size={16} />}
                />
              ))}

              {courseSlots.length === 0 && (
                <p className="text-xs text-gray-400">
                  No scheduled sessions for this course.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-bold text-gray-950">Course information</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Detail label="Instructor" value={instructor} />
              <Detail label="Credits" value={`${course.creditHours} credits`} />
              <Detail label="Classroom" value={slot?.room ?? "—"} />
              <Detail label="Schedule" value={scheduleText} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-bold text-gray-950">Quick actions</h2>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Action title="View assignments" icon={<FileText size={17} />} />
              <Action
                title="View attendance"
                icon={<ClipboardCheck size={17} />}
              />
              <Action title="Course resources" icon={<BookOpen size={17} />} />
              <Action
                title="Message instructor"
                icon={<MessageSquare size={17} />}
              />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Tag({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-indigo-100">
      {icon}
      {text}
    </span>
  );
}

function Metric({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
          <p className="mt-1 text-[11px] text-gray-400">{description}</p>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function ProgressItem({ title, value }: { title: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-4">
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        <span className="text-xs font-bold text-gray-500">{value}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Activity({
  title,
  date,
  icon,
}: {
  title: string;
  date: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3.5">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-800">{title}</p>
        <p className="mt-1 text-[11px] text-gray-400">{date}</p>
      </div>

      <ArrowUpRight size={15} className="text-gray-400" />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function Action({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <button className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 text-left text-xs font-semibold text-gray-700 transition hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600">
      {icon}
      {title}
    </button>
  );
}
