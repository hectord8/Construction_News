import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { users } from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run db:set-admin -- <email>");
  process.exit(1);
}

async function main() {
  const client = postgres(connectionString!, { max: 1 });
  const db = drizzle(client);

  const rows = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.email, email));

  if (!rows.length) {
    console.error(`No user found with email "${email}".`);
    console.error(
      "They must sign in to BuildWire once first so their account exists.",
    );
    process.exit(1);
  }

  const user = rows[0];
  await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
  console.log(`Promoted ${user.email} (${user.name}) to admin.`);

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
