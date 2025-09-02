import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { images, audio, title, fps, durationPerImage } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Aucune image fournie." },
        { status: 400 }
      );
    }

    // Construire la timeline vidéo
    const elements: any[] = [];

    images.forEach((url: string, index: number) => {
      elements.push({
        type: "image",
        track: "video",
        source: url,
        start: index * durationPerImage,
        length: durationPerImage,
        fit: "cover",
      });
    });

    if (title) {
      elements.push({
        type: "text",
        track: "overlay",
        text: title,
        start: 0,
        length: images.length * durationPerImage,
        fontFamily: "Arial",
        fontSize: 48,
        fillColor: "white",
        x: "50%",
        y: "90%",
        textAlign: "center",
      });
    }

    if (audio) {
      elements.push({
        type: "audio",
        track: "audio",
        source: audio,
        start: 0,
      });
    }

    const body = [
      {
        output_format: "mp4",
        width: 1080,
        height: 1920,
        fps: fps || 30,
        elements,
      },
    ];

    const response = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Creatomate API error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, url: data[0].url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
