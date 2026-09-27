"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Plus,
  Search,
  MapPin,
  Clock3,
  Users,
  Pencil,
  Trash2,
  Eye,
  Send,
  X,
  CalendarDays,
  CheckCircle2,
  Ticket,
  MoreHorizontal,
  Building2,
} from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  description: string;
  category: "Academic" | "Technology" | "Career" | "Social" | "Workshop";
  date: string;
  time: string;
  location: string;
  organizer: string;
  capacity: number;
  registered: number;
  status: "Published" | "Scheduled" | "Draft";
  createdAt: string;
  featured: boolean;
};

const initialEvents: EventItem[] = [
  {
    id: "event-001",
    title: "Technology Career Session",
    description:
      "Industry professionals will discuss software engineering careers, interview preparation and current technology trends.",
    category: "Career",
    date: "28 Sep 2026",
    time: "10:00 AM — 12:00 PM",
    location: "Main Auditorium",
    organizer: "Computing Department",
    capacity: 300,
    registered: 214,
    status: "Published",
    createdAt: "18 Sep 2026",
    featured: true,
  },
  {
    id: "event-002",
    title: "AI & Machine Learning Workshop",
    description:
      "A practical workshop covering modern AI development, machine learning workflows and real-world applications.",
    category: "Technology",
    date: "02 Oct 2026",
    time: "11:00 AM — 01:00 PM",
    location: "Innovation Lab",
    organizer: "Computer Science Society",
    capacity: 80,
    registered: 61,
    status: "Published",
    createdAt: "20 Sep 2026",
    featured: false,
  },
  {
    id: "event-003",
    title: "Software Architecture Seminar",
    description:
      "Faculty-led seminar on scalable software architecture, microservices and enterprise application design.",
    category: "Academic",
    date: "05 Oct 2026",
    time: "09:00 AM — 11:00 AM",
    location: "A-204",
    organizer: "Software Engineering Department",
    capacity: 70,
    registered: 38,
    status: "Scheduled",
    createdAt: "23 Sep 2026",
    featured: false,
  },
  {
    id: "event-004",
    title: "Freshers Welcome Meetup",
    description:
      "An interactive welcome event for new students with department introductions and student activities.",
    category: "Social",
    date: "10 Oct 2026",
    time: "03:00 PM — 05:00 PM",
    location: "Student Lawn",
    organizer: "Student Affairs",
    capacity: 500,
    registered: 276,
    status: "Published",
    createdAt: "15 Sep 2026",
    featured: false,
  },
  {
    id: "event-005",
    title: "Cyber Security Awareness Workshop",
    description:
      "Learn practical cybersecurity fundamentals, password security, phishing awareness and safe online practices.",
    category: "Workshop",
    date: "14 Oct 2026",
    time: "01:00 PM — 03:00 PM",
    location: "Cyber Lab",
    organizer: "Cyber Security Club",
    capacity: 60,
    registered: 0,
    status: "Draft",
    createdAt: "22 Sep 2026",
    featured: false,
  },
];

const categories = [
  "All",
  "Academic",
  "Technology",
  "Career",
  "Social",
  "Workshop",
];

const statuses = ["All", "Published", "Scheduled", "Draft"];

