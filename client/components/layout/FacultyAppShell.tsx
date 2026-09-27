"use client";

import { useState } from "react";
import FacultySidebar from "./FacultySidebar";
import FacultyTopbar from "./FacultyTopbar";

export default function FacultyAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <FacultySidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-62.5">
        <FacultyTopbar onMenuClick={() => setMobileOpen(true)} />

        <main className="min-h-[calc(100vh-76px)] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
