import { RawServerBase, RouteOptions } from "fastify";
import { MultipartFile } from "fastify-multipart";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { Logger } from "pino";
import { Room } from "../../models/room";
import { Config } from "../../plugins/config";
import { SocketServer } from "../../socket/Socket";
import { BadRequestError } from "../../utils/errors";
import { getRoomGuardData, roomGuard } from "../../utils/roomGuard";
import { saveAsMP3 } from "../../utils/saveAsMP3";
import { canEndRound, endRound, getTimer } from "../game.service";
import { sendSongHeadersSchema } from "../rooms.schemas";
import { updateSongStatus } from "../rooms.service";

export const sendRoundSong = (
  config: Config,
  logger: Logger,
  io: SocketServer
): RouteOptions<RawServerBase, IncomingMessage, ServerResponse> => ({
  method: "POST",
  url: "/song",
  schema: {
    description: "Send a round song",
    tags: ["game"],
    headers: sendSongHeadersSchema,
  },
  preHandler: roomGuard(config, logger),
  handler: async (req, res) => {
    const { room, player } = getRoomGuardData(req);

    if (room.isEnded) throw new BadRequestError("Game already ended");

    const round = room.rounds[room.currentRound];

    const initialSongAuthor = round.find(
      (round) => round.player === player.name
    )?.song;

    if (room.currentRound > 0) {
      if (!initialSongAuthor) {
        logger.error("Initial song author not found!");
        throw new Error("Unexprected error");
      }

      if (
        room.songs
          .get(initialSongAuthor)!
          .find((song) => song.player === player.name)
      )
        throw new BadRequestError("You already sent a song");
    }

    const data: MultipartFile = await (req as any).file();

    const filename = `${room.code}-round-${room.currentRound}-${
      player.name
    }${path.extname(data.filename)}`;

    const filepath = path.join(config.UPLOADS_PATH, filename);

    await saveAsMP3(data.file, filepath, config.FFMPEG_PATH);

    await Room.updateOne(
      { code: room.code },
      {
        $push: {
          [`songs.${initialSongAuthor || player.name}`]: {
            player: player.name,
            url: `/uploads/${filename}`,
          },
        },
      }
    );

    await updateSongStatus(room, player, true);

    io.to(room.code!).emit("player-ready", { name: player.name });

    const updatedRoom = await Room.findOne({ code: room.code });

    if (canEndRound(updatedRoom!) && getTimer(room.code!) < room.roundTime) {
      logger.debug(`All songs sent before round timeout! Ending now...`);
      io.to(room.code!).emit("round-ended");
      await endRound(room, io, logger);
    }

    return { message: "Sent!" };
  },
});
