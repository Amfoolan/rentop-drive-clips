export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { createClient } from "@supabase/supabase-js";

ffmpeg.setFfmpegPath(ffmpegPath!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const work = join("/tmp", "encode-" + Date.now());
    await mkdir(work, { recursive: true });

    // télécharger images
    const images: string[] = data.images;
    const localImages: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const res = await fetch(images[i]);
      const buf = Buffer.from(await res.arrayBuffer());
      const p = join(work, `${i.toString().padStart(4, "0")}.jpg`);
      await writeFile(p, buf);
      localImages.push(p);
    }

    const listFile = join(work, "list.txt");
    await writeFile(
      listFile,
      localImages.map(p => `file '${p}'\nduration ${data.durationPerImage || 2}`).join("\n")
    );

    const outPath = join(work, "out.mp4");

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(["-f concat", "-safe 0"])
        .videoCodec("libx264")
        .outputOptions(["-pix_fmt yuv420p", "-movflags +faststart"])
        .size(`${data.width}x${data.height}`)
        .fps(data.fps || 30)
        .save(outPath)
        .on("end", resolve)
        .on("error", reject);
    });

    const fileBuf = await Bun.file(outPath).arrayBuffer();
    const fileName = `clips/${Date.now()}.mp4`;

    const { data: uploaded, error } = await supabase.storage
      .from("public")
      .upload(fileName, Buffer.from(fileBuf), { contentType: "video/mp4" });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("public")
      .getPublicUrl(fileName);

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
