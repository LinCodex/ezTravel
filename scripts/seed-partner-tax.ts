import { PrismaClient } from "@prisma/client";
import { STATE_TAX_RATES } from "../src/lib/tax/us-state-rates";

const prisma = new PrismaClient();

async function main() {
  for (const [stateCode, info] of Object.entries(STATE_TAX_RATES)) {
    await prisma.stateTaxRate.upsert({
      where: { stateCode },
      create: { stateCode, stateName: info.name, rate: info.rate },
      update: { stateName: info.name, rate: info.rate },
    });
  }
  console.log(`Seeded ${Object.keys(STATE_TAX_RATES).length} state tax rates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
