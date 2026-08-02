/**
 * Usage:
 *   npx tsx scripts/create-partner.ts email@store.com "Store Name" password123 10001
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/partner/password";
import { stateFromZip } from "../src/lib/tax/us-state-rates";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

async function main() {
  const [email, companyName, password, storeZip] = process.argv.slice(2);
  if (!email || !companyName || !password || !storeZip) {
    console.error('Usage: npx tsx scripts/create-partner.ts email "Company" password zip');
    process.exit(1);
  }
  const baseAlias = slugify(companyName) || "partner";
  let brandAlias = baseAlias;
  let i = 1;
  while (await prisma.partner.findUnique({ where: { brandAlias } })) {
    brandAlias = `${baseAlias}-${i++}`;
  }
  const partner = await prisma.partner.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      companyName,
      contactFirstName: "Partner",
      contactLastName: "Admin",
      storeZip,
      storeState: stateFromZip(storeZip),
      brandName: companyName,
      brandAlias,
      brandEmail: email.toLowerCase(),
      supportEmail: email.toLowerCase(),
    },
  });
  console.log("Created partner", { id: partner.id, email: partner.email, brandAlias: partner.brandAlias });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
