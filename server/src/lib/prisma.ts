import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Driver adapter, not a raw connection string on the datasource block:
// this lets the same schema/migrations target either a local SQLite file
// (nothing set, local dev) or a remote Turso database (production) just
// by which env vars are present - no separate migration workflow needed
// for either, since both are plain libSQL under the hood.
//
// Local file:// URLs must be resolved to an absolute path ourselves: the
// Prisma CLI resolves a relative DATABASE_URL against prisma/schema.prisma's
// directory, but @libsql/client's createClient resolves file: URLs against
// the process's cwd instead - those two disagree whenever the server isn't
// launched from server/prisma/, silently opening/creating a *different*,
// empty database file instead of erroring.
const DEFAULT_LOCAL_DB_PATH = path.resolve(__dirname, "../../prisma/dev.db");

function resolveLocalFileUrl(url: string): string {
  if (!url.startsWith("file:")) return url;
  const relativePath = url.slice("file:".length);
  const absolutePath = path.resolve(__dirname, "../../prisma", relativePath);
  return `file:${absolutePath}`;
}

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL
    ? process.env.TURSO_DATABASE_URL
    : process.env.DATABASE_URL
      ? resolveLocalFileUrl(process.env.DATABASE_URL)
      : `file:${DEFAULT_LOCAL_DB_PATH}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);

// Exported singleton PrismaClient instance, shared across the app
// (prevents exhausting SQLite connections / creating multiple clients
// during tsx watch-mode hot reloads).
export const prisma = new PrismaClient({ adapter });

export default prisma;
