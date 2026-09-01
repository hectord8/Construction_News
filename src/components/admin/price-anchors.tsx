"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMaterialAnchors, refreshPrices } from "@/server/admin";
import type { MaterialPriceData } from "@/lib/queries";

const field =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent";

function formatPct(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function pctColor(value: number | null): string {
  if (value === null) return "text-muted";
  if (value > 0) return "text-red-600";
  if (value < 0) return "text-green-600";
  return "text-muted";
}

export function PriceAnchors({ data }: { data: MaterialPriceData[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {data.length} materials tracked
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await refreshPrices();
              router.refresh();
            })
          }
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Refreshing..." : "Refresh from DBT"}
        </button>
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper">
        {data.map((d) => (
          <form
            key={d.material.id}
            action={(fd) =>
              startTransition(async () => {
                await saveMaterialAnchors(fd);
                router.refresh();
              })
            }
            className="grid gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
          >
            <input type="hidden" name="id" value={d.material.id} />
            <div>
              <div className="font-medium text-ink">{d.material.name}</div>
              <div className="text-xs text-muted">
                {d.material.category} · Latest:{" "}
                {d.latestIndex !== null ? d.latestIndex.toFixed(1) : "—"}
                {d.latestPeriod && ` (${d.latestPeriod})`}
              </div>
              <div className="mt-1 flex gap-3 text-xs">
                <span className={pctColor(d.momPct)}>
                  MoM: {formatPct(d.momPct)}
                </span>
                <span className={pctColor(d.yoyPct)}>
                  YoY: {formatPct(d.yoyPct)}
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Anchor £
              </label>
              <input
                type="number"
                step="0.01"
                name="anchorPrice"
                defaultValue={d.material.anchorPrice ?? ""}
                placeholder="e.g. 110"
                className={field}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Anchor Index
              </label>
              <input
                type="number"
                step="0.1"
                name="anchorIndex"
                defaultValue={d.material.anchorIndex ?? ""}
                placeholder="e.g. 156.4"
                className={field}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Anchor Period
              </label>
              <input
                type="text"
                name="anchorPeriod"
                defaultValue={d.material.anchorPeriod ?? ""}
                placeholder="e.g. 2026-04"
                className={field}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </form>
        ))}
        {data.length === 0 && (
          <div className="p-8 text-center text-muted">
            No materials configured. Run the refresh script to populate data.
          </div>
        )}
      </div>
    </div>
  );
}
