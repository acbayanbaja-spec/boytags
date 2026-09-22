import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";
import { logger } from "./utils/logger.js";
import { startUnclaimedJob } from "./services/alertService.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Boytag's API listening on ${env.PORT}`);
  startUnclaimedJob(env.UNCLAIMED_CHECK_MS);
});

async function shutdown() {
  logger.info("Shutting down");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
