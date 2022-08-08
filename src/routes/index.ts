import { FastifyPluginAsync } from "fastify";
import { Logger } from "pino";
import { Config } from "../plugins/config";
import { roomRoutes, ROOMS_ROUTE_PREFIX } from "../rooms";
import { SocketServer } from "../socket/Socket";

export const routes =
  (config: Config, logger: Logger, io: SocketServer): FastifyPluginAsync =>
  async (app) => {
    app.register(roomRoutes(config, logger.child({ name: "Rooms" }), io), {
      prefix: ROOMS_ROUTE_PREFIX,
    });
  };
