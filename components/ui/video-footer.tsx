import React from "react";
import { motion } from "framer-motion";

export const VideoFooter = () => {
  return (
    <footer style={{
      width: "100%",
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#050302", // Dark base
      color: "#ffcda3", // Peach color
      fontFamily: "'Outfit', sans-serif"
    }}>

      {/* Local 3D Scene Background */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}>
        <canvas id="footer-canvas" style={{ width: "100%", height: "100%", display: "block" }}></canvas>
      </div>

      {/* Vignette Overlay for smooth edges and better text readability */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at center, transparent 30%, #050302 100%)",
        zIndex: 2,
        pointerEvents: "none"
      }} />

      {/* Foreground Content */}
      <div style={{
        position: "relative",
        zIndex: 3,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3vw 4vw",
        pointerEvents: "none" // Let clicks pass to the 3D scene if interactive
      }}>
        {/* Top Header Row Removed */}

        {/* Middle Tech Stack Row */}
        <div style={{
          alignSelf: "flex-end",
          textAlign: "right",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          fontSize: "0.85rem",
          fontWeight: 600,
          opacity: 0.9,
          marginTop: "10vh",
          marginRight: "2vw"
        }}>
          <span style={{ opacity: 0.5, marginBottom: "0.5rem", fontWeight: 500 }}>Website made using:</span>
          <span>React</span>
          <span>Vite</span>
          <span>Framer Motion</span>
          <span>Three.js</span>
          <span>Lenis Scroll</span>
        </div>

        {/* Bottom Typography Row */}
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: "auto",
          gap: "2rem"
        }}>
          <div style={{ display: "flex", flexDirection: "column", flexShrink: 1 }}>
            <h1 style={{
              fontSize: "clamp(3rem, 11vw, 15rem)",
              fontWeight: 700,
              lineHeight: 0.8,
              margin: 0,
              letterSpacing: "-0.04em",
              color: "#ffdfc4",
              whiteSpace: "nowrap"
            }}>
              Tushaar
            </h1>
            <span style={{ fontSize: "clamp(0.75rem, 1.5vw, 1rem)", opacity: 0.8, marginTop: "1rem", fontWeight: 500 }}>
              Aspiring Web Developer 2026
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 1 }}>
            <h1 style={{
              fontSize: "clamp(3rem, 11vw, 15rem)",
              fontWeight: 700,
              lineHeight: 0.8,
              margin: 0,
              letterSpacing: "-0.04em",
              color: "#ffdfc4",
              whiteSpace: "nowrap"
            }}>
              Bharara
            </h1>
            <span style={{ fontSize: "clamp(0.75rem, 1.5vw, 1rem)", opacity: 0.8, marginTop: "1rem", fontWeight: 500 }}>
              Available for Opportunities
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
