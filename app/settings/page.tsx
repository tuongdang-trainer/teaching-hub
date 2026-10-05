export default function SettingsPage() {
  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your Teaching Hub preferences and configuration.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#e7e9ed] bg-white">
        <div className="border-b border-[#e7e9ed] px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Profile
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your teaching profile and account information.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Teacher Name
            </label>

            <input
              type="text"
              defaultValue=""
              placeholder="Enter your name"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              defaultValue=""
              placeholder="teacher@example.com"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Role
            </label>

            <input
              type="text"
              defaultValue="English Teacher"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500"
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e7e9ed] bg-white">
        <div className="border-b border-[#e7e9ed] px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Teaching Preferences
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Default settings used when creating teaching content.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Default Lesson Duration
            </label>

            <select
              defaultValue="60"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500"
            >
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Default Class Size
            </label>

            <select
              defaultValue="8"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500"
            >
              <option value="4">4 learners</option>
              <option value="6">6 learners</option>
              <option value="8">8 learners</option>
              <option value="10">10 learners</option>
              <option value="12">12 learners</option>
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e7e9ed] bg-white">
        <div className="border-b border-[#e7e9ed] px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Academic Settings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure the academic framework used in your teaching system.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Level System
            </label>

            <select
              defaultValue="internal"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500"
            >
              <option value="internal">
                Internal Teaching Hub Levels
              </option>
              <option value="cefr">
                CEFR
              </option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Teaching Framework
            </label>

            <input
              type="text"
              defaultValue="Berlitz"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500"
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e7e9ed] bg-white">
        <div className="border-b border-[#e7e9ed] px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            System
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Basic information about your Teaching Hub workspace.
          </p>
        </div>

        <div className="divide-y divide-[#e7e9ed]">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Application
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Teaching Hub
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Version
              </p>

              <p className="mt-1 text-sm text-gray-500">
                MVP v1.0
              </p>
            </div>

            <span className="text-sm text-gray-500">
              Teaching Management System
            </span>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Save Changes
        </button>
      </div>
    </main>
  );
}