export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { mkdtemp, writeFile, rm, readFile } from "fs/promises";
import { join } from "path";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { EncodePayloadSchema } from "@/lib/validate";
import { uploadBufferToSupabase } from "@/lib/storage";

ffmpeg.setFfmpegPath(ffmpegPath!);

async function downloadTo(path: string, url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("download failed: " + url);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(path, buf);
}

export async function POST(req: NextRequest) {
  try {
    const data = EncodePayloadSchema.parse(await req.json());

    const work = await mkdtemp(join(tmpdir(), "encode-"));
    try {
      const localImages: string[] = [];
      for (let i = 0; i < data.images.length; i++) {
        const p = join(work, `img_${String(i).padStart(4, "0")}.jpg`);
        await downloadTo(p, data.images[i]);
        localImages.push(p);
      }
      let audioPath: string | undefined;
      if (data.audio) {
        audioPath = join(work, "audio.mp3");
        await downloadTo(audioPath, data.audio);
      }

      const listTxt =
        localImages.map(p => `file '${p.replace(/'/g, "'\\''")}'\nduration ${data.durationPerImage}`).join("\n") +
        `\nfile '${localImages[localImages.length - 1].replace(/'/g, "'\\''")}'`;
      const listPath = join(work, "list.txt");
      await writeFile(listPath, listTxt);

      const outPath = join(work, "out.mp4");

      await new Promise<void>((resolve, reject) => {
        let cmd = ffmpeg()
          .input(listPath)
          .inputOptions(["-f concat", "-safe 0"])
          .videoFilters([
            `scale=${data.width}:${data.height}:force_original_aspect_ratio=decrease`,
            `pad=${data.width}:${data.height}:(ow-iw)/2:(oh-ih)/2`,
            `fps=${data.fps}`
          ])
          .outputOptions([
            "-c:v libx264",
            "-profile:v baseline",
            "-level 3.1",
            "-pix_fmt yuv420p",
            "-preset medium",
            "-crf 23",
            `-g ${data.fps * 2}`,
            "-movflags +faststart"
          ]);

        if (audioPath) cmd = cmd.input(audioPath).audioCodec("aac").audioBitrate("128k");
        else cmd = cmd.outputOptions(["-an"]);

        cmd.on("error", reject).on("end", () => resolve()).save(outPath);
      });

      const fileBuf = await readFile(outPath);
      const key = `clips/${Date.now()}.mp4`;
      const publicUrl = await uploadBufferToSupabase(key, fileBuf, "video/mp4");
      return NextResponse.json({ ok: true, url: publicUrl });
    } finally {
      try { await rm(work, { recursive: true, force: true }); } catch {}
    }
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}