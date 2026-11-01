import React, { useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  accent: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ front, back, accent }) => {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label="Flip journey card"
      onFocus={() => setFlipped(true)}
      onBlur={() => setFlipped(false)}
      onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped(v => !v); } }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      style={{
        width: "100%",
        height: "clamp(260px, 39vh, 360px)",
        cursor: "pointer",
        perspective: "1200px",
        userSelect: "none",
      }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: reduce ? 0 : 0.55, ease: [0.23, 1, 0.32, 1] }}
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
            borderRadius: "4px",
            background: "var(--about-cream)",
            border: "2px solid var(--about-navy)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            padding: "2.5rem 2rem",
            boxShadow: "3px 3px 0 var(--about-navy)",
          }}
        >
          {/* Accent line at top */}
          <div style={{ width: "48px", height: "3px", borderRadius: "99px", background: "var(--about-amber)" }} />
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
            borderRadius: "4px",
            backgroundColor: "var(--about-skin)",
            backgroundImage: "none",
            border: "2px solid var(--about-navy)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            padding: "2.5rem 2rem",
            boxShadow: "3px 3px 0 var(--about-navy)",
          }}
        >
          <div style={{ width: "48px", height: "3px", borderRadius: "99px", background: "var(--about-amber)" }} />
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
        fontSize: "0.85rem",
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--about-navy)",
        marginBottom: "0.6rem",
      }}>{sub}</p>
    )}
    <h3 style={{
      fontFamily: "var(--about-display)",
      fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)",
      fontWeight: 800,
      color: "var(--about-navy)",
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
    color: "var(--about-navy)",
    lineHeight: 1.5,
  }}>{value}</p>
);

/* ─── Animated card wrapper with scroll reveal ─── */
const AnimatedCard = ({ card, index }: { card: any; index: number }) => {
  const ref = React.useRef(null);
  const reduce = useReducedMotion();
  const isInView = useInView(ref, { once: false, margin: "-15% 0px -15% 0px" });

  return (
    <motion.div
      ref={ref}
      animate={{ opacity: reduce || isInView ? 1 : 0, y: reduce || isInView ? 0 : 24, rotate: reduce || isInView ? 0 : (index % 2 ? 1 : -1) }}
      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : index * 0.1, ease: [0.23, 1, 0.32, 1] }}
    >
      <FlipCard front={card.front} back={card.back} accent={card.accent} />
    </motion.div>
  );
};

/* ─── Main exported section ─── */
const FlipCardsSection = () => {
  const cardData = [
    {
      accent: "#94470A",
      sub: "Schooling",
      front: <FrontLabel label="Brain International School" sub="Schooling" />,
      back: (
        <BackContent accent="#94470A">
          <Stat value="94%" accent="#94470A" />
          <StatLabel value="Class X" />
          <div style={{ width: "32px", height: "1px", background: "var(--about-navy)", margin: "0.25rem 0" }} />
          <Stat value="96%" accent="#94470A" />
          <StatLabel value="Class XII" />
        </BackContent>
      ),
    },
    {
      accent: "#94470A",
      sub: "Higher Education",
      front: <FrontLabel label="B.Tech CSE (Data Science)" sub="Higher Education" />,
      back: (
        <BackContent accent="#94470A">
          <Stat value="9.4" accent="#94470A" />
          <StatLabel value="CGPA · VIT Vellore" />
        </BackContent>
      ),
    },
    {
      accent: "#94470A",
      sub: "Experience",
      front: <FrontLabel label="Web Development Intern" sub="Experience" />,
      back: (
        <BackContent accent="#94470A">
          <Stat value="Inamigos" accent="#94470A" />
          <StatLabel value="Foundation" />
        </BackContent>
      ),
    },
  ];

  return (
    <section style={{
      width: "100%",
      minHeight: "auto",
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2vh 9vw 8vh",
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
