import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/config/env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Checks whether PostgreSQL persistence is active and configured.
 */
export function isPostgresAuthoritative(): boolean {
  return Boolean(env.databaseUrl);
}

/**
 * Ensures that if running in production runtime, PostgreSQL is configured and cannot fall back silently to memory.
 */
export function assertProductionDatabaseConfigured(): void {
  const isBuildPhase =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build" ||
    process.env.NEXT_RUNTIME === "edge";

  if (process.env.NODE_ENV === "production" && !env.databaseUrl && !isBuildPhase) {
    throw new Error(
      "FATAL: DATABASE_URL is missing in production. PayVia requires authoritative PostgreSQL persistence."
    );
  }
}
