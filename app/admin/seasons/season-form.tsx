"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InitialSeason = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

export function SeasonForm({
  action,
  initial,
}: {
  action: (formData: FormData) => Promise<{ ok: true }>;
  initial?: InitialSeason;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        setError(null);
        setPending(true);
        try {
          await action(formData);
          router.push("/admin/seasons");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
          setPending(false);
        }
      }}
      className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-border bg-surface p-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Name
          <input name="name" required defaultValue={initial?.name} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
        </label>
        <label className="block text-sm font-medium">
          Slug <span className="font-normal text-muted">(auto if blank)</span>
          <input name="slug" defaultValue={initial?.slug} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Tagline
        <input name="tagline" defaultValue={initial?.tagline} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
      </label>
      <label className="block text-sm font-medium">
        Description
        <textarea name="description" rows={3} defaultValue={initial?.description} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
      </label>
      <div className="grid grid-cols-3 gap-4">
        <label className="block text-sm font-medium">
          Emoji
          <input name="emoji" defaultValue={initial?.emoji ?? "✨"} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
        </label>
        <label className="block text-sm font-medium">
          Color from
          <input name="colorFrom" type="color" defaultValue={initial?.colorFrom ?? "#f59e0b"} className="mt-1 h-10 w-full rounded-lg border border-border bg-background" />
        </label>
        <label className="block text-sm font-medium">
          Color to
          <input name="colorTo" type="color" defaultValue={initial?.colorTo ?? "#ea580c"} className="mt-1 h-10 w-full rounded-lg border border-border bg-background" />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <label className="block text-sm font-medium">
          Discount %
          <input name="discountPercent" type="number" min="0" max="100" defaultValue={initial?.discountPercent ?? 0} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
        </label>
        <label className="block text-sm font-medium">
          Starts at
          <input name="startsAt" type="datetime-local" required defaultValue={initial?.startsAt} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
        </label>
        <label className="block text-sm font-medium">
          Ends at
          <input name="endsAt" type="datetime-local" required defaultValue={initial?.endsAt} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} />
        Active (visible on the storefront)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Saving…" : initial ? "Save changes" : "Create season"}
      </button>
    </form>
  );
}
