"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  Megaphone,
  Search,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { api, type AnnouncementDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

export default function AnnouncementsPage() {
  const { data, loading, error } = useApiResource<AnnouncementDTO[]>(() =>
    api.announcements.list()
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        (item.author?.name ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <AppShell>
      <div className="mx-auto max-w-325">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              <Megaphone size={15} />
              University Communications
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Announcements
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Stay updated with important university notices and updates.
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs font-medium text-gray-500">
              Total Announcements
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {data?.length ?? 0}
            </p>
          </Card>
        </div>

        <Card className="mb-6 p-4">
          <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 xl:max-w-md">
            <Search size={17} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </Card>

        {loading ? (
          <Card className="flex items-center gap-2 p-8 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading
            announcements…
          </Card>
        ) : error ? (
          <Card className="flex items-center gap-2 p-6 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex gap-4">
                    <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 sm:grid">
                      <Megaphone size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold text-gray-950 sm:text-lg">
                        {item.title}
                      </h2>

                      <p className="mt-3 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-gray-500">
                        {item.body}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <CalendarDays size={13} />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] font-medium text-gray-500">
                          {item.author?.name ?? "University"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filtered.length === 0 && (
              <Card className="p-12 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-gray-400">
                  <Megaphone size={20} />
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-800">
                  No announcements found
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
