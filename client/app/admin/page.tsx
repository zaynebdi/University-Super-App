"use client";

import {
  Users,
  GraduationCap,
  BookOpen,
  Megaphone,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { api } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type DashboardData = {
  users: Awaited<ReturnType<typeof api.users.list>>;
  teachers: Awaited<ReturnType<typeof api.teachers.list>>;
  courses: Awaited<ReturnType<typeof api.courses.list>>;
  announcements: Awaited<ReturnType<typeof api.announcements.list>>;
};

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </span>
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold text-gray-950">{value}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, loading, error } = useApiResource<DashboardData>(async () => {
    const [users, teachers, courses, announcements] = await Promise.all([
      api.users.list({ pageSize: 50 }),
      api.teachers.list(),
      api.courses.list(),
      api.announcements.list(),
    ]);
    return { users, teachers, courses, announcements };
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        <AlertCircle size={16} /> {error ?? "Failed to load dashboard"}
      </div>
    );
  }

  const students = data.users.users.filter((u) => u.role === "student").length;

  return (
    <div className="mx-auto max-w-375">
      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage users, courses, enrollments, timetable and announcements.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Students"
          value={students}
          icon={<Users size={17} className="text-indigo-600" />}
          color="bg-indigo-50"
        />
        <StatCard
          label="Teachers"
          value={data.teachers.length}
          icon={<GraduationCap size={17} className="text-violet-600" />}
          color="bg-violet-50"
        />
        <StatCard
          label="Courses"
          value={data.courses.length}
          icon={<BookOpen size={17} className="text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard
          label="Announcements"
          value={data.announcements.length}
          icon={<Megaphone size={17} className="text-amber-600" />}
          color="bg-amber-50"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-bold text-gray-950">Recent announcements</h3>
          <div className="mt-4 space-y-3">
            {data.announcements.slice(0, 5).map((a) => (
              <div key={a.id} className="rounded-xl bg-gray-50 p-3.5">
                <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                <p className="mt-1 text-[11px] text-gray-400">
                  {a.author?.name ?? "Unknown"} ·{" "}
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            {data.announcements.length === 0 && (
              <p className="text-sm text-gray-400">No announcements yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-bold text-gray-950">Courses</h3>
          <div className="mt-4 space-y-3">
            {data.courses.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {c.code} · {c.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {c.teacher?.name ?? "No teacher assigned"}
                  </p>
                </div>
                <span className="text-[11px] text-gray-400">
                  Sem {c.semester}
                </span>
              </div>
            ))}
            {data.courses.length === 0 && (
              <p className="text-sm text-gray-400">No courses yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
