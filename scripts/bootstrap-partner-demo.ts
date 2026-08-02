import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.plan.count();
  console.log("plans", plans);
  if (plans === 0) {
    console.log("No plans — run npm run db:seed");
  }
  const partner = await prisma.partner.update({
    where: { email: "demo@partner.test" },
    data: { balanceUsd: 500 },
  });
  console.log("demo balance", partner.balanceUsd);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
