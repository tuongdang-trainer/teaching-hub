"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type AttendanceSession = {
  id: string;
  class_id: string;
  date: string;
  status: string;
};

type ClassInfo = {
  id: string;
  name: string;
};

type AttendanceSessionFiltersProps = {
  sessions: AttendanceSession[];
  classes: ClassInfo[];
};

export default function AttendanceSessionFilters({
  sessions,
  classes,
}: AttendanceSessionFiltersProps) {
  const [selectedClassId, setSelectedClassId] =
    useState("all");

  const [selectedStatus, setSelectedStatus] =
    useState("all");

  const classMap = new Map(
    classes.map((classItem) => [
      classItem.id,
      classItem.name,
    ])
  );

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesClass =
        selectedClassId === "all" ||
        session.class_id === selectedClassId;

      const matchesStatus =
        selectedStatus === "all" ||
        session.status === selectedStatus;

      return matchesClass && matchesStatus;
    });
  }, [
    sessions,
    selectedClassId,
    selectedStatus,
  ]);

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <label
            htmlFor="attendance-class-filter"
            className="text-xs font-medium text-muted-foreground"
          >
            Class
          </label>

          <select
            id="attendance-class-filter"
            value={selectedClassId}
            onChange={(event) =>
              setSelectedClassId(event.target.value)
            }
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground"
          >
            <option value="all">
              All Classes
            </option>

            {classes.map((classItem) => (
              <option
                key={classItem.id}
                value={classItem.id}
              >
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-1.5">
          <label
            htmlFor="attendance-status-filter"
            className="text-xs font-medium text-muted-foreground"
          >
            Status
          </label>

          <select
            id="attendance-status-filter"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value)
            }
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground"
          >
            <option value="all">
              All Statuses
            </option>

            <option value="scheduled">
              Scheduled
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredSessions.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {sessions.length}
          </span>{" "}
          sessions
        </p>
      </div>

      {/* Sessions */}
      {filteredSessions.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center">
          <h3 className="font-medium">
            No matching sessions
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing the class or status filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-6 py-3 font-medium">
                  Class
                </th>

                <th className="px-6 py-3 font-medium">
                  Date
                </th>

                <th className="px-6 py-3 font-medium">
                  Status
                </th>

                <th className="px-6 py-3 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSessions.map((session) => {
                const className =
                  classMap.get(session.class_id) ||
                  "Unknown Class";

                const isCompleted =
                  session.status === "completed";

                return (
                  <tr
                    key={session.id}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/classes/${session.class_id}`}
                        className="font-medium hover:underline"
                      >
                        {className}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      {formatDate(session.date)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          isCompleted
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
                        }
                      >
                        {isCompleted
                          ? "Completed"
                          : "Scheduled"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/classes/${session.class_id}/attendance/${session.id}`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          View Session
                        </Link>

                        <Link
                          href={`/classes/${session.class_id}`}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          View Class
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}