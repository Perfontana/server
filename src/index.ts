import pino, { LoggerOptions } from "pino";
import buildApp from "./app";
import { startCleanupJob } from "./jobs/cleanup";
import { loadConfig } from "./plugins/config";
import { loadDatabase } from "./plugins/mongo";

const start = async () => {
  const config = loadConfig();

  const pinoOptions: LoggerOptions = {
    level: config.LOG_LEVEL,
  };

  if (process.env.NODE_ENV !== "production") {
    pinoOptions.transport = { target: "pino-pretty" };
  }

  const logger = pino(pinoOptions);

  await loadDatabase(config, logger);

  const app = await buildApp({
    config,
    logger,
  });

  startCleanupJob(logger, config);

  try {
    await app.ready();
    await app.listen(config.PORT, config.SERVER_URL);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
