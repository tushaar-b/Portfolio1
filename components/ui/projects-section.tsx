import React from "react";
import { motion } from "framer-motion";

// ── Interactive Folder Component ───────────────────────────────────────────────
const FolderIcon = () => {
  return (
    <motion.div
      whileHover="hover"
      initial="initial"
      style={{
        position: "relative",
        width: "clamp(8rem, 14vw, 18rem)", // reduced width to accommodate 'PROJECTS' text
        aspectRatio: "1.3 / 1",
        cursor: "pointer",
        perspective: "1000px",
        marginTop: "clamp(0.5rem, 2vw, 2rem)", 
      }}
    >
      {/* Back tab */}
      <div style={{
        position: "absolute",
        top: "-12%",
        left: 0,
        width: "35%",
        height: "20%",
        background: "#1e40af", // dark blue
        borderRadius: "16px 16px 0 0",
      }} />

      {/* Back cover */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#1e3a8a", // darker blue
        borderRadius: "0 16px 16px 16px",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.3)"
      }} />

      {/* Back Paper */}
      <motion.div 
        variants={{
          initial: { y: 0, rotate: 0 },
          hover: { y: "-12%", rotate: -3, transition: { type: "spring", stiffness: 300, damping: 20 } }
        }}
        style={{
          position: "absolute",
          top: "4%",
          left: "3%",
          right: "3%",
          height: "90%",
          background: "#e2e8f0",
          borderRadius: "8px 8px 0 0",
          border: "1px solid #cbd5e1",
          display: "flex",
          flexDirection: "column",
          padding: "8%",
          gap: "8%"
        }}
      >
         <div style={{ width: "85%", height: "4px", background: "#ef4444", borderRadius: 4 }} />
         <div style={{ width: "65%", height: "4px", background: "#94a3b8", borderRadius: 4 }} />
         <div style={{ width: "40%", height: "4px", background: "#94a3b8", borderRadius: 4 }} />
      </motion.div>

      {/* Front Paper */}
      <motion.div 
        variants={{
          initial: { y: 0, rotate: 0 },
          hover: { y: "-18%", rotate: 2, transition: { type: "spring", stiffness: 300, damping: 20 } }
        }}
        style={{
          position: "absolute",
          top: "8%",
          left: "3%",
          right: "3%",
          height: "90%",
          background: "#ffffff",
          borderRadius: "8px 8px 0 0",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          padding: "8%",
          gap: "8%",
          boxShadow: "0 -4px 15px rgba(0,0,0,0.05)"
        }}
      >
         <div style={{ width: "50%", height: "4px", background: "#f59e0b", borderRadius: 4 }} />
         <div style={{ width: "80%", height: "4px", background: "#cbd5e1", borderRadius: 4 }} />
         <div style={{ width: "60%", height: "4px", background: "#cbd5e1", borderRadius: 4 }} />
      </motion.div>

      {/* Front cover */}
      <motion.div 
        variants={{
          initial: { rotateX: 0 },
          hover: { rotateX: -10, transition: { type: "spring", stiffness: 300, damping: 20 } }
        }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "85%",
          background: "linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)", // Vibrant blue
          borderRadius: "12px",
          transformOrigin: "bottom center",
          boxShadow: "0 -8px 25px rgba(0,0,0,0.15), 0 15px 25px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          borderLeft: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        {/* Portfolio Badge */}
        <div style={{
          position: "absolute",
          top: "12%",
          left: "6%",
          border: "1.5px solid rgba(255,255,255,0.25)",
          color: "rgba(255,255,255,0.9)",
          padding: "2% 6%",
          borderRadius: "6px",
          fontSize: "clamp(0.6rem, 1.2vw, 0.9rem)",
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 500,
          letterSpacing: "0.05em"
        }}>
          Portfolio
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Section ──────────────────────────────────────────────────────────────────
export const ProjectsSection: React.FC = () => {
  const openProjects = () => {
    window.dispatchEvent(new CustomEvent("open-projects-page"));
  };

  return (
    <section style={{
      width: "100%",
      minHeight: "75vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "10vh 0",
      position: "relative",
      zIndex: 2,
      overflow: "hidden",
    }}>
      {/* Background Ambient Glow removed for flat light theme */}

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
          color: "var(--color-secondary)",
          fontWeight: 600,
          letterSpacing: "0.02em",
          marginBottom: "1rem",
        }}
      >
        Curious?... Check out my
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          lineHeight: 0.8,
          gap: "clamp(1rem, 3vw, 4rem)",
        }}
      >
        {/* PR */}
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(4rem, 12vw, 18rem)", // smaller font size to fit "PROJECTS"
          fontWeight: 800,
          color: "var(--color-primary)",
          userSelect: "none",
          letterSpacing: "-0.04em"
        }}>
          PR
        </span>

        {/* Clickable Folder */}
        <div onClick={openProjects} style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 clamp(-0.5rem, -1vw, -2rem)" }}>
          <FolderIcon />
        </div>

        {/* JECTS */}
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(4rem, 12vw, 18rem)", // smaller font size to fit "PROJECTS"
          fontWeight: 800,
          color: "var(--color-primary)",
          userSelect: "none",
          letterSpacing: "-0.04em"
        }}>
          JECTS
        </span>
      </motion.div>
    </section>
  );
};
