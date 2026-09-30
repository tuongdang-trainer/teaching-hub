"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserInfo = {
  email: string;
  fullName: string;
  initials: string;
};

export default function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authUser.id)
        .single();

      const fullName =
        profile?.full_name ||
        authUser.user_metadata?.full_name ||
        authUser.email ||
        "Teacher";

      const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((name: string) => name[0])
        .join("")
        .toUpperCase();

      setUser({
        email: authUser.email || "",
        fullName,
        initials,
      });
    }

    loadUser();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/login";
  }

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
              {user?.fullName || "Loading..."}
            </div>

            <div className="text-[11px] text-gray-500">
              {user?.email || "Teacher"}
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9ecef] text-xs font-semibold text-gray-700">
            {user?.initials || "T"}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
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