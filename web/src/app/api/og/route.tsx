import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") ?? "Handwerk SaaS";
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "#0b1120",
          padding: 64,
        }}
      >
        <div style={{ color: "#94a3b8", fontSize: 24, marginBottom: 16 }}>Handwerk SaaS</div>
        <div style={{ color: "#fff", fontSize: 72, fontWeight: 600, lineHeight: 1.1 }}>{title}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
