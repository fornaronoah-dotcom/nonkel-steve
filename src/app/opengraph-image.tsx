import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Bie Nonkel Steve — frituur in Bredene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const font = await readFile(join(process.cwd(), "src/app/fonts/GreatVibes-Regular.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c2024",
          color: "#f7f3ea",
        }}
      >
        <div style={{ fontFamily: "Great Vibes", fontSize: 150, color: "#d2b47a" }}>Bie nonkel Steve</div>
        <div style={{ width: 520, height: 3, background: "#d2b47a", marginTop: 10 }} />
        <div style={{ fontFamily: "Great Vibes", fontSize: 64, marginTop: 28 }}>Frituur in Bredene</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Great Vibes", data: font, style: "normal", weight: 400 }] },
  );
}
