import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { MATERIALS } from "../src/lib/prices";
import { materials, materialPrices } from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const CKAN_URL =
  "https://data.gov.uk/api/3/action/package_show?id=monthly_statistics_of_building_materials_and_components";

function parseMonthHeader(header: string): string | null {
  // Parse "Mar 2025" → "2025-03"
  const match = header.match(/^(\w{3})\s+(\d{4})$/);
  if (!match) return null;
  const [, monthStr, year] = match;
  const months: Record<string, number> = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };
  const month = months[monthStr];
  if (!month) return null;
  return `${year}-${String(month).padStart(2, "0")}`;
}

async function main() {
  console.log("Fetching CKAN package metadata...");
  const res = await fetch(CKAN_URL);
  if (!res.ok) {
    console.error(`CKAN API returned ${res.status}`);
    process.exit(1);
  }
  const json = await res.json();
  if (!json.success) {
    console.error("CKAN API returned success=false");
    process.exit(1);
  }

  const resources = json.result.resources as Array<{
    name: string;
    format: string;
    url: string;
    created: string;
  }>;

  // Find latest ODS resource
  const odsResources = resources
    .filter((r) => r.format === "ODS" || r.url.endsWith(".ods"))
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  if (!odsResources.length) {
    console.error("No ODS resources found in CKAN package");
    process.exit(1);
  }

  const latest = odsResources[0];
  console.log(`Latest ODS: ${latest.name} (${latest.created})`);
  console.log(`URL: ${latest.url}`);

  // Download ODS
  console.log("Downloading ODS...");
  const odsRes = await fetch(latest.url);
  if (!odsRes.ok) {
    console.error(`Failed to download ODS: ${odsRes.status}`);
    process.exit(1);
  }
  const buffer = Buffer.from(await odsRes.arrayBuffer());

  // Parse ODS
  console.log("Parsing ODS...");
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // Find Table 2 sheet
  const table2Sheet = workbook.Sheets["2"];
  if (!table2Sheet) {
    console.error("Table 2 sheet not found");
    process.exit(1);
  }

  const range = XLSX.utils.decode_range(table2Sheet["!ref"] || "A1");
  console.log(`Table 2: ${range.e.r + 1} rows, ${range.e.c + 1} cols`);

  // Parse header row (row 5) to get month periods
  const headerRow = 5;
  const periods: string[] = [];
  for (let c = 4; c <= range.e.c; c++) {
    const cell = table2Sheet[XLSX.utils.encode_cell({ r: headerRow, c })];
    if (cell) {
      const period = parseMonthHeader(String(cell.v));
      if (period) periods.push(period);
    }
  }
  console.log(`Found ${periods.length} monthly periods: ${periods[0]} to ${periods[periods.length - 1]}`);

  // Build code → row mapping
  const codeToRow: Record<string, number> = {};
  for (let r = 6; r <= range.e.r; r++) {
    const codeCell = table2Sheet[XLSX.utils.encode_cell({ r, c: 2 })];
    if (codeCell) {
      codeToRow[String(codeCell.v)] = r;
    }
  }
  console.log(`Found ${Object.keys(codeToRow).length} material codes`);

  // Upsert materials from config
  let materialsUpserted = 0;
  for (const m of MATERIALS) {
    const [existing] = await db
      .select()
      .from(materials)
      .where(eq(materials.slug, m.slug))
      .limit(1);

    if (existing) {
      await db
        .update(materials)
        .set({
          name: m.name,
          category: m.category,
          unit: m.unit,
          description: m.description,
          order: m.order,
          sourceSeries: m.sourceSeries,
          updatedAt: new Date(),
        })
        .where(eq(materials.id, existing.id));
    } else {
      await db.insert(materials).values({
        slug: m.slug,
        name: m.name,
        category: m.category,
        unit: m.unit,
        description: m.description,
        order: m.order,
        sourceSeries: m.sourceSeries,
        anchorPrice: String(m.anchorPrice),
        anchorPeriod: m.anchorPeriod,
        updatedAt: new Date(),
      });
    }
    materialsUpserted++;
  }
  console.log(`Upserted ${materialsUpserted} materials`);

  // Extract price data for each material
  let pricesUpserted = 0;
  for (const m of MATERIALS) {
    const row = codeToRow[m.sourceSeries!];
    if (row === undefined) {
      console.warn(`Material ${m.slug} (code ${m.sourceSeries}) not found in Table 2`);
      continue;
    }

    // Get material ID
    const [material] = await db
      .select()
      .from(materials)
      .where(eq(materials.slug, m.slug))
      .limit(1);

    if (!material) {
      console.error(`Material ${m.slug} not found in DB`);
      continue;
    }

    // Extract monthly values
    for (let i = 0; i < periods.length; i++) {
      const col = 4 + i;
      const cell = table2Sheet[XLSX.utils.encode_cell({ r: row, c: col })];
      if (!cell) continue;

      const valueStr = String(cell.v);
      if (valueStr === "[c]" || valueStr === "") continue; // confidential or missing

      const value = parseFloat(valueStr);
      if (isNaN(value)) continue;

      const period = periods[i];

      // Upsert price
      await db
        .insert(materialPrices)
        .values({
          materialId: material.id,
          value: String(value),
          period,
          asOf: new Date(),
        })
        .onConflictDoUpdate({
          target: [materialPrices.materialId, materialPrices.period],
          set: { value: String(value), asOf: new Date() },
        });

      pricesUpserted++;
    }
  }

  console.log(`\n✓ Refreshed ${materialsUpserted} materials, ${pricesUpserted} price records`);
  console.log(`Latest period: ${periods[periods.length - 1]}`);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
