export default function ReviewLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-6 py-10">
      <div className="h-16 w-64 animate-pulse rounded-lg bg-surface" />
      {[1, 2].map((item) => (
        <div key={item} className="h-64 animate-pulse rounded-xl bg-surface" />
      ))}
    </main>
  );
}
