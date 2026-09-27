"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Bus,
  ChevronRight,
  Coffee,
  Compass,
  GraduationCap,
  Library,
  MapPin,
  Navigation,
  Search,
  Shield,
  Sparkles,
  Wifi,
  X,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

type Location = {
  id: string;
  name: string;
  type: string;
  description: string;
  x: number;
  y: number;
  icon: "academic" | "library" | "cafeteria" | "security" | "transport";
};

const locations: Location[] = [
  {
    id: "main-block",
    name: "Main Academic Block",
    type: "Academic",
    description: "Lecture halls, faculty offices and administrative services.",
    x: 38,
    y: 30,
    icon: "academic",
  },
  {
    id: "cs-block",
    name: "Computing & Technology Block",
    type: "Academic",
    description: "Software engineering, AI and cybersecurity laboratories.",
    x: 64,
    y: 28,
    icon: "academic",
  },
  {
    id: "library",
    name: "Central Library",
    type: "Library",
    description: "Digital resources, study areas and research collections.",
    x: 27,
    y: 58,
    icon: "library",
  },
  {
    id: "cafeteria",
    name: "Student Cafeteria",
    type: "Food & Social",
    description: "Food court, student lounge and social area.",
    x: 65,
    y: 61,
    icon: "cafeteria",
  },
  {
    id: "sports",
    name: "Sports Complex",
    type: "Recreation",
    description: "Indoor and outdoor sports facilities.",
    x: 81,
    y: 45,
    icon: "academic",
  },
  {
    id: "security",
    name: "Security Office",
    type: "Security",
    description: "Campus security and student assistance desk.",
    x: 16,
    y: 38,
    icon: "security",
  },
  {
    id: "bus",
    name: "Main Transport Stop",
    type: "Transport",
    description: "University shuttle and bus pickup point.",
    x: 49,
    y: 82,
    icon: "transport",
  },
];

const categories = [
  "All",
  "Academic",
  "Library",
  "Food & Social",
  "Security",
  "Transport",
];

function getIcon(type: Location["icon"]) {
  if (type === "library") return Library;
  if (type === "cafeteria") return Coffee;
  if (type === "security") return Shield;
  if (type === "transport") return Bus;
  return Building2;
}

