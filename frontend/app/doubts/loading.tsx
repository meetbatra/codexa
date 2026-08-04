export default function DoubtsLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 p-6">
      <div className="flex-1 space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
      <div className="hidden h-80 w-80 animate-pulse rounded-xl bg-surface lg:block" />
    </main>
  );
}
