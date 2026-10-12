import { ImageResponse } from "next/og";

export const alt = "tee-mantraa — Defined by Style.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social-share card (links shared on WhatsApp, Facebook, X, LinkedIn). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F7F7F5", color: "#111", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="150" height="150" viewBox="0 0 48 48" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="22.5" />
            <path d="M22 11 V31 Q22 35.5 27 35.5" />
            <path d="M15 19 H29" />
            <circle cx="33" cy="16" r="1.7" fill="#111" stroke="none" />
          </svg>
          <div style={{ display: "flex", fontSize: 132, letterSpacing: -2 }}>
            <span style={{ fontStyle: "italic" }}>tee</span>
            <span style={{ opacity: 0.45, margin: "0 6px" }}>-</span>
            <span style={{ fontWeight: 700 }}>mantraa</span>
          </div>
        </div>
        <div style={{ marginTop: 28, fontSize: 36, letterSpacing: 10, textTransform: "uppercase", color: "#6B6B6B" }}>Defined by Style.</div>
      </div>
    ),
    { ...size }
  );
}
