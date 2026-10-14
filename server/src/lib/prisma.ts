import { PrismaClient } from "@prisma/client";

// Exported singleton PrismaClient instance, shared across the app
// (prevents exhausting SQLite connections / creating multiple clients
// during tsx watch-mode hot reloads).
export const prisma = new PrismaClient();

export default prisma;
