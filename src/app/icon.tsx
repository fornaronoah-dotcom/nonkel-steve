import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Favicon in de stijl van het uithangbord: goud script op antraciet.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const font = await readFile(join(process.cwd(), "src/app/fonts/GreatVibes-Regular.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c2024",
          borderRadius: 14,
          color: "#d2b47a",
          fontFamily: "Great Vibes",
          fontSize: 56,
          paddingTop: 6,
        }}
      >
        S
      </div>
    ),
    { ...size, fonts: [{ name: "Great Vibes", data: font, style: "normal", weight: 400 }] },
  );
}
