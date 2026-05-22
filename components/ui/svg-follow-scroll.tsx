"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef, useState } from "react";

const SvgFollowScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Map scroll progress across this exact section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100vw",
        height: "400vh",
        background: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <LinePath scrollYProgress={scrollYProgress} />
    </div>
  );
};

export { SvgFollowScroll };

const ScrollButton = ({ x, y }: { x: number; y: number }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <foreignObject x={x} y={y} width="200" height="60" style={{ overflow: "visible" }}>
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "rgba(246, 156, 64, 0.2)" : "rgba(246, 156, 64, 0.15)",
          border: `1px solid ${hovered ? "rgba(246, 156, 64, 0.5)" : "rgba(246, 156, 64, 0.3)"}`,
          color: "#F69C40",
          padding: "10px 18px",
          borderRadius: "99px",
          fontFamily: "'Outfit', sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          boxShadow: hovered ? "0 4px 20px rgba(246, 156, 64, 0.2)" : "0 4px 14px rgba(0,0,0,0.1)",
          transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
          transform: hovered ? "scale(1.05) translateY(-2px)" : "scale(1) translateY(0)",
          pointerEvents: "auto",
        }}
      >
        {hovered ? "Scroll a bit more" : "Click me!"}
      </button>
    </foreignObject>
  );
};

const LinePath = ({ scrollYProgress }: { scrollYProgress: any }) => {
  // Map the path drawing
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Animate scattered shapes fading in slightly after scroll starts
  const shapesOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

  // This custom bezier path starts top-center (x:500, y:0), 
  // gracefully winds right, then left, looping down towards the bottom left 
  // where it passes at x:166, y:2000 (above the "Schooling" card) and ends at x:500, y:3000
  const mainPath = "M 500 0 C 500 300, 900 400, 900 700 C 900 1000, 100 1100, 100 1400 C 100 1600, 800 1600, 800 1800 C 800 1900, 166 1900, 166 2000 C 166 2200, 800 2300, 800 2600 C 800 2800, 500 2900, 500 3000";
  
  // Secondary ghost paths to make the background look fuller
  const ghostPath1 = "M 480 0 C 470 320, 930 420, 920 720 C 910 1020, 70 1120, 80 1420 C 90 1620, 830 1620, 820 1820 C 810 1920, 140 1920, 136 2000 C 136 2200, 770 2300, 770 2600 C 770 2800, 480 2900, 480 3000";
  const ghostPath2 = "M 520 0 C 530 280, 870 380, 880 680 C 890 980, 130 1080, 120 1380 C 110 1580, 770 1580, 780 1780 C 790 1880, 196 1880, 196 2000 C 196 2200, 830 2300, 830 2600 C 830 2800, 520 2900, 520 3000";

  return (
    <svg
      viewBox="0 0 1000 3000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="mainGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="gradientFlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />   {/* Indigo (starts behind My Journey) */}
          <stop offset="25%" stopColor="#b478ff" />  {/* Purple */}
          <stop offset="50%" stopColor="#F69C40" />  {/* Orange */}
          <stop offset="75%" stopColor="#34d399" />  {/* Emerald */}
          <stop offset="100%" stopColor="#818cf8" /> {/* Indigo (ends at Tech Stack) */}
        </linearGradient>
      </defs>

      {/* ── Background Faint Ghost Paths ── */}
      <path d={mainPath} stroke="rgba(180,120,255,0.06)" strokeWidth="2" strokeLinecap="round" />
      <path d={ghostPath1} stroke="rgba(129,140,248,0.04)" strokeWidth="1" strokeLinecap="round" />
      <path d={ghostPath2} stroke="rgba(246,156,64,0.04)" strokeWidth="1" strokeLinecap="round" />

      {/* ── Main animated glowing stroke ── */}
      <motion.path
        d={mainPath}
        stroke="url(#gradientFlow)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        filter="url(#mainGlow)"
        style={{ pathLength }}
      />

      {/* ── Scattered Decorative Shapes ── */}
      {/* Cluster 1: Top Curve */}
      <motion.ellipse style={{ opacity: shapesOpacity }} cx="600" cy="250" rx="45" ry="25" stroke="rgba(129,140,248,0.15)" strokeWidth="1.5" fill="none" transform="rotate(-15 600 250)" />
      <motion.circle style={{ opacity: shapesOpacity }} cx="850" cy="150" r="30" stroke="rgba(180,120,255,0.12)" strokeWidth="1" fill="none" />
      <motion.circle style={{ opacity: shapesOpacity }} cx="350" cy="350" r="20" stroke="rgba(246,156,64,0.1)" strokeWidth="1" fill="none" />
      
      {/* Cluster 2: Middle Switchback */}
      <motion.ellipse style={{ opacity: shapesOpacity }} cx="250" cy="800" rx="80" ry="30" stroke="rgba(180,120,255,0.1)" strokeWidth="1" fill="none" transform="rotate(10 250 800)" />
      <motion.circle style={{ opacity: shapesOpacity }} cx="750" cy="700" r="50" stroke="rgba(129,140,248,0.08)" strokeWidth="1" fill="none" />
      <motion.circle style={{ opacity: shapesOpacity }} cx="450" cy="950" r="25" stroke="rgba(52,211,153,0.15)" strokeWidth="1" fill="none" />
      
      {/* Cluster 3: Lower Sweep */}
      <motion.ellipse style={{ opacity: shapesOpacity }} cx="550" cy="1200" rx="40" ry="90" stroke="rgba(246,156,64,0.1)" strokeWidth="1.5" fill="none" transform="rotate(-25 550 1200)" />
      <motion.circle style={{ opacity: shapesOpacity }} cx="150" cy="1350" r="35" stroke="rgba(129,140,248,0.12)" strokeWidth="1" fill="none" />
      <motion.circle style={{ opacity: shapesOpacity }} cx="850" cy="1450" r="60" stroke="rgba(180,120,255,0.08)" strokeWidth="1.2" fill="none" />
      
      {/* Cluster 4: Bottom Approach */}
      <motion.ellipse style={{ opacity: shapesOpacity }} cx="700" cy="1750" rx="65" ry="25" stroke="rgba(129,140,248,0.15)" strokeWidth="1" fill="none" transform="rotate(15 700 1750)" />
      <motion.circle style={{ opacity: shapesOpacity }} cx="350" cy="1650" r="40" stroke="rgba(246,156,64,0.1)" strokeWidth="1" fill="none" />
      <motion.circle style={{ opacity: shapesOpacity }} cx="100" cy="1850" r="15" stroke="rgba(180,120,255,0.15)" strokeWidth="1" fill="none" />

      {/* ── Interactive Fun Buttons ── */}
      <ScrollButton x={650} y={850} />
      <ScrollButton x={180} y={1300} />
      <ScrollButton x={600} y={1700} />
      <ScrollButton x={750} y={2450} />

    </svg>
  );
};

