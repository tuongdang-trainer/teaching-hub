const stats = [
  {
    label: "Active Classes",
    value: "0",
    description: "No classes added yet",
  },
  {
    label: "Learners",
    value: "0",
    description: "No learners added yet",
  },
  {
    label: "Lessons",
    value: "0",
    description: "No lessons planned yet",
  },
  {
    label: "Upcoming",
    value: "0",
    description: "No upcoming sessions",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-1 text-sm text-gray-500">Wednesday, September 30</p>

        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Good afternoon, Cat Tuong.
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Your teaching workspace for planning, teaching, recording,
          reviewing, and improving.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#e7e9ed] bg-white p-5"
          >
            <div className="text-sm text-gray-500">{stat.label}</div>

            <div className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              {stat.value}
            </div>

            <div className="mt-2 text-xs text-gray-400">
              {stat.description}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-[#e7e9ed] bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Today
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your teaching schedule and priorities.
              </p>
            </div>

            <a
              href="/calendar"
              className="text-sm font-medium text-gray-700 hover:text-gray-950"
            >
              View calendar →
            </a>
          </div>

          <div className="mt-6 flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">
                No teaching sessions yet
              </div>

              <div className="mt-1 text-xs text-gray-400">
                Your upcoming lessons will appear here.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e7e9ed] bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Start working from here.
          </p>

          <div className="mt-5 space-y-2">
            <QuickAction
              title="Create a lesson"
              description="Plan a new teaching session"
              href="/lessons/new"
            />

            <QuickAction
              title="Add a class"
              description="Create a teaching group"
              href="/classes/new"
            />

            <QuickAction
              title="Add a learner"
              description="Create a learner profile"
              href="/learners/new"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-[#e7e9ed] bg-white p-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Teaching Loop
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            The workflow behind Teaching Hub.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {[
            "Plan",
            "Prepare",
            "Teach",
            "Record",
            "Review",
            "Improve",
            "Reuse",
            "Repeat",
          ].map((step, index) => (
            <div
              key={step}
              className="relative rounded-lg bg-gray-50 px-3 py-4 text-center"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                0{index + 1}
              </div>

              <div className="mt-1 text-sm font-medium text-gray-800">
                {step}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-gray-100 px-4 py-3 transition hover:border-gray-200 hover:bg-gray-50"
    >
      <div className="text-sm font-medium text-gray-800">{title}</div>

      <div className="mt-1 text-xs text-gray-400">{description}</div>
    </a>
  );
}