import Ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";

export const saveAsMP3 = (
  file: string | Readable | undefined,
  path: string,
  ffmpegPath: string
) => {
  return new Promise((res, rej) => {
    Ffmpeg({ source: file })
      .setFfmpegPath(ffmpegPath)
      .format("mp3")
      .saveToFile(path)
      .on("end", res)
      .on("error", rej);
  });
};
