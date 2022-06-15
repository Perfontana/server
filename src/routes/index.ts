import { FastifyPluginAsync } from "fastify";
import { Logger } from "pino";
import { Config } from "../plugins/config";
import { roomRoutes } from "../rooms";
import { SocketServer } from "../socket/Socket";

export const routes =
  (config: Config, logger: Logger, io: SocketServer): FastifyPluginAsync =>
  async (app) => {
    app.register(roomRoutes(config, logger.child({ name: "Rooms" }), io), {
      prefix: "api/v1/rooms",
    });
  };
