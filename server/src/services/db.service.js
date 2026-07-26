import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// The libSQL client speaks both local file-based SQLite (DATABASE_URL like
// "file:./dev.db", used in local dev) and remote Turso databases
// (DATABASE_URL like "libsql://your-db.turso.io" + DATABASE_AUTH_TOKEN, used
// in production) through the same code path — nothing else in the app needs
// to know or care which one is active.
const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);

// Single shared Prisma client instance for the whole server process.
export const prisma = new PrismaClient({ adapter });
