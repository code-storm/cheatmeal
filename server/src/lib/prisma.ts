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

function resolvedDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  if (process.env.DATABASE_URL) return resolveLocalFileUrl(process.env.DATABASE_URL);
  return `file:${DEFAULT_LOCAL_DB_PATH}`;
}

function createPooledClient(): PrismaClient {
  const libsql = createClient({
    url: resolvedDatabaseUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
}

// @prisma/adapter-libsql wraps every single query (read or write, in or out
// of a transaction) in an async-mutex acquired on the adapter instance -
// confirmed directly in its source, present in both the version pinned
// here (5.22.0) and the current latest (7.10.1), so it's a deliberate
// design choice, not a bug to wait out via an upgrade. With one adapter
// instance for the whole process, every concurrent request's queries were
// serialized into a single global queue regardless of how fast the
// database itself responded - the actual cause of pages feeling slow to
// load despite each request individually succeeding quickly.
//
// Fix: a small pool of independent PrismaClient+adapter instances, each
// with its OWN mutex, so up to POOL_SIZE queries can genuinely run at
// once. Multiple clients against the same remote Turso database is a
// safe, supported pattern - it's a stateless HTTP client; all real state
// lives server-side in Turso, not in any one client instance.
const POOL_SIZE = 6;
const pool: PrismaClient[] = Array.from({ length: POOL_SIZE }, createPooledClient);

let nextIndex = 0;
export function getPrismaClient(): PrismaClient {
  const client = pool[nextIndex];
  nextIndex = (nextIndex + 1) % POOL_SIZE;
  return client;
}

// Every route/service file in this app does `import { prisma } from
// "../lib/prisma"` once at module load, then calls `prisma.foo.bar()`
// directly - a plain fixed reference to one pool member would funnel
// every request through that same single client again, defeating the
// pool. This Proxy instead resolves to a fresh pool pick on EVERY
// top-level property access, transparently, with no changes needed at
// any of the ~9 existing call sites. For `prisma.$transaction(...)`, the
// property access that starts it is what gets load-balanced; the `tx`
// client passed into the callback is already correctly scoped to
// whichever pool member started that one transaction, so nothing inside
// a transaction callback is affected by this Proxy at all.
//
// Methods are explicitly bound to the real underlying client instance
// (never the Proxy itself) before being returned - Prisma's generated
// client uses JS private fields (#foo) internally, and calling such a
// method with `this` set to anything other than the exact instance that
// declared the field throws "Cannot read private member from an object
// whose class did not declare it." Model delegates (prisma.user,
// prisma.pregnancyProfile, etc.) are plain objects, not functions, and
// are returned as-is - each is already bound to its own real client
// internally, so no further binding is needed for those.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
