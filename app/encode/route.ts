export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { join } from "path";
import { EncodePayloadSchema } from "@/lib/validate";
import { uploadBufferToSupabase } from "@/lib/storage";
import { buildSlideshowCommand } from "@/lib/ffmpeg";

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
      // Download images
      const localImages: string[] = [];
      for (let i = 0; i < data.images.length; i++) {
        const p = join(work, `img_${String(i).padStart(4, "0")}.jpg`);
        await downloadTo(p, data.images[i]);
        localImages.push(p);
      }

      // Download audio if provided
      let audioPath: string | undefined;
      if (data.audio) {
        audioPath = join(work, "audio.mp3");
        await downloadTo(audioPath, data.audio);
      }

      // Create concat file
      const list = localImages
        .map(p => `file '${p.replace(/'/g, "'\\''")}'\nduration ${data.durationPerImage}`)
        .join("\n")
        + `\nfile '${localImages[localImages.length - 1].replace(/'/g, "'\\''")}'`;
      
      const listPath = join(work, "list.txt");
      await writeFile(listPath, list);

      // Encode video
      const outPath = join(work, "out.mp4");
      await new Promise<void>((resolve, reject) => {
        buildSlideshowCommand(listPath, outPath, {
          fps: data.fps,
          width: data.width,
          height: data.height,
          audioPath,
          title: data.title
        })
          .on("error", reject)
          .on("end", () => resolve())
          .run();
      });

      // Upload to Supabase
      const file = await (await fetch("file://" + outPath)).arrayBuffer();
      const key = `clips/${Date.now()}.mp4`;
      const publicUrl = await uploadBufferToSupabase(key, Buffer.from(file), "video/mp4");
      
      return NextResponse.json({ ok: true, url: publicUrl });
    } finally {
      try { 
        await rm(work, { recursive: true, force: true }); 
      } catch {}
    }
  } catch (e: any) {
    console.error("Encode error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}