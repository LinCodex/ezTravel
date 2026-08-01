import { PrismaClient } from "@prisma/client";
import path from "path";

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    const envUrl = process.env.DATABASE_URL.trim();
    // If it's already an absolute file: path (e.g. file:D:/... or file:/app/...)
    const filePath = envUrl.replace(/^file:/, "");
    if (path.isAbsolute(filePath)) {
      return envUrl;
    }
    // If it's a remote database (Postgres, MySQL, Cloud SQLite)
    if (envUrl.startsWith("postgresql:") || envUrl.startsWith("mysql:") || envUrl.startsWith("libsql:")) {
      return envUrl;
    }
  }

  // Construct guaranteed absolute file URL to prisma/dev.db from process.cwd()
  const absoluteDbPath = path.resolve(process.cwd(), "prisma", "dev.db");
  const normalized = absoluteDbPath.replace(/\\/g, "/");
  return `file:${normalized}`;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
