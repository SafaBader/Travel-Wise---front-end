export default function LoadingSpinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  return (
    <section className={`${s} border-2 border-neutral-200 dark:border-neutral-700 border-t-primary-500 rounded-full animate-spin`} />
  );
}

export function PageLoader() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <section className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Loading...</p>
      </section>
    </section>
  );
}
