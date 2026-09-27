"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
} from "lucide-react";

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

type ClassItem = {
  code: string;
  name: string;
  instructor: string;
  room: string;
};

const schedule: Record<string, Record<string, ClassItem | "break" | null>> = {
  Monday: {
    "08:00 - 09:00": null,

    "09:00 - 10:30": {
      code: "SE-401",
      name: "Software Architecture",
      instructor: "Dr. Ahmed Khan",
      room: "Lab 3",
    },

    "10:30 - 11:00": "break",

    "11:00 - 12:30": {
      code: "AI-402",
      name: "Artificial Intelligence",
      instructor: "Dr. Sara Malik",
      room: "A-204",
    },

    "12:30 - 01:00": "break",

    "01:00 - 02:30": null,
    "02:30 - 03:30": null,
    "03:30 - 04:30": null,
  },

  Tuesday: {
    "08:00 - 09:00": null,
    "09:00 - 10:30": {
      code: "CS-405",
      name: "Cyber Security",
      instructor: "Prof. Hassan Raza",
      room: "Cyber Lab",
    },

    "10:30 - 11:00": "break",

    "11:00 - 12:30": null,

    "12:30 - 01:00": "break",

    "01:00 - 02:30": {
      code: "SE-406",
      name: "Web Engineering",
      instructor: "Dr. Ali Hassan",
      room: "Lab 2",
    },

    "02:30 - 03:30": null,
    "03:30 - 04:30": null,
  },

  Wednesday: {
    "08:00 - 09:00": null,
    "09:00 - 10:30": null,

    "10:30 - 11:00": "break",

    "11:00 - 12:30": {
      code: "SE-407",
      name: "Software Testing",
      instructor: "Dr. Usman Tariq",
      room: "B-112",
    },

    "12:30 - 01:00": "break",

    "01:00 - 02:30": null,

    "02:30 - 03:30": {
      code: "DS-408",
      name: "Distributed Systems",
      instructor: "Dr. Hamza Ahmed",
      room: "A-301",
    },

    "03:30 - 04:30": null,
  },

  Thursday: {
    "08:00 - 09:00": null,

    "09:00 - 10:30": {
      code: "SE-401",
      name: "Software Architecture",
      instructor: "Dr. Ahmed Khan",
      room: "Lab 3",
    },

    "10:30 - 11:00": "break",

    "11:00 - 12:30": null,

    "12:30 - 01:00": "break",

    "01:00 - 02:30": {
      code: "AI-402",
      name: "Artificial Intelligence",
      instructor: "Dr. Sara Malik",
      room: "A-204",
    },

    "02:30 - 03:30": null,
    "03:30 - 04:30": null,
  },

  Friday: {
    "08:00 - 09:00": null,
    "09:00 - 10:30": null,

    "10:30 - 11:00": "break",

    "11:00 - 12:30": {
      code: "CS-405",
      name: "Cyber Security",
      instructor: "Prof. Hassan Raza",
      room: "Cyber Lab",
    },

    "12:30 - 01:00": "break",

    "01:00 - 02:30": null,

    "02:30 - 03:30": {
      code: "DS-408",
      name: "Distributed Systems",
      instructor: "Dr. Hamza Ahmed",
      room: "A-301",
    },

    "03:30 - 04:30": null,
  },
};

function ClassBlock({ item }: { item: ClassItem }) {
  return (
    <div className="h-full min-h-31.25 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-left">
      <div className="mb-2 inline-flex rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white">
        {item.code}
      </div>

      <h3 className="text-sm font-bold leading-tight text-gray-900">
        {item.name}
      </h3>

      <p className="mt-2 text-[11px] text-gray-500">{item.instructor}</p>

      <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-gray-400">
        <MapPin size={11} />
        {item.room}
      </div>
    </div>
  );
}

export default function TimetablePage() {
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

            <p className="mt-2 text-2xl font-bold text-gray-950">10</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-gray-500">Weekly Hours</p>

            <p className="mt-2 text-2xl font-bold text-gray-950">15h</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-gray-500">Active Courses</p>

            <p className="mt-2 text-2xl font-bold text-gray-950">6</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-gray-500">Next Class</p>

            <p className="mt-2 text-2xl font-bold text-indigo-600">09:00 AM</p>
          </Card>
        </div>

        {/* Timetable */}
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
                    const item = schedule[day][time];

                    return (
                      <div
                        key={`${day}-${time}`}
                        className="min-h-36.25 border-r border-gray-100 p-2.5 last:border-r-0"
                      >
                        {item === "break" ? (
                          <div className="flex h-full min-h-31.25 items-center justify-center rounded-xl bg-gray-50">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-300">
                              Break
                            </span>
                          </div>
                        ) : item ? (
                          <ClassBlock item={item} />
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
