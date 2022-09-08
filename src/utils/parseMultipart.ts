import { preValidationAsyncHookHandler } from "fastify";
import { createWriteStream } from "fs";
import path from "path";
import shortid from "shortid";
import { pipeline } from "stream";
import { promisify } from "util";
import { Config } from "../plugins/config";

const pump = promisify(pipeline);

export const parseMultipart: (
  config: Config
) => preValidationAsyncHookHandler = (config: Config) => async (req, reply) => {
  const parts = req.parts();

  const body: any = {};

  for await (const part of parts) {
    if (part.file) {
      const extention = path.extname(part.filename);
      const filename = `${shortid()}${extention}`;
      await pump(
        part.file,
        createWriteStream(path.join(config.UPLOADS_PATH, filename))
      );
      body[part.fieldname] = filename;
    } else {
      body[part.fieldname] = (part as any).value;
    }
  }

  req.body = body;
};
