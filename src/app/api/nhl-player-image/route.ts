import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");

  if (!playerId) {
    return NextResponse.json(
      { error: "playerId is required." },
      { status: 400 }
    );
  }

  try {
    const landingResponse = await fetch(
      `https://api-web.nhle.com/v1/player/${playerId}/landing`,
      { cache: "force-cache" }
    );

    if (!landingResponse.ok) {
      throw new Error("Could not load NHL player landing data.");
    }

    const landingData = await landingResponse.json();
    const imageUrl = landingData.heroImage || landingData.headshot;

    if (!imageUrl) {
      throw new Error("No NHL player image found.");
    }

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Could not load NHL player image.");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.redirect(
      new URL("/player-photos/fallback.png", request.url)
    );
  }
}