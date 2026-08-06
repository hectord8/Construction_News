import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

declare global {
  var dbGlobal: ReturnType<typeof createClient> | undefined;
}

function createClient() {
  const client = postgres(connectionString!, {
    max: 10,
    idle_timeout: 20,
    onnotice: () => {},
  });
  return drizzle(client, { schema });
}

export const db = globalThis.dbGlobal ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.dbGlobal = db;
}
