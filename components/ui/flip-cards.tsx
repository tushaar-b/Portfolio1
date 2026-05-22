import React, { useState } from "react";
import { motion, useInView } from "framer-motion";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  accent: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ front, back, accent }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      style={{
        width: "100%",
        height: "360px",
        cursor: "pointer",
        perspective: "1200px",
        userSelect: "none",
      }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >
        {/* ── FRONT ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: "24px",
            background: "var(--bg-hero)",
            border: `1px solid rgba(0,0,0,0.10)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            padding: "2.5rem 2rem",
            boxShadow: "0 8px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          {/* Accent line at top */}
          <div style={{ width: "48px", height: "3px", borderRadius: "99px", background: accent }} />
          {front}

        </div>

        {/* ── BACK ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: "24px",
            backgroundColor: "var(--bg-hero)",
            backgroundImage: `linear-gradient(135deg, ${accent}18, ${accent}06)`,
            border: `1px solid ${accent}44`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            padding: "2.5rem 2rem",
            boxShadow: `0 8px 40px rgba(0,0,0,0.35), 0 0 60px ${accent}18, inset 0 1px 0 ${accent}22`,
          }}
        >
          <div style={{ width: "48px", height: "3px", borderRadius: "99px", background: accent }} />
          {back}
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Card content helpers ─── */
const FrontLabel = ({ label, sub }: { label: string; sub?: string }) => (
  <div style={{ textAlign: "center" }}>
    {sub && (
      <p style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--color-secondary)",
        marginBottom: "0.6rem",
      }}>{sub}</p>
    )}
    <h3 style={{
      fontFamily: "'Outfit', sans-serif",
      fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)",
      fontWeight: 800,
      color: "var(--color-primary)",
      lineHeight: 1.15,
      letterSpacing: "-0.02em",
      textAlign: "center",
    }}>{label}</h3>
  </div>
);

const BackContent = ({ children, accent }: { children: React.ReactNode; accent: string }) => (
  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.6rem", alignItems: "center" }}>
    {children}
  </div>
);

const Stat = ({ value, accent }: { value: string; accent: string }) => (
  <p style={{
    fontFamily: "'Outfit', sans-serif",
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: 900,
    color: accent,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
  }}>{value}</p>
);

const StatLabel = ({ value }: { value: string }) => (
  <p style={{
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 400,
    color: "var(--color-secondary)",
    lineHeight: 1.5,
  }}>{value}</p>
);

/* ─── Animated card wrapper with scroll reveal ─── */
const AnimatedCard = ({ card, index }: { card: any; index: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-15% 0px -15% 0px" });

  return (
    <motion.div
      ref={ref}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 60 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.23, 1, 0.32, 1] }}
    >
      <FlipCard front={card.front} back={card.back} accent={card.accent} />
    </motion.div>
  );
};

/* ─── Main exported section ─── */
const FlipCardsSection = () => {
  const cardData = [
    {
      accent: "#818cf8",
      sub: "Schooling",
      front: <FrontLabel label="Brain International School" sub="Schooling" />,
      back: (
        <BackContent accent="#818cf8">
          <Stat value="94%" accent="#818cf8" />
          <StatLabel value="Class X" />
          <div style={{ width: "32px", height: "1px", background: "rgba(255,255,255,0.15)", margin: "0.25rem 0" }} />
          <Stat value="96%" accent="#818cf8" />
          <StatLabel value="Class XII" />
        </BackContent>
      ),
    },
    {
      accent: "#F69C40",
      sub: "Higher Education",
      front: <FrontLabel label="B.Tech CSE (Data Science)" sub="Higher Education" />,
      back: (
        <BackContent accent="#F69C40">
          <Stat value="9.3" accent="#F69C40" />
          <StatLabel value="CGPA · VIT Vellore" />
        </BackContent>
      ),
    },
    {
      accent: "#34d399",
      sub: "Experience",
      front: <FrontLabel label="Web Development Intern" sub="Experience" />,
      back: (
        <BackContent accent="#34d399">
          <Stat value="Inamigos" accent="#34d399" />
          <StatLabel value="Foundation" />
        </BackContent>
      ),
    },
  ];

  return (
    <section style={{
      width: "100%",
      minHeight: "100vh",
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2vh 5vw 10vh",
    }}>
      {/* Cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1.5rem",
        width: "100%",
        maxWidth: "1100px",
      }}
        className="flip-cards-grid"
      >
        {cardData.map((card, i) => (
          <AnimatedCard key={i} card={card} index={i} />
        ))}
      </div>

      {/* Quote removed as per request */}
    </section>
  );
};

export { FlipCardsSection };
