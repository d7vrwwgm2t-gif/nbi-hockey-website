import { NextResponse } from "next/server";

function getLocalizedName(value: unknown) {
  if (typeof value === "string") return value;

  if (
    value &&
    typeof value === "object" &&
    "default" in value &&
    typeof value.default === "string"
  ) {
    return value.default;
  }

  return "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");

  if (!playerId) {
    return NextResponse.json(
      { success: false, error: "Missing playerId." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api-web.nhle.com/v1/player/${playerId}/landing`,
      {
        cache: "force-cache",
        next: { revalidate: 60 * 60 * 24 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Could not load NHL player bio." },
        { status: response.status }
      );
    }

    const data = await response.json();

    const firstName = getLocalizedName(data.firstName);
    const lastName = getLocalizedName(data.lastName);
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    return NextResponse.json({
      success: true,
      playerId,
      birthDate: data.birthDate ?? null,
      fullName,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not load NHL player bio." },
      { status: 500 }
    );
  }
}
