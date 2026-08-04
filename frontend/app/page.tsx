export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-20">
      <section className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl shadow-black/20 sm:p-12">
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-[var(--accent)]">
          Code learning, clarified
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-[var(--text)] sm:text-6xl">
          Build better code with Codexa.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
          Practice problems, submit solutions, and get help when you are stuck.
          Sign in to continue learning.
        </p>
      </section>
    </main>
  );
}
