import type { Metadata } from "next";
import { getMaterialPrices } from "@/lib/queries";
import { PriceSparkline } from "@/components/prices/price-sparkline";

export const metadata: Metadata = {
  title: "Material Prices",
  description:
    "Live UK building materials price indices from the Department for Business and Trade. Monthly updates with month-on-month and year-on-year changes.",
};

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

function formatPrice(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1000) return `£${value.toFixed(0)}`;
  if (value >= 100) return `£${value.toFixed(1)}`;
  return `£${value.toFixed(2)}`;
}

export default async function PricesPage() {
  const data = await getMaterialPrices();

  // Find latest period across all materials
  const latestPeriod = data.reduce((latest, d) => {
    if (!d.latestPeriod) return latest;
    if (!latest) return d.latestPeriod;
    return d.latestPeriod > latest ? d.latestPeriod : latest;
  }, null as string | null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="border-b border-line pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
          Live Data
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Material Prices
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          UK building materials price indices from the Department for Business
          and Trade. Updated monthly. £ estimates are anchored to official
          indices and trade sources.
        </p>
        {latestPeriod && (
          <p className="mt-2 text-sm text-muted">
            Latest data:{" "}
            <span className="font-medium text-ink">{latestPeriod}</span>
          </p>
        )}
      </header>

      <div className="mt-8 overflow-hidden rounded-xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-background text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Material</th>
              <th className="px-4 py-3 font-semibold">Est. Price</th>
              <th className="px-4 py-3 font-semibold">Index</th>
              <th className="px-4 py-3 font-semibold">MoM</th>
              <th className="px-4 py-3 font-semibold">YoY</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">
                12-mo Trend
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.map((d) => (
              <tr key={d.material.id} className="hover:bg-line/30">
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{d.material.name}</div>
                  {d.material.category && (
                    <div className="text-xs text-muted">
                      {d.material.category}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-ink">
                  {formatPrice(d.estPrice)}
                </td>
                <td className="px-4 py-3 text-ink">
                  {d.latestIndex !== null ? d.latestIndex.toFixed(1) : "—"}
                </td>
                <td className={`px-4 py-3 font-medium ${pctColor(d.momPct)}`}>
                  {formatPct(d.momPct)}
                </td>
                <td className={`px-4 py-3 font-medium ${pctColor(d.yoyPct)}`}>
                  {formatPct(d.yoyPct)}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <PriceSparkline data={d.sparkline} />
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted"
                >
                  No price data available yet. Run the refresh script to
                  populate data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-xl border border-line bg-paper p-6">
        <h2 className="font-display text-lg font-bold text-ink">
          About this data
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
          <p>
            <strong className="text-ink">Source:</strong> Department for
            Business and Trade, Monthly Bulletin of Building Materials and
            Components Statistics. Published under the{" "}
            <a
              href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              className="text-accent-strong hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Government Licence v3.0
            </a>
            .
          </p>
          <p>
            <strong className="text-ink">Indices:</strong> Price indices are
            relative to a 2015 base year (2015 = 100). They show how prices
            have changed over time, not absolute £ values.
          </p>
          <p>
            <strong className="text-ink">£ Estimates:</strong> Estimated prices
            are calculated by anchoring a known trade price to the official
            index, then tracking changes. These are indicative only — actual
            prices vary by region, quantity, and supplier.
          </p>
          <p>
            <strong className="text-ink">Updates:</strong> Data is refreshed
            monthly when DBT publishes the new bulletin (typically around the
            6th of each month).
          </p>
        </div>
      </div>
    </div>
  );
}
