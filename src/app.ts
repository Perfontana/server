import fastify, { FastifyServerOptions } from "fastify";
import cors from "fastify-cors";
import { Logger } from "pino";
import { Config } from "./plugins/config";
import { routes } from "./routes";
import { startSocketServer } from "./socket";
import { addSocketHandlers } from "./socket/rooms";
import { joiValidator } from "./utils/joiValidator";
import { errorHandler } from "./utils/errors";
import fastifyStatic from "fastify-static";
import path from "path";
import fastifySwagger from "@fastify/swagger";
import { swaggerOptions } from "./utils/docs";

interface ApplicationOptions {
  config: Config;
  logger: Logger;
  fastifyOptions?: FastifyServerOptions;
}

const buildApp = async ({
  logger,
  config,
  fastifyOptions,
}: ApplicationOptions) => {
  let app = fastify({ logger, ...fastifyOptions });

  const socketServer = startSocketServer(app);

  addSocketHandlers(config, logger, socketServer);

  app.register(cors);

  await app.register(fastifySwagger, swaggerOptions);

  app.register(fastifyStatic, {
    root: path.join(__dirname, "../uploads"),
    prefix: "/uploads/",
  });

  app.setValidatorCompiler(joiValidator);

  app.setErrorHandler(errorHandler(config, logger));

  app.register(routes(config, logger, socketServer));

  await app.ready();
  await app.swagger();

  return app;
};

export default buildApp;
