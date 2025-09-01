import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

export function buildSlideshowCommand(
  listPath: string,
  outPath: string,
  opts: { 
    fps: number; 
    width: number; 
    height: number; 
    audioPath?: string; 
    title?: string;
  }
) {
  const vf = [
    `scale=${opts.width}:${opts.height}:force_original_aspect_ratio=decrease`,
    `pad=${opts.width}:${opts.height}:(ow-iw)/2:(oh-ih)/2`,
    `fps=${opts.fps}`
  ];

  let cmd = ffmpeg()
    .input(listPath)
    .inputOptions(["-f concat", "-safe 0"])
    .videoFilters(vf)
    .outputOptions([
      "-c:v libx264",
      "-profile:v baseline", 
      "-level 3.1",
      "-pix_fmt yuv420p",
      "-preset medium",
      "-crf 23",
      `-g ${opts.fps * 2}`,
      "-movflags +faststart"
    ]);

  if (opts.audioPath) {
    cmd = cmd.input(opts.audioPath).audioCodec("aac").audioBitrate("128k");
  } else {
    cmd = cmd.outputOptions(["-an"]);
  }

  return cmd.output(outPath);
}