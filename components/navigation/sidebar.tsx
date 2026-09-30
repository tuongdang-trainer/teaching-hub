"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navigation: NavSection[] = [
  {
    title: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "⌂",
      },
      {
        label: "Calendar",
        href: "/calendar",
        icon: "□",
      },
    ],
  },
  {
    title: "Teaching",
    items: [
      {
        label: "Classes",
        href: "/classes",
        icon: "▣",
      },
      {
        label: "Lessons",
        href: "/lessons",
        icon: "◫",
      },
      {
        label: "Activities",
        href: "/activities",
        icon: "✦",
      },
    ],
  },
  {
    title: "Learners",
    items: [
      {
        label: "Learners",
        href: "/learners",
        icon: "◉",
      },
      {
        label: "Attendance",
        href: "/attendance",
        icon: "✓",
      },
      {
        label: "Assessments",
        href: "/assessments",
        icon: "◇",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        label: "Materials",
        href: "/materials",
        icon: "▤",
      },
      {
        label: "Vocabulary",
        href: "/vocabulary",
        icon: "Aa",
      },
    ],
  },
  {
    title: "Curriculum",
    items: [
      {
        label: "Courses",
        href: "/courses",
        icon: "▥",
      },
      {
        label: "Units",
        href: "/units",
        icon: "≡",
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        label: "Teaching Analytics",
        href: "/reports",
        icon: "↗",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[#e7e9ed] bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-[#e7e9ed] px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17181a] text-sm font-bold text-white">
            TH
          </div>

          <div>
            <div className="text-sm font-semibold tracking-tight">
              Teaching Hub
            </div>
            <div className="text-[11px] text-gray-500">
              Teaching workspace
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              {section.title}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-[#f1f3f5] font-medium text-[#17181a]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex w-5 justify-center text-sm text-gray-500">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#e7e9ed] p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          <span className="flex w-5 justify-center">⚙</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}