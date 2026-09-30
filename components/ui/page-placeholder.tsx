type PagePlaceholderProps = {
  title: string;
  description: string;
};

export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>

        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>

      <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700">
            This workspace is ready to build.
          </div>

          <div className="mt-1 text-xs text-gray-400">
            The next development step will connect this module to the database.
          </div>
        </div>
      </div>
    </div>
  );
}