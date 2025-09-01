export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { mkdtemp, writeFile, rm, readFile } from "fs/promises";
import { join } from "path";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { createClient } from "@supabase/supabase-js";

ffmpeg.setFfmpegPath(ffmpegPath!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function downloadTo(path: string, url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("download failed: " + url);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(path, buf);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { images, audio, fps = 30, durationPerImage = 2, width = 1080, height = 1920 } = body;

    if (!Array.isArray(images) || images.length < 2) {
      throw new Error("Provide at least 2 image URLs");
    }

    const work = await mkdtemp(join(tmpdir(), "encode-"));
    try {
      const localImages: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const p = join(work, `img_${String(i).padStart(4, "0")}.jpg`);
        await downloadTo(p, images[i]);
        localImages.push(p);
      }

      let audioPath: string | undefined;
      if (audio) {
        audioPath = join(work, "audio.mp3");
        await downloadTo(audioPath, audio);
      }

      const listTxt = localImages
        .map(p => `file '${p}'\nduration ${durationPerImage}`)
        .join("\n") + `\nfile '${localImages[localImages.length - 1]}'`;

      const listPath = join(work, "list.txt");
      await writeFile(listPath, listTxt);

      const outPath = join(work, "out.mp4");

      await new Promise<void>((resolve, reject) => {
        let cmd = ffmpeg()
          .input(listPath)
          .inputOptions(["-f concat", "-safe 0"])
          .videoFilters([
            `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
            `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
            `fps=${fps}`
          ])
          .outputOptions([
            "-c:v libx264",
            "-pix_fmt yuv420p",
            "-movflags +faststart"
          ]);

        if (audioPath) {
          cmd = cmd.input(audioPath).audioCodec("aac").audioBitrate("128k");
        } else {
          cmd = cmd.outputOptions(["-an"]);
        }

        cmd.on("end", () => resolve())
           .on("error", reject)
           .save(outPath);
      });

      const fileBuf = await readFile(outPath);
      const fileName = `clips/${Date.now()}.mp4`;

      const { error } = await supabase.storage
        .from("public")
        .upload(fileName, fileBuf, { contentType: "video/mp4" });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("public").getPublicUrl(fileName);

      return NextResponse.json({ ok: true, url: publicUrl });
    } finally {
      await rm(work, { recursive: true, force: true });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
