import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { images, audio, title, fps, duration } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Aucune image fournie." },
        { status: 400 }
      );
    }

    // Payload Creatomate
    const payload = {
      output_format: "mp4",
      modifications: [
        ...images.map((url: string, i: number) => ({
          name: `image${i + 1}`,
          image_url: url,
          duration: duration || 2,
        })),
        title
          ? {
              name: "title",
              text: title,
            }
          : null,
        audio
          ? {
              name: "audio",
              audio_url: audio,
            }
          : null,
      ].filter(Boolean),
      framerate: fps || 30,
      width: 1080,
      height: 1920,
    };

    // Appel API Creatomate
    const res = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Erreur API Creatomate" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
