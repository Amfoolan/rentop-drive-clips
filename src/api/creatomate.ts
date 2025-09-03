import { NextRequest } from "next/server";

const CREATOMATE_API_URL = "https://api.creatomate.com/v1/renders";
const CREATOMATE_API_KEY = process.env.CREATOMATE_API_KEY!;

// Template 16/9 avec 10 photos et overlay texte
export async function POST(req: NextRequest) {
  const { images, overlayText } = await req.json();

  // Validation
  if (!images || !Array.isArray(images) || images.length !== 10) {
    return Response.json({ success: false, error: "Il faut exactement 10 images." }, { status: 400 });
  }
  if (!overlayText || typeof overlayText !== "string") {
    return Response.json({ success: false, error: "Texte overlay manquant." }, { status: 400 });
  }

  // Template Creatomate
  const durationPerImage = 2; // 2s par image, total 20s
  const elements = images.map((url: string, idx: number) => ({
    type: "image",
    source: url,
    start: idx * durationPerImage,
    length: durationPerImage,
    fit: "cover",
  }));

  // Overlay texte sur toute la vidéo
  elements.push({
    type: "text",
    text: overlayText,
    start: 0,
    length: images.length * durationPerImage,
    fontFamily: "Montserrat",
    fontSize: 72,
    fillColor: "#fff",
    x: "50%",
    y: "85%",
    anchor: "bottom",
    alignment: "center",
    fontWeight: "bold",
    shadow: true,
    shadowColor: "#000",
    shadowBlur: 12,
    opacity: 0.92,
    zIndex: 2,
  });

  // Payload Creatomate
  const payload = {
    output_format: "mp4",
    width: 1920,
    height: 1080,
    fps: 30,
    elements,
  };

  // 1. Start render
  const startRes = await fetch(CREATOMATE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CREATOMATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const startJson = await startRes.json();
  if (!startRes.ok || !startJson.id) {
    return Response.json({ success: false, error: startJson?.error || "Creatomate error" }, { status: 500 });
  }

  // 2. Poll until finished
  let attempts = 0;
  let statusJson = null;
  while (attempts < 20) {
    await new Promise(res => setTimeout(res, 10000));
    const statusRes = await fetch(`${CREATOMATE_API_URL}/${startJson.id}`, {
      headers: { "Authorization": `Bearer ${CREATOMATE_API_KEY}` },
    });
    statusJson = await statusRes.json();
    if (statusJson.status === "succeeded" && statusJson.url) {
      return Response.json({ success: true, videoUrl: statusJson.url });
    }
    if (statusJson.status === "failed") {
      return Response.json({ success: false, error: "La génération de vidéo a échoué." }, { status: 500 });
    }
    attempts++;
  }
  return Response.json({ success: false, error: "Timeout Creatomate." }, { status: 408 });
}
