import { PrismaClient } from "@prisma/client";

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL?.trim() || "";
  if (!envUrl) {
    throw new Error(
      "DATABASE_URL is not set. For local + Vercel, create a free Neon DB in the Vercel dashboard (Storage → Neon) and paste the connection string into .env and Vercel env vars.",
    );
  }
  if (envUrl.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL is still a SQLite file URL. This app now uses Postgres. In Vercel: Storage → Create Database (Neon). Copy DATABASE_URL into your local .env too.",
    );
  }
  return envUrl;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
