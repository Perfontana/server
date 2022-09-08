import { Logger } from "pino";
import { Config } from "../plugins/config";

import { scheduleJob } from "node-schedule";
import { Room } from "../models/room";
import { fstat } from "fs";
import { readdir, rm, stat } from "fs/promises";
import { join } from "path";

export const startCleanupJob = (logger: Logger, config: Config) => {
  return scheduleJob(
    config.CLEANUP_JOB_SCHEDULE,
    createCleanupJob(logger, config)
  );
};

const getExpiredDate = (exp: number) => new Date(Date.now() - exp);

const createCleanupJob = (logger: Logger, config: Config) => async () => {
  logger.info("Started cleanup");

  logger.info("Removing old rooms");

  const expiredDate = getExpiredDate(parseInt(config.ROOM_EXPIRE, 10));

  const roomsCleanupResult = await Room.deleteMany({
    $or: [{ createdAt: { $lt: expiredDate } }, { createdAt: null }],
  });

  logger.info(`Deleted ${roomsCleanupResult.deletedCount} rooms.`);

  logger.info("Removing old files");

  let deletedFilesCount = 0;

  deletedFilesCount += await cleanFolder(config.UPLOADS_PATH, expiredDate);
  deletedFilesCount += await cleanFolder(
    join(config.UPLOADS_PATH, "youtube"),
    expiredDate
  );

  logger.info(`Deleted ${deletedFilesCount} files`);
};

const cleanFolder = async (path: string, expiredDate: Date) => {
  const files = await readdir(path, {
    withFileTypes: true,
  });

  let deletedFilesCount = 0;

  for (const file of files) {
    if (file.isDirectory()) continue;

    const filename = join(path, file.name);

    const fileStats = await stat(filename);

    if (fileStats.ctime < expiredDate) {
      await rm(filename);

      deletedFilesCount++;
    }
  }

  return deletedFilesCount;
};
