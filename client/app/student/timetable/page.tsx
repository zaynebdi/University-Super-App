"use client";

import { useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
} from "lucide-react";

import { api, type TimetableEntryDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timeSlots = [
  "08:00 - 09:00",
  "09:00 - 10:30",
  "10:30 - 11:00",
  "11:00 - 12:30",
  "12:30 - 01:00",
  "01:00 - 02:30",
  "02:30 - 03:30",
  "03:30 - 04:30",
];

const breakSlots = ["10:30 - 11:00", "12:30 - 01:00"];

type ClassItem = {
  id: string;
  code: string;
  name: string;
  room: string;
  startTime: string;
  endTime: string;
};

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function slotStartMinutes(slot: string) {
  const [start] = slot.split(" - ");
  const [rawHours, minutes] = start.split(":").map(Number);
  const hours = rawHours < 7 ? rawHours + 12 : rawHours;
  return hours * 60 + (minutes || 0);
}

function slotForTime(startTime: string) {
  const target = toMinutes(startTime);
  let best = timeSlots[0];
  let bestStart = -Infinity;
  for (const slot of timeSlots) {
    const start = slotStartMinutes(slot);
    if (start <= target && start > bestStart) {
      bestStart = start;
      best = slot;
    }
  }
  return best;
}

function formatTime(value: string) {
  const [rawHours, minutes] = value.split(":").map(Number);
  const suffix = rawHours >= 12 ? "PM" : "AM";
  const hours = rawHours % 12 === 0 ? 12 : rawHours % 12;
  return `${String(hours).padStart(2, "0")}:${String(minutes || 0).padStart(
    2,
    "0"
  )} ${suffix}`;
}

function ClassBlock({ item }: { item: ClassItem }) {
  return (
    <div className="h-full min-h-31.25 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-left">
      <div className="mb-2 inline-flex rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white">
        {item.code}
      </div>

      <h3 className="text-sm font-bold leading-tight text-gray-900">
        {item.name}
      </h3>

      <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
        <Clock3 size={11} />
        {item.startTime}–{item.endTime}
      </div>

      <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-gray-400">
        <MapPin size={11} />
        {item.room || "—"}
      </div>
    </div>
  );
}

export default function TimetablePage() {
  const { data, loading, error } = useApiResource<TimetableEntryDTO[]>(() =>
    api.timetable.me()
  );

  const entries = data ?? [];

  const classesByDay = useMemo(() => {
    const list = data ?? [];
    const grouped: Record<string, Record<string, ClassItem[]>> = {};
    for (const day of days) {
      grouped[day] = {};
    }
    for (const entry of list) {
      const row = grouped[entry.day];
      if (!row) continue;
      const slot = slotForTime(entry.startTime);
      (row[slot] ??= []).push({
        id: entry.id,
        code: entry.course?.code ?? "—",
        name: entry.course?.title ?? "—",
        room: entry.room,
        startTime: entry.startTime,
        endTime: entry.endTime,
      });
    }
    return grouped;
  }, [data]);

  const totalClasses = entries.length;
  const weeklyMinutes = entries.reduce((sum, entry) => {
    const duration = toMinutes(entry.endTime) - toMinutes(entry.startTime);
    return sum + (duration > 0 ? duration : 0);
  }, 0);
  const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;
  const activeCourses = new Set(
    entries.map((entry) => entry.courseId ?? entry.course?.code ?? entry.id)
  ).size;
  const nextStart = entries.length
    ? entries.reduce(
        (min, entry) =>
          toMinutes(entry.startTime) < toMinutes(min) ? entry.startTime : min,
        entries[0].startTime
      )
    : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              <CalendarDays size={15} />
              Academic Schedule
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Class Timetable
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Your weekly academic schedule.
            </p>
          </div>

          {/* Week selector */}
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-50">
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
              <CalendarDays size={16} className="text-indigo-600" />

              <span className="text-sm font-semibold text-gray-800">
                22 Sep — 26 Sep 2026
              </span>
            </div>

            <button className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs text-gray-500">Classes This Week</p>

            <p className="mt-2 text-2xl font-bold text-gray-950">
              {totalClasses}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-gray-500">Weekly Hours</p>

            <p className="mt-2 text-2xl font-bold text-gray-950">
              {Number.isInteger(weeklyHours)
                ? `${weeklyHours}h`
                : `${weeklyHours.toFixed(1)}h`}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-gray-500">Active Courses</p>

            <p className="mt-2 text-2xl font-bold text-gray-950">
              {activeCourses}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-gray-500">Next Class</p>

            <p className="mt-2 text-2xl font-bold text-indigo-600">
              {nextStart ? formatTime(nextStart) : "—"}
            </p>
          </Card>
        </div>

        {/* Timetable */}
        {loading ? (
          <Card className="flex items-center gap-2 p-8 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading timetable…
          </Card>
        ) : error ? (
          <Card className="flex items-center gap-2 p-6 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </Card>
        ) : entries.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-gray-400">
              <CalendarDays size={20} />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-800">
              No classes scheduled
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {/* Table header */}
            <div className="overflow-x-auto">
              <div className="min-w-262.5">
                <div className="grid grid-cols-[150px_repeat(5,minmax(180px,1fr))] border-b border-gray-200 bg-gray-50">
                  {/* Time column */}
                  <div className="flex items-center gap-2 border-r border-gray-200 px-4 py-5">
                    <Clock3 size={16} className="text-gray-400" />

                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Time
                    </span>
                  </div>

                  {/* Days */}
                  {days.map((day) => (
                    <div
                      key={day}
                      className="border-r border-gray-200 px-4 py-5 text-center last:border-r-0"
                    >
                      <p className="text-sm font-bold text-gray-900">{day}</p>

                      <p className="mt-1 text-[11px] text-gray-400">
                        {day === "Monday" && "22 Sep"}
                        {day === "Tuesday" && "23 Sep"}
                        {day === "Wednesday" && "24 Sep"}
                        {day === "Thursday" && "25 Sep"}
                        {day === "Friday" && "26 Sep"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="grid grid-cols-[150px_repeat(5,minmax(180px,1fr))] border-b border-gray-100 last:border-b-0"
                  >
                    {/* Time */}
                    <div className="flex min-h-36.25 items-start justify-center border-r border-gray-200 bg-gray-50/50 px-3 py-5">
                      <span className="text-xs font-semibold text-gray-500">
                        {time}
                      </span>
                    </div>

                    {/* Day cells */}
                    {days.map((day) => {
                      const items = classesByDay[day][time] ?? [];

                      return (
                        <div
                          key={`${day}-${time}`}
                          className="min-h-36.25 border-r border-gray-100 p-2.5 last:border-r-0"
                        >
                          {items.length > 0 ? (
                            <div className="space-y-2">
                              {items.map((item) => (
                                <ClassBlock key={item.id} item={item} />
                              ))}
                            </div>
                          ) : breakSlots.includes(time) ? (
                            <div className="flex h-full min-h-31.25 items-center justify-center rounded-xl bg-gray-50">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-300">
                                Break
                              </span>
                            </div>
                          ) : (
                            <div className="h-full min-h-31.25 rounded-xl border border-dashed border-gray-100" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center gap-5 px-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            Scheduled Class
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
            Break
          </div>

          <div className="ml-auto">Fall 2026 · Software Engineering</div>
        </div>
      </div>
    </AppShell>
  );
}
