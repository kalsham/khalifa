"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; name: string };

type InitialProduct = {
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  pageCount: number | null;
  seasonId: string | null;
  categoryId: string | null;
  featured: boolean;
  published: boolean;
  coverImage: string;
};

export function ProductForm({
  seasons,
  categories,
  action,
  initial,
}: {
  seasons: Option[];
  categories: Option[];
  action: (formData: FormData) => Promise<{ ok: true }>;
  initial?: InitialProduct;
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
          router.push("/admin/products");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
          setPending(false);
        }
      }}
      className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]"
    >
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <label className="block text-sm font-medium">
          Title
          <input
            name="title"
            required
            defaultValue={initial?.title}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Slug <span className="font-normal text-muted">(leave blank to auto-generate)</span>
          <input
            name="slug"
            defaultValue={initial?.slug}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea
            name="description"
            rows={4}
            defaultValue={initial?.description}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Price (USD)
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={initial ? (initial.priceCents / 100).toFixed(2) : undefined}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm font-medium">
            Page count
            <input
              name="pageCount"
              type="number"
              min="0"
              defaultValue={initial?.pageCount ?? undefined}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Season
            <select
              name="seasonId"
              defaultValue={initial?.seasonId ?? ""}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">None</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Category
            <select
              name="categoryId"
              defaultValue={initial?.categoryId ?? ""}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} />
            Published
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <label className="block text-sm font-medium">
            PDF file {initial && <span className="font-normal text-muted">(leave blank to keep current)</span>}
            <input
              name="pdf"
              type="file"
              accept="application/pdf"
              required={!initial}
              className="mt-1 w-full text-sm"
            />
          </label>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <label className="block text-sm font-medium">
            Cover image {initial && <span className="font-normal text-muted">(leave blank to keep current)</span>}
            <input
              name="cover"
              type="file"
              accept="image/*"
              required={!initial}
              className="mt-1 w-full text-sm"
            />
          </label>
          {initial?.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={initial.coverImage} alt="Current cover" className="mt-3 h-40 w-32 rounded-lg object-cover" />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
