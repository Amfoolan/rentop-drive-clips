export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { mkdtemp, writeFile, rm, readFile } from "fs/promises";
import { join } from "path";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { createClient } from "@supabase/supabase-js";

ffmpeg.setFfmpegPath(ffmpegPath!);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BUCKET = "public"; // Assure qu'il est Public (lecture publique)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

async function downloadTo(path: string, url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("download failed: " + url);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(path, buf);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      images: string[];
      audio?: string;
      title?: string;
      fps?: number;
      durationPerImage?: number;
      width?: number;
      height?: number;
    };

    const width = body.width ?? 1080;
    const height = body.height ?? 1920;
    const fps = body.fps ?? 30;
    const dPer = body.durationPerImage ?? 2;

    if (!Array.isArray(body.images) || body.images.length < 2) {
      throw new Error("Provide at least 2 image URLs in 'images'.");
    }

    const work = await mkdtemp(join(tmpdir(), "encode-"));
    try {
      // 1) Télécharger images (+ audio optionnel)
      const localImages: string[] = [];
      for (let i = 0; i < body.images.length; i++) {
        const p = join(work, `img_${String(i).padStart(4, "0")}.jpg`);
        await downloadTo(p, body.images[i]);
        localImages.push(p);
      }
      let audioPath: string | undefined;
      if (body.audio) {
        audioPath = join(work, "audio.mp3");
        await downloadTo(audioPath, body.audio);
      }

      // 2) Fichier concat
      const listTxt =
        localImages.map(p => `file '${p.replace(/'/g, "'\\''")}'\nduration ${dPer}`).join("\n") +
        `\nfile '${localImages[localImages.length - 1].replace(/'/g, "'\\''")}'`;
      const listPath = join(work, "list.txt");
      await writeFile(listPath, listTxt);

      // 3) Encodage MP4
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
            "-profile:v baseline",
            "-level 3.1",
            "-pix_fmt yuv420p",
            "-preset medium",
            "-crf 23",
            `-g ${fps * 2}`,
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

      // 4) Upload Supabase & URL publique
      const buf = await readFile(outPath);
      const key = `clips/${Date.now()}.mp4`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(key, buf, { contentType: "video/mp4", upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
      console.log("ENCODED_MP4_URL", pub.publicUrl);

      return NextResponse.json({ ok: true, url: pub.publicUrl });
    } finally {
      try { await rm(work, { recursive: true, force: true }); } catch {}
    }
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
