export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="font-display text-2xl font-semibold">Admin login</h1>
      <p className="mt-1 text-sm text-muted">Manage seasons, products, and orders.</p>

      <form action="/api/admin/login" method="POST" className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="next" value={next ?? "/admin"} />
        <label className="text-sm font-medium">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        {error && <p className="text-sm text-red-600">Invalid email or password.</p>}
        <button
          type="submit"
          className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
