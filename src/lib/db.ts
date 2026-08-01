import { PrismaClient } from "@prisma/client";

// Ensure DATABASE_URL is always set so Prisma's env("DATABASE_URL") resolves
// correctly, even when .env is absent (e.g. production from git clone).
// Prisma resolves relative file: paths against the schema file location
// (prisma/), so file:./dev.db → prisma/dev.db.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