export default function FacultyEventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Academic",
    date: "",
    time: "",
    location: "",
    organizer: "Computing Department",
    capacity: "100",
    publishMode: "now",
    featured: false,
  });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || event.category === category;

      const matchesStatus = status === "All" || event.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, search, category, status]);

  const published = events.filter(
    (event) => event.status === "Published",
  ).length;

  const scheduled = events.filter(
    (event) => event.status === "Scheduled",
  ).length;

  const totalRegistrations = events.reduce(
    (sum, event) => sum + event.registered,
    0,
  );

  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "Academic",
      date: "",
      time: "",
      location: "",
      organizer: "Computing Department",
      capacity: "100",
      publishMode: "now",
      featured: false,
    });
  };

  const createEvent = () => {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.date ||
      !form.time ||
      !form.location.trim()
    ) {
      return;
    }

    const newEvent: EventItem = {
      id: `event-${Date.now()}`,
      title: form.title,
      description: form.description,
      category: form.category as EventItem["category"],
      date: formatDate(form.date),
      time: form.time,
      location: form.location,
      organizer: form.organizer,
      capacity: Number(form.capacity) || 100,
      registered: 0,
      status: form.publishMode === "schedule" ? "Scheduled" : "Published",
      createdAt: "24 Sep 2026",
      featured: form.featured,
    };

    setEvents((current) => [newEvent, ...current]);

    resetForm();
    setShowCreate(false);
  };

  const saveEdit = () => {
    if (!editingEvent) return;

    setEvents((current) =>
      current.map((event) =>
        event.id === editingEvent.id
          ? {
              ...event,
              title: form.title,
              description: form.description,
              category: form.category as EventItem["category"],
              date: form.date ? formatDate(form.date) : event.date,
              time: form.time || event.time,
              location: form.location,
              organizer: form.organizer,
              capacity: Number(form.capacity) || event.capacity,
              featured: form.featured,
            }
          : event,
      ),
    );

    setEditingEvent(null);
    resetForm();
  };

  const openEdit = (event: EventItem) => {
    setEditingEvent(event);

    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      date: convertDisplayDateToInput(event.date),
      time: event.time,
      location: event.location,
      organizer: event.organizer,
      capacity: String(event.capacity),
      publishMode: event.status === "Scheduled" ? "schedule" : "now",
      featured: event.featured,
    });
  };

  const deleteEvent = (id: string) => {
    setEvents((current) => current.filter((event) => event.id !== id));

    setSelectedEvent(null);
  };

  const publishEvent = (id: string) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, status: "Published" } : event,
      ),
    );
  };

  const toggleFeatured = (id: string) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, featured: !event.featured } : event,
      ),
    );
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditingEvent(null);
    resetForm();
  };

  return (
    <div className="mx-auto max-w-375">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
            <Calendar size={13} />
            Faculty Event Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Events
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Create and manage university events, workshops, seminars and student
            activities.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
        >
          <Plus size={17} />
          Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total Events"
          value={String(events.length)}
          description="Events in your workspace"
          icon={CalendarDays}
        />

        <Stat
          label="Published"
          value={String(published)}
          description="Currently visible to students"
          icon={CheckCircle2}
        />

        <Stat
          label="Scheduled"
          value={String(scheduled)}
          description="Upcoming scheduled events"
          icon={Clock3}
        />

        <Stat
          label="Registrations"
          value={String(totalRegistrations)}
          description={`${totalCapacity} total available seats`}
          icon={Ticket}
        />
      </div>

      {/* Featured Event */}
      {events.some((event) => event.featured) && (
        <div className="mt-7 overflow-hidden rounded-2xl bg-gray-950 text-white shadow-xl">
          {events
            .filter((event) => event.featured)
            .slice(0, 1)
            .map((event) => (
              <div key={event.id} className="relative p-6 lg:p-8">
                <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

                <div className="relative grid gap-7 lg:grid-cols-[1fr_300px]">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-indigo-200">
                      <Ticket size={12} />
                      Featured Event
                    </div>

                    <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight lg:text-3xl">
                      {event.title}
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                      {event.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        {event.date}
                      </span>

                      <span className="flex items-center gap-2">
                        <Clock3 size={14} />
                        {event.time}
                      </span>

                      <span className="flex items-center gap-2">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Registration
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {event.registered}
                    </p>

                    <p className="text-xs text-white/40">
                      of {event.capacity} seats
                    </p>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-indigo-400"
                        style={{
                          width: `${Math.min(
                            (event.registered / event.capacity) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="mt-5 w-full rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-gray-900 hover:bg-gray-100"
                    >
                      View Event
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Filters */}
      <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3">
            <Search size={17} className="text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-indigo-400"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-indigo-400"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events */}
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onView={() => setSelectedEvent(event)}
            onEdit={() => openEdit(event)}
            onDelete={() => deleteEvent(event.id)}
            onPublish={() => publishEvent(event.id)}
            onFeature={() => toggleFeatured(event.id)}
          />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <Calendar size={32} className="mx-auto text-gray-300" />

          <h3 className="mt-4 font-semibold text-gray-900">No events found</h3>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or filters.
          </p>
        </div>
      )}

      {/* Bottom Panels */}
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Registration Rate
              </h3>

              <p className="text-[11px] text-gray-400">Across your events</p>
            </div>
          </div>

          <p className="mt-5 text-3xl font-bold text-gray-950">
            {totalCapacity
              ? Math.round((totalRegistrations / totalCapacity) * 100)
              : 0}
            %
          </p>

          <div className="mt-3 h-2 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{
                width: `${Math.min(
                  totalCapacity
                    ? (totalRegistrations / totalCapacity) * 100
                    : 0,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <Building2 size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Popular Venues
              </h3>

              <p className="text-[11px] text-gray-400">
                Frequently used event locations
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <VenueRow name="Main Auditorium" events={1} />

            <VenueRow name="Innovation Lab" events={1} />

            <VenueRow name="Student Lawn" events={1} />
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
              <Calendar size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-indigo-950">
                Event Automation
              </h3>

              <p className="text-[11px] text-indigo-900/50">
                Backend-ready workflow
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-indigo-900/65">
            Later, registrations, capacity limits, automated reminders, QR
            check-in, attendance and event analytics will be handled by the
            backend.
          </p>
        </div>
      </div>

      {/* View Event Modal */}
      {selectedEvent && (
        <Modal title="Event Details" onClose={() => setSelectedEvent(null)}>
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge label={selectedEvent.category} tone="indigo" />

                <Badge
                  label={selectedEvent.status}
                  tone={
                    selectedEvent.status === "Published"
                      ? "emerald"
                      : selectedEvent.status === "Scheduled"
                        ? "violet"
                        : "gray"
                  }
                />

                {selectedEvent.featured && (
                  <Badge label="Featured" tone="amber" />
                )}
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-950">
                {selectedEvent.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {selectedEvent.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                icon={CalendarDays}
                label="Date"
                value={selectedEvent.date}
              />

              <Info icon={Clock3} label="Time" value={selectedEvent.time} />

              <Info
                icon={MapPin}
                label="Location"
                value={selectedEvent.location}
              />

              <Info
                icon={Users}
                label="Capacity"
                value={`${selectedEvent.registered}/${selectedEvent.capacity}`}
              />
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Registration Progress</span>

                <span className="font-semibold text-gray-800">
                  {Math.round(
                    (selectedEvent.registered / selectedEvent.capacity) * 100,
                  )}
                  %
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width: `${Math.min(
                      (selectedEvent.registered / selectedEvent.capacity) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => {
                  openEdit(selectedEvent);
                  setSelectedEvent(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={15} />
                Edit
              </button>

              {selectedEvent.status !== "Published" && (
                <button
                  onClick={() => {
                    publishEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Send size={15} />
                  Publish
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {(showCreate || editingEvent) && (
        <Modal
          title={editingEvent ? "Edit Event" : "Create Event"}
          onClose={closeModal}
        >
          <EventForm
            form={form}
            setForm={setForm}
            editing={Boolean(editingEvent)}
            onCancel={closeModal}
            onSubmit={editingEvent ? saveEdit : createEvent}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Components ---------------- */

function EventCard({
  event,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onFeature,
}: {
  event: EventItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onFeature: () => void;
}) {
  const percentage = Math.min((event.registered / event.capacity) * 100, 100);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition hover:border-gray-300 hover:shadow-md">
      <div className="flex gap-4">
        <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 sm:grid">
          <Calendar size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={event.category} tone="indigo" />

            <Badge
              label={event.status}
              tone={
                event.status === "Published"
                  ? "emerald"
                  : event.status === "Scheduled"
                    ? "violet"
                    : "gray"
              }
            />

            {event.featured && <Badge label="Featured" tone="amber" />}
          </div>

          <h3 className="mt-3 text-base font-semibold text-gray-950">
            {event.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">
            {event.description}
          </p>

          <div className="mt-4 grid gap-2 text-[11px] text-gray-400 sm:grid-cols-2">
            <span className="flex items-center gap-2">
              <CalendarDays size={13} />
              {event.date}
            </span>

            <span className="flex items-center gap-2">
              <Clock3 size={13} />
              {event.time}
            </span>

            <span className="flex items-center gap-2">
              <MapPin size={13} />
              {event.location}
            </span>

            <span className="flex items-center gap-2">
              <Users size={13} />
              {event.registered}/{event.capacity} registered
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex justify-between text-[10px]">
              <span className="text-gray-400">Registration</span>

              <span className="font-semibold text-gray-600">
                {Math.round(percentage)}%
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="hidden gap-1 sm:flex">
          <button
            onClick={onFeature}
            title={event.featured ? "Remove featured" : "Make featured"}
            className={[
              "h-8 rounded-lg px-2 text-[10px] font-semibold",
              event.featured
                ? "bg-amber-50 text-amber-600"
                : "bg-gray-50 text-gray-400 hover:text-gray-700",
            ].join(" ")}
          >
            ★
          </button>

          <button
            onClick={onEdit}
            title="Edit"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={onDelete}
            title="Delete"
            className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <button
          onClick={onView}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <Eye size={14} />
            View
          </span>
        </button>

        {event.status !== "Published" && (
          <button
            onClick={onPublish}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <span className="inline-flex items-center gap-1.5">
              <Send size={14} />
              Publish
            </span>
          </button>
        )}

        <button
          onClick={onEdit}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <Pencil size={14} />
            Edit
          </span>
        </button>
      </div>
    </div>
  );
}

function EventForm({
  form,
  setForm,
  editing,
  onCancel,
  onSubmit,
}: {
  form: {
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    location: string;
    organizer: string;
    capacity: string;
    publishMode: string;
    featured: boolean;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  editing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Event Title">
        <input
          value={form.title}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              title: e.target.value,
            }))
          }
          placeholder="e.g. AI & Machine Learning Workshop"
          className="form-input"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              description: e.target.value,
            }))
          }
          rows={4}
          placeholder="Describe the event..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                category: e.target.value,
              }))
            }
            className="form-select"
          >
            {categories.slice(1).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Organizer">
          <input
            value={form.organizer}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                organizer: e.target.value,
              }))
            }
            className="form-input"
          />
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                date: e.target.value,
              }))
            }
            className="form-input"
          />
        </Field>

        <Field label="Time">
          <input
            value={form.time}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                time: e.target.value,
              }))
            }
            placeholder="10:00 AM — 12:00 PM"
            className="form-input"
          />
        </Field>

        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                location: e.target.value,
              }))
            }
            placeholder="e.g. Main Auditorium"
            className="form-input"
          />
        </Field>

        <Field label="Capacity">
          <input
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                capacity: e.target.value,
              }))
            }
            className="form-input"
          />
        </Field>
      </div>

      {!editing && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Publishing
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  publishMode: "now",
                }))
              }
              className={[
                "rounded-xl border p-3 text-left",
                form.publishMode === "now"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Send size={15} />
                Publish Now
              </div>

              <p className="mt-1 text-[11px] text-gray-500">
                Make the event visible immediately.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  publishMode: "schedule",
                }))
              }
              className={[
                "rounded-xl border p-3 text-left",
                form.publishMode === "schedule"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Clock3 size={15} />
                Schedule
              </div>

              <p className="mt-1 text-[11px] text-gray-500">
                Prepare the event for later publication.
              </p>
            </button>
          </div>
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              featured: e.target.checked,
            }))
          }
          className="h-4 w-4 accent-indigo-600"
        />

        <div>
          <div className="text-sm font-semibold text-gray-900">
            Feature this event
          </div>

          <div className="text-[11px] text-gray-500">
            Highlight it on the events page.
          </div>
        </div>
      </label>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">
        Backend validation will later prevent capacity conflicts, unavailable
        venues and overlapping events.
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
          {editing ? "Save Changes" : "Create Event"}
        </button>
      </div>
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

function Stat({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Calendar;
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

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "indigo" | "emerald" | "violet" | "amber" | "gray";
}) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-700",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[tone]}`}
    >
      {label}
    </span>
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

function VenueRow({ name, events }: { name: string; events: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-gray-400" />

        <span className="text-xs font-medium text-gray-700">{name}</span>
      </div>

      <span className="text-[10px] font-semibold text-gray-400">
        {events} event
      </span>
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

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function convertDisplayDateToInput(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
