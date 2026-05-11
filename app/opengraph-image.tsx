import { ImageResponse } from "next/og";

// Static OG image for the root URL. Next.js's filesystem convention auto-
// wires this into <meta property="og:image"> and <meta name="twitter:image">.
//
// Deliberately STATIC (no Supabase fetch): keeps render fast, avoids any
// Supabase availability dependency at OG-crawl time, and side-steps cache
// staleness (a fluctuating claim count on a cached OG image looks broken).

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "The Colour Wall — claim a tiny piece of the internet";

export default async function OpengraphImage() {
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
          padding: 80,
          background:
            "radial-gradient(60% 60% at 0% 0%, #ffd9e0 0%, transparent 60%), radial-gradient(60% 60% at 100% 0%, #ffe6cc 0%, transparent 60%), radial-gradient(80% 80% at 50% 100%, #ece1ff 0%, transparent 60%), #fff7f4",
        }}
      >
        {/* Mono eyebrow tag — matches site's MonoTag aesthetic */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(159, 18, 57, 0.85)",
            marginBottom: 56,
            fontFamily: "monospace",
          }}
        >
          [ THE FIRST WALL · 100 × 100 ]
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 104,
            fontWeight: 700,
            color: "#18181b",
            textAlign: "center",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 56,
          }}
        >
          <div>Claim a tiny piece</div>
          <div>
            of the{" "}
            <span style={{ color: "#e11d48", fontStyle: "italic" }}>
              internet
            </span>
            .
          </div>
        </div>

        {/* Footer / URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            color: "#52525b",
          }}
        >
          <span>$1 per square</span>
          <span style={{ color: "#d4d4d8" }}>·</span>
          <span>colour-wall.vercel.app</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
