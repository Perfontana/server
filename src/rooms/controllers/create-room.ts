import { RawServerBase, RouteOptions } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "pino";
import { RoomDoc } from "../../models/room";
import { Config } from "../../plugins/config";
import { createRoomSchema } from "../rooms.schemas";
import { createRoom } from "../rooms.service";

export const createRoomRoute = (
  config: Config,
  logger: Logger
): RouteOptions<
  RawServerBase,
  IncomingMessage,
  ServerResponse,
  { Body: Partial<RoomDoc> }
> => ({
  method: "POST",
  url: "/",
  schema: {
    description: "Create a room",
    tags: ["room"],
    body: createRoomSchema,
  },
  handler: async (req) => {
    console.log(req.body);

    const room = await createRoom(req.body);

    return room;
  },
});
