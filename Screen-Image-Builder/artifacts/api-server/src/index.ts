import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "shackirzianov@gmail.com";

async function ensureAdminUser() {
  try {
    const result = await db
      .update(usersTable)
      .set({ isAdmin: true })
      .where(eq(usersTable.email, ADMIN_EMAIL));
    logger.info({ email: ADMIN_EMAIL }, "Admin user ensured");
  } catch (err) {
    logger.warn({ err }, "Could not ensure admin user (user may not exist yet)");
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await ensureAdminUser();
});
