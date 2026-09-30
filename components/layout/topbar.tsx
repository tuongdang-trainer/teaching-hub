"use client";

import { useState } from "react";

export default function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e7e9ed] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div className="hidden text-sm text-gray-500 sm:block">
          Teaching Workspace
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100"
          aria-label="Notifications"
        >
          ♢
        </button>

        <div className="ml-1 flex items-center gap-3 border-l border-[#e7e9ed] pl-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-gray-800">
              Cat Tuong
            </div>
            <div className="text-[11px] text-gray-500">
              English Teacher
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9ecef] text-xs font-semibold text-gray-700">
            CT
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-[#e7e9ed] bg-white p-4 shadow-sm lg:hidden">
          <MobileNavigation />
        </div>
      )}
    </header>
  );
}

function MobileNavigation() {
  const items = [
    ["Dashboard", "/dashboard"],
    ["Calendar", "/calendar"],
    ["Classes", "/classes"],
    ["Lessons", "/lessons"],
    ["Learners", "/learners"],
    ["Attendance", "/attendance"],
    ["Assessments", "/assessments"],
    ["Materials", "/materials"],
    ["Courses", "/courses"],
    ["Reports", "/reports"],
    ["Settings", "/settings"],
  ];

  return (
    <nav className="grid grid-cols-2 gap-1">
      {items.map(([label, href]) => (
        <a
          key={href}
          href={href}
          className="rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}