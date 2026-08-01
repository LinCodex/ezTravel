import { readFileSync } from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { computeSellPrice } from "../src/lib/pricing";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

interface CsvRow {
  Type: string;
  Region: string;
  Name: string;
  "Data Type": string;
  "Price(USD)": string;
  "Variant Price": string;
  Code: string;
  GBs: string;
  "Validity(Days)": string;
  Slug: string;
  Coverage: string;
  ID: string;
  Speed: string;
  "Support TopUp Type": string;
  "FUP policy": string;
  "Operator Networks": string;
}

function parseCost(value: string): number {
  return parseFloat(value.replace(/[$,\s]/g, ""));
}

function parseGb(name: string, gbsColumn: string): number {
  const gbMatch = name.match(/(\d+(?:\.\d+)?)\s*GB/i);
  if (gbMatch) return parseFloat(gbMatch[1]);
  const mbMatch = name.match(/(\d+(?:\.\d+)?)\s*MB/i);
  if (mbMatch) return parseFloat(mbMatch[1]) / 1000;
  const fallback = parseFloat(gbsColumn);
  return Number.isFinite(fallback) ? fallback : 0;
}

async function main() {
  const csvPath = path.join(process.cwd(), "data", "prices.csv");
  const raw = readFileSync(csvPath, "utf8");
  const rows: CsvRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Parsed ${rows.length} rows from CSV`);

  const overridden = new Set(
    (
      await prisma.plan.findMany({
        where: { priceOverridden: true },
        select: { id: true },
      })
    ).map((p) => p.id)
  );

  let imported = 0;
  let skipped = 0;
  const batchSize = 200;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await prisma.$transaction(
      batch.flatMap((row) => {
        const id = row.ID?.trim();
        const cost = parseCost(row["Price(USD)"]);
        if (!id || !Number.isFinite(cost)) {
          skipped++;
          return [];
        }
        const region = row.Region.trim();
        const data = {
          slug: row.Slug?.trim() || id,
          name: row.Name.trim(),
          type: row.Type.trim(),
          region,
          regionSlug: slugify(region),
          regionCode: row.Code?.trim() || "",
          dataType: row["Data Type"].trim(),
          gb: parseGb(row.Name, row.GBs),
          validityDays: parseInt(row["Validity(Days)"], 10) || 1,
          costUsd: cost,
          coverage: row.Coverage?.trim() || "",
          speed: row.Speed?.trim() || "",
          networks: row["Operator Networks"]?.trim() || "",
          fupPolicy: row["FUP policy"]?.trim() || "",
          topUpType: row["Support TopUp Type"]?.trim() || "",
        };
        const price = computeSellPrice(cost);
        imported++;
        return [
          prisma.plan.upsert({
            where: { id },
            // Keep admin-set prices when re-importing.
            update: overridden.has(id) ? data : { ...data, priceUsd: price },
            create: { id, ...data, priceUsd: price },
          }),
        ];
      })
    );
    console.log(`Processed ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }

  console.log(`Done. Imported/updated ${imported} plans, skipped ${skipped} rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
