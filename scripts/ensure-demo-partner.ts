/**
 * Upsert the mock partner account used for local / staging demos.
 *   npx tsx scripts/ensure-demo-partner.ts
 */
import { prisma } from "../src/lib/db";
import {
  DEMO_PARTNER_EMAIL,
  DEMO_PARTNER_PASSWORD,
  ensureDemoPartner,
} from "../src/lib/partner/ensure-demo";

async function main() {
  const id = await ensureDemoPartner();
  console.log("Demo partner ready:", {
    id,
    email: DEMO_PARTNER_EMAIL,
    password: DEMO_PARTNER_PASSWORD,
    login: "/partner/login",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
