import { getMaterialPrices } from "@/lib/queries";
import { PriceAnchors } from "@/components/admin/price-anchors";

export default async function AdminPricesPage() {
  const data = await getMaterialPrices();

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">
        Material Prices
      </h2>
      <p className="mt-1 text-sm text-muted">
        Manage anchor prices for £ estimates. The refresh script pulls live
        indices from the Department for Business and Trade.
      </p>

      <div className="mt-6">
        <PriceAnchors data={data} />
      </div>
    </div>
  );
}
