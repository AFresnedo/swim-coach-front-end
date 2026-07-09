import { ImageResponse } from "next/og";

export const alt = "SwimCoach — Improve Your Lap Times & Fitness";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundImage: "linear-gradient(135deg, #0284c7, #06b6d4 55%, #2dd4bf)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -100,
          width: 420,
          height: 420,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -140,
          left: -110,
          width: 380,
          height: 380,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          display: "flex",
        }}
      />
      <div
        style={{
          fontSize: 108,
          fontWeight: 700,
          color: "white",
          letterSpacing: -2,
          display: "flex",
        }}
      >
        SwimCoach
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.92)",
          marginTop: 20,
          display: "flex",
        }}
      >
        Cut seconds off your lap time.
      </div>
    </div>,
    { ...size },
  );
}
