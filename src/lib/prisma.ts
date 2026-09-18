import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatasourceUrl() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const tmpDbPath = "/tmp/dev.db";
    const bundledDbPath = path.join(process.cwd(), "dev.db");
    const prismaBundledDbPath = path.join(process.cwd(), "prisma", "dev.db");

    let needCopy = true;
    if (fs.existsSync(tmpDbPath)) {
      try {
        const stat = fs.statSync(tmpDbPath);
        if (stat.size > 0) {
          needCopy = false;
        }
      } catch (e) {
        needCopy = true;
      }
    }

    if (needCopy) {
      try {
        if (fs.existsSync(prismaBundledDbPath)) {
          fs.copyFileSync(prismaBundledDbPath, tmpDbPath);
          console.log("[PRISMA DIAGNOSTIC] Successfully copied prisma/dev.db to /tmp/dev.db");
        } else if (fs.existsSync(bundledDbPath)) {
          fs.copyFileSync(bundledDbPath, tmpDbPath);
          console.log("[PRISMA DIAGNOSTIC] Successfully copied dev.db to /tmp/dev.db");
        } else {
          console.warn("[PRISMA DIAGNOSTIC] Warning: No pre-built SQLite dev.db found in process.cwd()");
        }
      } catch (err) {
        console.error("Failed to copy dev.db to /tmp:", err);
      }
    }
    return `file:${tmpDbPath}`;
  }
  return process.env.DATABASE_URL || "file:./dev.db";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatasourceUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