export default function CampusPage() {
  const [selected, setSelected] = useState<Location | null>(locations[0]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [navigationMode, setNavigationMode] = useState(false);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch =
        location.name.toLowerCase().includes(search.toLowerCase()) ||
        location.type.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || location.type === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <AppShell>
      <div className="mx-auto max-w-375 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
              <Sparkles size={13} />
              Smart Campus Experience
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              3D Campus
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Explore buildings, find facilities, and navigate your university
              campus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 sm:flex">
              <Wifi size={15} className="text-emerald-500" />
              <span className="text-[11px] font-semibold text-gray-600">
                Campus Connected
              </span>
            </div>

            <button
              onClick={() => setNavigationMode(!navigationMode)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                navigationMode
                  ? "bg-gray-900 text-white"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              }`}
            >
              <Navigation size={16} />
              {navigationMode ? "Navigation On" : "Navigate"}
            </button>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3">
              <Search size={17} className="text-gray-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search buildings, facilities or locations..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    category === item
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Main campus experience */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          {/* Campus map */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-gray-950">
                  Interactive Campus
                </h2>

                <p className="mt-1 text-[11px] text-gray-400">
                  Select a building to explore
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500 hover:bg-gray-50">
                  −
                </button>

                <span className="text-[10px] font-semibold text-gray-400">
                  100%
                </span>

                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500 hover:bg-gray-50">
                  +
                </button>
              </div>
            </div>

            <div className="relative min-h-162.5 overflow-hidden bg-[#eef2f7]">
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(#d6dce5 1px, transparent 1px), linear-gradient(90deg, #d6dce5 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Roads */}
              <div className="absolute left-0 right-0 top-[46%] h-12 -rotate-3 bg-gray-300/80" />
              <div className="absolute bottom-0 left-[49%] top-0 w-12 rotate-6 bg-gray-300/80" />
              <div className="absolute left-0 right-0 top-[72%] h-7 rotate-2 bg-gray-300/60" />

              {/* Green areas */}
              <div className="absolute left-[5%] top-[8%] h-32 w-48 rounded-[45%] bg-emerald-100/80" />
              <div className="absolute bottom-[8%] right-[5%] h-40 w-56 rounded-[50%] bg-emerald-100/80" />
              <div className="absolute left-[36%] bottom-[4%] h-24 w-40 rounded-[50%] bg-emerald-100/60" />

              {/* Main Block */}
              <div className="absolute left-[27%] top-[18%] h-28 w-40 rounded-2xl border-2 border-indigo-200 bg-indigo-100/90 p-4 shadow-sm">
                <div className="h-full rounded-xl border border-indigo-200 bg-white/70 p-3">
                  <div className="h-2 w-16 rounded bg-indigo-200" />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <span className="h-5 rounded bg-indigo-100" />
                    <span className="h-5 rounded bg-indigo-100" />
                    <span className="h-5 rounded bg-indigo-100" />
                    <span className="h-5 rounded bg-indigo-100" />
                    <span className="h-5 rounded bg-indigo-100" />
                    <span className="h-5 rounded bg-indigo-100" />
                  </div>
                </div>
              </div>

              {/* Tech Block */}
              <div className="absolute left-[55%] top-[17%] h-32 w-44 rounded-2xl border-2 border-violet-200 bg-violet-100/90 p-4 shadow-sm">
                <div className="h-full rounded-xl border border-violet-200 bg-white/70 p-3">
                  <div className="h-2 w-20 rounded bg-violet-200" />
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <span className="h-6 rounded bg-violet-100" />
                    <span className="h-6 rounded bg-violet-100" />
                    <span className="h-6 rounded bg-violet-100" />
                    <span className="h-6 rounded bg-violet-100" />
                    <span className="h-6 rounded bg-violet-100" />
                    <span className="h-6 rounded bg-violet-100" />
                    <span className="h-6 rounded bg-violet-100" />
                    <span className="h-6 rounded bg-violet-100" />
                  </div>
                </div>
              </div>

              {/* Library */}
              <div className="absolute left-[17%] top-[50%] h-28 w-36 rounded-2xl border-2 border-cyan-200 bg-cyan-100/90 p-4 shadow-sm">
                <div className="h-full rounded-xl border border-cyan-200 bg-white/70 p-3">
                  <div className="h-2 w-14 rounded bg-cyan-200" />
                  <div className="mt-4 space-y-2">
                    <span className="block h-2 rounded bg-cyan-100" />
                    <span className="block h-2 rounded bg-cyan-100" />
                    <span className="block h-2 rounded bg-cyan-100" />
                  </div>
                </div>
              </div>

              {/* Cafeteria */}
              <div className="absolute left-[56%] top-[52%] h-28 w-36 rounded-2xl border-2 border-amber-200 bg-amber-100/90 p-4 shadow-sm">
                <div className="h-full rounded-xl border border-amber-200 bg-white/70 p-3">
                  <div className="grid grid-cols-3 gap-3">
                    <span className="h-5 rounded-full bg-amber-100" />
                    <span className="h-5 rounded-full bg-amber-100" />
                    <span className="h-5 rounded-full bg-amber-100" />
                    <span className="h-5 rounded-full bg-amber-100" />
                    <span className="h-5 rounded-full bg-amber-100" />
                    <span className="h-5 rounded-full bg-amber-100" />
                  </div>
                </div>
              </div>

              {/* Sports */}
              <div className="absolute right-[5%] top-[35%] h-28 w-36 rounded-[40%] border-2 border-emerald-200 bg-emerald-100/90 p-4 shadow-sm">
                <div className="h-full rounded-[40%] border-2 border-emerald-200 bg-white/50" />
              </div>

              {/* Security */}
              <div className="absolute left-[8%] top-[29%] h-16 w-24 rounded-xl border-2 border-rose-200 bg-rose-100/90 p-3 shadow-sm">
                <div className="h-full rounded-lg bg-white/60" />
              </div>

              {/* Bus stop */}
              <div className="absolute bottom-[10%] left-[42%] h-14 w-32 rounded-xl border-2 border-sky-200 bg-sky-100/90 p-3 shadow-sm">
                <div className="h-full rounded-lg bg-white/60" />
              </div>

              {/* Location markers */}
              {filteredLocations.map((location) => {
                const Icon = getIcon(location.icon);
                const isSelected = selected?.id === location.id;

                return (
                  <button
                    key={location.id}
                    onClick={() => setSelected(location)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition hover:scale-110"
                    style={{
                      left: `${location.x}%`,
                      top: `${location.y}%`,
                    }}
                  >
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-full border-4 border-white shadow-xl transition ${
                        isSelected
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-200"
                          : "bg-white text-indigo-600"
                      }`}
                    >
                      <Icon size={17} />
                    </div>

                    <div
                      className={`mt-1 whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-bold shadow-sm ${
                        isSelected
                          ? "bg-gray-900 text-white"
                          : "bg-white/95 text-gray-700"
                      }`}
                    >
                      {location.name}
                    </div>
                  </button>
                );
              })}

              {/* User location */}
              <div className="absolute bottom-[21%] right-[27%]">
                <div className="relative grid h-9 w-9 place-items-center rounded-full border-4 border-white bg-indigo-500 shadow-xl">
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  <div className="absolute -inset-2 animate-ping rounded-full bg-indigo-400/20" />
                </div>

                <div className="mt-1 rounded-md bg-gray-900 px-2 py-1 text-[9px] font-bold text-white">
                  You are here
                </div>
              </div>

              {/* Compass */}
              <div className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-xl border border-gray-200 bg-white/90 shadow-lg backdrop-blur">
                <Compass size={22} className="text-gray-700" />
                <span className="absolute top-1 text-[7px] font-bold text-gray-400">
                  N
                </span>
              </div>

              {/* Legend */}
              <div className="absolute bottom-5 left-5 rounded-xl border border-gray-200 bg-white/90 p-3 shadow-lg backdrop-blur">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Map Legend
                </p>

                <div className="space-y-2 text-[10px] text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    Your location
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full border border-indigo-300 bg-indigo-100" />
                    Academic
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full border border-emerald-300 bg-emerald-100" />
                    Campus area
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Location panel */}
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Selected Location
                </p>

                {selected ? (
                  <>
                    <div className="mt-4 flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                        {(() => {
                          const Icon = getIcon(selected.icon);
                          return <Icon size={19} />;
                        })()}
                      </div>

                      <div>
                        <h2 className="text-base font-bold text-gray-950">
                          {selected.name}
                        </h2>

                        <p className="mt-1 text-[11px] text-indigo-600">
                          {selected.type}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-gray-500">
                      {selected.description}
                    </p>

                    <div className="mt-5 space-y-2">
                      <button
                        onClick={() => setNavigationMode(true)}
                        className="flex w-full items-center justify-between rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        <span className="flex items-center gap-2">
                          <Navigation size={15} />
                          Navigate here
                        </span>

                        <ArrowUpRight size={15} />
                      </button>

                      <button className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                        <span className="flex items-center gap-2">
                          <MapPin size={15} />
                          View details
                        </span>

                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Select a location on the campus map.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="p-4">
                  <p className="text-[10px] text-gray-400">Distance</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">180 m</p>
                </div>

                <div className="p-4">
                  <p className="text-[10px] text-gray-400">Walk time</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">~3 min</p>
                </div>
              </div>
            </Card>

            {/* Nearby */}
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-950">Nearby</h2>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Facilities around you
                  </p>
                </div>

                <MapPin size={17} className="text-gray-400" />
              </div>

              <div className="space-y-2">
                {locations.slice(0, 4).map((location) => {
                  const Icon = getIcon(location.icon);

                  return (
                    <button
                      key={location.id}
                      onClick={() => setSelected(location)}
                      className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-gray-50"
                    >
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gray-100 text-gray-600">
                        <Icon size={15} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-gray-800">
                          {location.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {location.type}
                        </p>
                      </div>

                      <ChevronRight size={14} className="text-gray-300" />
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Smart navigation */}
            <div className="overflow-hidden rounded-2xl bg-linear-to-br from-gray-950 to-gray-800 p-5 text-white shadow-xl">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                <Sparkles size={18} />
              </div>

              <h2 className="text-sm font-bold">Smart Campus Navigation</h2>

              <p className="mt-2 text-[11px] leading-5 text-gray-300">
                In the full 3D version, UniSphere can guide students between
                classrooms, labs, offices and campus facilities.
              </p>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-gray-300">
                  <CheckIcon />
                  Building-to-building directions
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-300">
                  <CheckIcon />
                  Classroom finder
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-300">
                  <CheckIcon />
                  Accessible routes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campus services */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-950">
              Campus Services
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Quickly access important university facilities.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceCard
              icon={<Library size={18} />}
              title="Central Library"
              description="Study spaces & digital resources"
            />

            <ServiceCard
              icon={<Coffee size={18} />}
              title="Student Cafeteria"
              description="Food, lounge & social space"
            />

            <ServiceCard
              icon={<Bus size={18} />}
              title="Transport"
              description="Routes & shuttle information"
            />

            <ServiceCard
              icon={<GraduationCap size={18} />}
              title="Academic Offices"
              description="Departments & faculty offices"
            />
          </div>
        </div>

        {/* Navigation overlay */}
        {navigationMode && selected && (
          <div className="fixed bottom-6 left-1/2 z-90 w-[calc(100%-32px)] max-w-xl -translate-x-1/2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white">
                  <Navigation size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Navigation
                  </p>

                  <p className="truncate text-sm font-bold text-gray-950">
                    Walking to {selected.name}
                  </p>

                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Approximately 180 m · 3 minutes
                  </p>
                </div>

                <button
                  onClick={() => setNavigationMode(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={17} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CheckIcon() {
  return (
    <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
      ✓
    </span>
  );
}

function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="group cursor-pointer p-5 transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-lg">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
        {icon}
      </div>

      <h3 className="text-sm font-bold text-gray-900">{title}</h3>

      <p className="mt-1 text-[11px] text-gray-400">{description}</p>

      <div className="mt-4 flex items-center gap-1 text-[10px] font-semibold text-indigo-600">
        Explore
        <ArrowUpRight size={12} />
      </div>
    </Card>
  );
}
