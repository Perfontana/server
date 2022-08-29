import { FastifyPluginAsync } from "fastify";
import { Logger } from "pino";
import { Server } from "socket.io";
import { Config } from "../plugins/config";
import { searchSampleRoute } from "./controllers/search";

export const SAMPLES_ROUTE_PREFIX = "/samples";

export const sampleRoutes =
  (config: Config, logger: Logger, io: Server): FastifyPluginAsync =>
  async (app) => {
    app.route(
      searchSampleRoute(config, logger.child({ name: "search-sample" }))
    );
  };
