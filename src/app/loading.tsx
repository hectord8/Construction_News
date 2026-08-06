export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="col-span-2 animate-pulse rounded-xl bg-line/60 p-6 sm:p-8">
          <div className="h-5 w-32 rounded bg-line" />
          <div className="mt-8 h-10 w-3/4 rounded bg-line" />
          <div className="mt-4 h-4 w-full max-w-xl rounded bg-line" />
          <div className="mt-2 h-4 w-2/3 rounded bg-line" />
        </div>
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-start gap-3">
              <div className="h-6 w-8 rounded bg-line" />
              <div className="h-4 flex-1 rounded bg-line" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
