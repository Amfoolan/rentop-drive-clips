export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { join } from "path";
import { EncodePayloadSchema } from "@/lib/validate";
import { uploadBufferToSupabase } from "@/lib/storage";
import { buildSlideshowCommand } from "@/lib/ffmpeg";

// fetch natif en Node 18+
async function downloadToFile(url: string, path: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path, buf);
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = EncodePayloadSchema.parse(json);

    const workDir = await mkdtemp(join(tmpdir(), "encode-"));
    try {
      const localImages: string[] = [];
      for (let i = 0; i < data.images.length; i++) {
        const p = join(workDir, `img_${String(i).padStart(4, "0")}.jpg`);
        await downloadToFile(data.images[i], p);
        localImages.push(p);
      }

      let audioPath: string | undefined;
      if (data.audio) {
        audioPath = join(workDir, "audio.mp3");
        await downloadToFile(data.audio, audioPath);
      }

      // Fichier concat list pour ffmpeg
      const list = localImages
        .map(p => `file '${p.replace(/'/g, "'\\''")}'\nduration ${data.durationPerImage}`)
        .join("\n")
        + `\nfile '${localImages[localImages.length - 1].replace(/'/g, "'\\''")}'`;
      const listPath = join(workDir, "list.txt");
      await writeFile(listPath, list);

      const outPath = join(workDir, "out.mp4");
      await new Promise<void>((resolve, reject) => {
        buildSlideshowCommand(listPath, outPath, {
          fps: data.fps,
          width: data.width,
          height: data.height,
          audioPath,
          title: data.title
        })
          .on("start", s => console.log("FFmpeg start:", s))
          .on("error", e => reject(e))
          .on("end", () => resolve())
          .run();
      });

      const fileBuf = await (await fetch("file://" + outPath)).arrayBuffer();
      const fileName = `clips/${Date.now()}.mp4`;
      const publicUrl = await uploadBufferToSupabase(fileName, Buffer.from(fileBuf), "video/mp4");

      return NextResponse.json({ ok: true, url: publicUrl });
    } finally {
      try { await rm(workDir, { recursive: true, force: true }); } catch {}
    }
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}