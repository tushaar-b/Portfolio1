import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const GoodDesignSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Slide horizontally as we scroll
  // Line 1 comes from left to right
  const x1 = useTransform(scrollYProgress, [0, 1], ["-15vw", "5vw"]);
  
  // Line 2 comes from right to left
  const x2 = useTransform(scrollYProgress, [0, 1], ["15vw", "-5vw"]);
  
  const opacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);

  return (
    <section 
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "var(--bg-hero)", // Light theme background
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "15vh 0vw",
      }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: "1400px", zIndex: 2 }}>
        
        {/* Line 1 */}
        <motion.div 
          style={{ 
            x: x1, 
            textAlign: "left",
            paddingLeft: "5%"
          }}
        >
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(4.5rem, 14vw, 12rem)",
            fontWeight: 800,
            lineHeight: 0.85,
            color: "var(--color-primary)", // Black/dark
            letterSpacing: "-0.02em",
            margin: 0,
          }}>
            Great things
          </h2>
        </motion.div>

        {/* Line 2 */}
        <motion.div 
          style={{ 
            x: x2, 
            textAlign: "right",
            paddingRight: "5%",
            marginTop: "1%",
          }}
        >
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(4.5rem, 14vw, 12rem)",
            fontWeight: 800,
            lineHeight: 0.85,
            color: "rgba(7, 4, 15, 0.5)", // Transparent dark for depth
            letterSpacing: "-0.02em",
            margin: 0,
          }}>
            take focus
          </h2>
        </motion.div>

        {/* Line 3 */}
        <motion.div 
          style={{ 
            opacity, 
            textAlign: "center",
            marginTop: "15vh"
          }}
        >
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(1.2rem, 3vw, 2.2rem)",
            fontWeight: 700,
            color: "var(--color-secondary)", // Medium grey
            letterSpacing: "-0.02em",
            margin: 0,
          }}>
            and I build them to last
          </p>
        </motion.div>

      </div>

      {/* Ambient lighting effect */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "60vw",
          height: "60vw",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(234, 88, 12, 0.05) 0%, transparent 60%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    </section>
  );
};
