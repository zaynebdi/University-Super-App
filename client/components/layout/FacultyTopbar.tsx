"use client";

import { Bell, Menu, Search, ChevronDown, Command } from "lucide-react";

type FacultyTopbarProps = {
  onMenuClick?: () => void;
};

export default function FacultyTopbar({ onMenuClick }: FacultyTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-19 items-center justify-between border-b border-gray-200 bg-white px-5 lg:px-8">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="hidden h-10 w-75 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 md:flex">
          <Search size={17} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search students, courses..."
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />

          <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 py-1 text-[10px] text-gray-400">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>

        {/* Mobile Search */}
        <button
          type="button"
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <Search size={19} />
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-indigo-500" />
        </button>

        {/* Divider */}
        <div className="mx-1 hidden h-8 w-px bg-gray-200 sm:block" />

        {/* Faculty Profile */}
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl p-1.5 pr-2 hover:bg-gray-50"
        >
          <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
            DA
          </div>

          <div className="hidden text-left sm:block">
            <div className="text-[13px] font-semibold text-gray-900">
              Dr. Ahmed
            </div>

            <div className="text-[11px] text-gray-400">
              Software Engineering
            </div>
          </div>

          <ChevronDown size={15} className="hidden text-gray-400 sm:block" />
        </button>
      </div>
    </header>
  );
}
