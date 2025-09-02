// app/api/generate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { images, audio, title, fps, duration } = await req.json();

    const response = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template: {
          output_format: "mp4",
          width: 1080,
          height: 1920,
          fps: fps || 30,
          elements: [
            // Images en plein écran
            ...images.map((url: string, i: number) => ({
              type: "image",
              source: url,
              duration: duration || 2,
              animations: [
                { type: "zoom", start_scale: 1.1, end_scale: 1.3 },
              ],
            })),
            // Overlay texte
            title
              ? {
                  type: "text",
                  text: title,
                  position: "bottom",
                  font_family: "Arial",
                  font_size: 42,
                  fill_color: "#ffffff",
                }
              : null,
          ].filter(Boolean),
          audio: audio ? { source: audio } : undefined,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Creatomate error" },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: data?.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
