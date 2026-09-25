"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Users,
  ChevronRight,
  Star,
  CheckCircle2,
} from "lucide-react";

type Event = {
  id: number;
  title: string;
  description: string;
  category: "Academic" | "Technology" | "Career" | "Social";
  date: string;
  day: string;
  time: string;
  location: string;
  attendees: number;
  capacity: number;
  featured?: boolean;
  registered?: boolean;
};

const events: Event[] = [
  {
    id: 1,
    title: "Annual University Tech Conference",
    description:
      "A full-day technology conference featuring industry experts, technical workshops, startup sessions and student project showcases.",
    category: "Technology",
    date: "28 Sep 2026",
    day: "28",
    time: "09:00 AM – 05:00 PM",
    location: "Main Auditorium",
    attendees: 428,
    capacity: 500,
    featured: true,
  },
  {
    id: 2,
    title: "AI & Machine Learning Workshop",
    description:
      "Hands-on workshop covering modern machine learning workflows, model deployment and practical AI applications.",
    category: "Technology",
    date: "30 Sep 2026",
    day: "30",
    time: "10:00 AM – 01:00 PM",
    location: "AI Lab · Block A",
    attendees: 76,
    capacity: 100,
  },
  {
    id: 3,
    title: "Career & Internship Fair 2026",
    description:
      "Meet recruiters from leading technology companies and explore internship, graduate and career opportunities.",
    category: "Career",
    date: "04 Oct 2026",
    day: "04",
    time: "10:00 AM – 04:00 PM",
    location: "University Sports Complex",
    attendees: 612,
    capacity: 800,
  },
  {
    id: 4,
    title: "Final Year Project Showcase",
    description:
      "Explore innovative final-year projects presented by graduating students across different departments.",
    category: "Academic",
    date: "08 Oct 2026",
    day: "08",
    time: "11:00 AM – 03:00 PM",
    location: "Innovation Center",
    attendees: 184,
    capacity: 250,
  },
  {
    id: 5,
    title: "Inter-Department Sports Gala",
    description:
      "A university-wide sports event featuring cricket, football, badminton, basketball and athletics.",
    category: "Social",
    date: "12 Oct 2026",
    day: "12",
    time: "08:00 AM – 06:00 PM",
    location: "University Sports Ground",
    attendees: 920,
    capacity: 1200,
  },
  {
    id: 6,
    title: "Software Engineering Seminar",
    description:
      "Industry professionals discuss software architecture, engineering careers and building production-scale systems.",
    category: "Academic",
    date: "15 Oct 2026",
    day: "15",
    time: "02:00 PM – 04:00 PM",
    location: "SE Department Hall",
    attendees: 95,
    capacity: 150,
  },
];

const categories = ["All", "Academic", "Technology", "Career", "Social"];

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);

  const featuredEvent = events.find((event) => event.featured);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory =
        activeCategory === "All" || event.category === activeCategory;

      const query = search.toLowerCase();

      const matchesSearch =
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  function toggleRegistration(eventId: number) {
    setRegisteredEvents((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId],
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-350">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              <CalendarDays size={15} />
              Campus Life
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Events
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Discover university events, workshops and campus activities.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
            <CalendarDays size={16} className="text-indigo-600" />
            <span className="text-xs font-semibold text-gray-600">
              6 upcoming events
            </span>
          </div>
        </div>

        {/* Featured Event */}
        {featuredEvent && (
          <Card className="mb-7 overflow-hidden border-0 bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200">
            <div className="grid lg:grid-cols-[1fr_330px]">
              <div className="p-7 lg:p-9">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Star size={11} />
                    Featured Event
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white/80">
                    {featuredEvent.category}
                  </span>
                </div>

                <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                  {featuredEvent.title}
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
                  {featuredEvent.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} />
                    {featuredEvent.date}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock3 size={15} />
                    {featuredEvent.time}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={15} />
                    {featuredEvent.location}
                  </div>
                </div>

                <button
                  onClick={() => toggleRegistration(featuredEvent.id)}
                  className="mt-7 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
                >
                  {registeredEvents.includes(featuredEvent.id)
                    ? "Registered"
                    : "Register for Event"}
                </button>
              </div>

              <div className="hidden border-l border-white/10 bg-white/5 p-8 lg:block">
                <div className="flex h-full flex-col justify-center">
                  <p className="text-xs font-medium text-white/50">
                    Event Capacity
                  </p>

                  <p className="mt-2 text-4xl font-bold">
                    {featuredEvent.attendees}
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    {featuredEvent.capacity} seats available
                  </p>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{
                        width: `${
                          (featuredEvent.attendees / featuredEvent.capacity) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs text-white/60">
                    <Users size={14} />
                    {featuredEvent.attendees} students registered
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Search + Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 xl:max-w-md">
              <Search size={17} className="text-gray-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-semibold transition",
                    activeCategory === category
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Event Grid */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-950">
              Upcoming Events
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Explore what's happening on campus.
            </p>
          </div>

          <span className="text-xs text-gray-400">
            {filteredEvents.length} events
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => {
            const isRegistered = registeredEvents.includes(event.id);
            const seatsLeft = event.capacity - event.attendees;

            return (
              <Card
                key={event.id}
                className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Event visual */}
                <div className="relative h-32 overflow-hidden bg-linear-to-br from-gray-900 via-indigo-900 to-violet-900">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(129,140,248,0.35),transparent_35%)]" />

                  <div className="absolute left-5 top-5 grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <p className="text-lg font-bold leading-none">
                        {event.day}
                      </p>
                      <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-white/60">
                        Sep/Oct
                      </p>
                    </div>
                  </div>

                  <span className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {event.category}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-bold leading-6 text-gray-950">
                    {event.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                    {event.description}
                  </p>

                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays size={14} className="text-indigo-500" />
                      {event.date}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock3 size={14} className="text-indigo-500" />
                      {event.time}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={14} className="text-indigo-500" />
                      {event.location}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Users size={13} />
                        {event.attendees} attending
                      </div>

                      <span className="text-[10px] font-medium text-gray-400">
                        {seatsLeft} seats left
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleRegistration(event.id)}
                        className={[
                          "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition",
                          isRegistered
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-indigo-600 text-white hover:bg-indigo-700",
                        ].join(" ")}
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle2 size={14} />
                            Registered
                          </>
                        ) : (
                          "Register"
                        )}
                      </button>

                      <button className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 text-gray-400 transition hover:border-indigo-200 hover:text-indigo-600">
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredEvents.length === 0 && (
          <Card className="mt-5 p-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-gray-400">
              <Search size={20} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-gray-900">
              No events found
            </h3>

            <p className="mt-1 text-xs text-gray-400">
              Try another search term or category.
            </p>
          </Card>
        )}

        <div className="mt-6 flex items-center justify-between px-2 text-xs text-gray-400">
          <span>University Events · Fall 2026</span>

          <span>
            {registeredEvents.length} event
            {registeredEvents.length !== 1 ? "s" : ""} registered
          </span>
        </div>
      </div>
    </AppShell>
  );
}
