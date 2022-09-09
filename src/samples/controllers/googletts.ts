import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import fetch from "node-fetch";
import { Logger } from "pino";
import { URL } from "url";
import { Config } from "../../plugins/config";
import { roomGuard } from "../../utils/roomGuard";
import { YoutubeDownloader } from "../../utils/youtubeDownloader";

const tts = require("google-translate-tts");
import { writeFile } from "fs/promises";
import shortid from "shortid";
import { join } from "path";

const saveFile = async (
  options: { text: string; voice: string },
  filepath: string
) => {
  const buffer = await tts.synthesize(options);

  return writeFile(filepath, buffer);
};

export const googletts = (
  config: Config,
  logger: Logger
): RouteOptions<
  RawServerBase,
  IncomingMessage,
  ServerResponse,
  {
    Body: {
      text: string;
      voice: string;
    };
  }
> => ({
  method: "POST",
  url: "/googletts",
  schema: {},
  preHandler: roomGuard(config, logger),
  handler: async (req) => {
    const file = shortid();

    await saveFile(req.body, join(config.UPLOADS_PATH, file));

    return { name: req.body.text.slice(0, 15), url: `/uploads/${file}` };
  },
});
