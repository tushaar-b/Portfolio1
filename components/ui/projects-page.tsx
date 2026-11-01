import React, { useEffect, useLayoutEffect, useState, useRef, useId, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NightStars, NightCloud, NightHills, NightLamp, NightRoad, NightFinish } from './night-scenery';
import './projects-page.css';
import { ProjectImage } from './project-image';
import { setPageMetadata } from '../../src/seo-meta';

// ── Project Data ─────────────────────────────────────────────────────────────
const projects = [
  {
    id: 1,
    title: "Multi-Terrain Disaster-Rescue Rover",
    date: "Sep 2025",
    tags: ["Raspberry Pi", "Arduino Uno", "Computer Vision", "Robotics"],
    image: "/assets/rover.jpg",
    bullets: [
      "Built a rover for navigating disaster zones using Raspberry Pi and Arduino Uno in tandem, capable of operating where conditions are too dangerous for humans.",
      "Integrated sensors to detect invisible fires and terrain instability, expanding operational awareness in hazardous environments.",
      "Configured a live camera feed with real-time object detection, giving operators a clear visual of the rover's surroundings as it moves.",
    ],
  },
  {
    id: 2,
    title: "CAE Laminate Solver",
    date: "Jan 2026",
    tags: ["JavaScript", "AI/ML", "Classical Laminate Theory", "Materials Science"],
    image: null as string | null,
    images: ["/assets/composite-1.png", "/assets/composite-2.png", "/assets/composite-3.png", "/assets/composite-4.png"],
    bullets: [
      "Developed a computational engine for analysing composite materials using Classical Laminate Theory — functionality typically locked behind expensive proprietary software.",
      "Calculates stiffness matrices and material selection indices, enabling engineers to make faster, better-informed design decisions.",
      "Built an AI-driven recommendation layer that suggests optimal materials based on load conditions and environmental factors.",
    ],
  },
  {
    id: 3,
    title: "Mess Management System",
    date: "Mar 2026",
    tags: ["HTML", "CSS", "C++", "UX Design"],
    image: null as string | null,
    images: ["/assets/mess-1.png", "/assets/mess-2.png"],
    bullets: [
      "Identified and solved a practical campus problem: long queues at VIT's paid messes causing students to miss meals.",
      "Designed and built a pre-order system allowing students to schedule meal pickups, eliminating wait times at the counter.",
      "Prioritised a clean, mobile-first UI to keep the student experience front and centre.",
    ],
  },
  {
    id: 4,
    title: "Aarthi AI — Financial Planner & Stock Prediction Platform",
    date: "May 2026",
    tags: ["Python", "FastAPI", "LSTM", "FinBERT", "Three.js", "Chart.js", "GSAP", "yfinance"],
    image: "/assets/aarthi-3.png",
    bullets: [
      "Built an AI-powered financial planning SPA combining empathy-driven UX with a multi-layered ML engine — using LSTM for 5-day stock trajectory prediction and FinBERT for real-time news sentiment analysis to override technical forecasts during breaking events.",
      "Engineered a FastAPI backend computing RSI, MACD, Bollinger Bands, and ATR as a deterministic scoring layer grounding AI predictions in market physics; integrated Google Gemini to translate raw indicators into human-readable, empathetic advice.",
      "Delivered a 3D-accelerated frontend with an interactive globe (Three.js), scroll animations (GSAP), and financial charts (Chart.js); exposed Gymnasium-compatible RL endpoints to enable future reinforcement learning agent training.",
    ],
  },
];

// ── Back Arrow Icon ──────────────────────────────────────────────────────────
const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

// ── Image Slideshow Component ────────────────────────────────────────────────
const ImageSlideshow = ({ images, title }: { images: string[], title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visited, setVisited] = useState(() => new Set([0]));
  useEffect(() => { setVisited(previous => new Set([...previous, currentIndex])); }, [currentIndex]);

  return (
    <div className="detail-carousel" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {images.map((img, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            inset: 0,
            opacity: idx === currentIndex ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
            pointerEvents: idx === currentIndex ? "auto" : "none",
          }}
        >
          {(idx === currentIndex || visited.has(idx)) && <ProjectImage src={img} alt={`${title} ${idx + 1}`} eager={idx === 0}/>}
        </div>
      ))}
      
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            style={{ position: "absolute", top: "50%", left: "10px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", color: "white", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, backdropFilter: "blur(4px)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            style={{ position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", color: "white", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, backdropFilter: "blur(4px)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      {/* Progress Dots */}
      <div style={{ position: "absolute", bottom: "16px", left: "0", right: "0", display: "flex", justifyContent: "center", gap: "8px", zIndex: 10 }}>
        {images.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`detail-carousel-dot${idx === currentIndex ? ' is-active' : ''}`}
            style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: idx === currentIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "background 0.3s ease"
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export const ProjectsPage: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setPageMetadata(visible); }, [visible]);
  const reduced = !!useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const roadId = `detail-road-${useId().replace(/:/g, '')}`;
  const rowReveal = {
    hidden: { opacity: 0, y: 40 },
    shown: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : .6, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] } },
  };
  useEffect(() => {
    if (!visible) return;
    const root = document.getElementById('projects-page-root');
    if (!root) return;
    const update = () => {
      const progress = reduced ? 1 : root.scrollTop / Math.max(1, root.scrollHeight - root.clientHeight);
      if (railRef.current) railRef.current.style.transform = `scaleY(${Math.min(1, Math.max(0, progress))})`;
    };
    const resize = new ResizeObserver(update);
    resize.observe(root); if (root.firstElementChild) resize.observe(root.firstElementChild);
    root.addEventListener('scroll', update, { passive: true }); update();
    return () => { root.removeEventListener('scroll', update); resize.disconnect(); };
  }, [visible, reduced]);

  const handleBack = useCallback(() => {
    history.scrollRestoration = 'manual';
    history.replaceState({ ...history.state, projectsDetail: false }, '', '/#projects');
    setVisible(false);
    const root = document.getElementById('projects-page-root');
    if (root) root.style.display = 'none';
    const app = document.getElementById('app');
    if (app) { app.style.opacity = '0'; app.style.display = ''; }
    window.dispatchEvent(new CustomEvent('close-projects-page'));
  }, []);

  // Register before the lazy chunk signals that it can receive the opening event.
  useLayoutEffect(() => {
    const showPage = () => {
      sessionStorage.setItem('returnTo', 'projects');
      setVisible(true);
      // Scroll projects page back to top every time it opens
      const root = document.getElementById("projects-page-root");
      if (root) {
        root.style.display = "block";
        root.style.overflowY = "scroll";
        // Use requestAnimationFrame to ensure the element is rendered before scrolling
        requestAnimationFrame(() => { root.scrollTop = 0; });
      }
      // Hide the portfolio
      const app = document.getElementById("app");
      if (app) app.style.display = "none";
    };
    const handler = () => {
      history.scrollRestoration = 'manual';
      if (location.pathname.replace(/\/$/, '') === '/projects') history.replaceState({ ...history.state, projectsDetail: true }, '', '/projects');
      else {
        history.replaceState({ ...history.state, projectsDetail: false }, '', '/#projects');
        history.pushState({ ...history.state, projectsDetail: true }, '', '/projects');
      }
      showPage();
    };
    const pop = () => {
      if (location.pathname.replace(/\/$/, '') === '/projects' || (history.state?.projectsDetail && location.hash === '#project-details')) {
        showPage();
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else if (document.getElementById('projects-page-root')?.style.display === 'block') {
        handleBack();
      }
    };
    window.addEventListener("open-projects-page", handler);
    window.addEventListener('projects-page-ready', handler);
    window.addEventListener('popstate', pop);
    return () => { window.removeEventListener("open-projects-page", handler); window.removeEventListener('projects-page-ready', handler); window.removeEventListener('popstate', pop); };
  }, [handleBack]);

  if (!visible) return null;

  return (
    <div data-lenis-prevent className="projects-detail night-scene">
      <div className="detail-night-scenery" aria-hidden="true">
        <svg className="detail-stars"><NightStars count={30} twinkle/></svg>
        <svg className="detail-clouds"><NightCloud className="detail-cloud" x="8%" y="23%" width="180" height="60"/><NightCloud className="detail-cloud detail-cloud-second" x="76%" y="52%" width="180" height="60"/></svg>
      </div>
      <div className="detail-film"><NightFinish/></div>

      {/* ── Sticky top nav ── */}
      <motion.nav
        className="detail-nav"
        initial={reduced ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.4rem 5vw",
          backdropFilter: "blur(20px)",
          background: "var(--bg-hero)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="detail-back-top"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "none",
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: "999px",
            color: "var(--color-primary)",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 500,
            padding: "0.5rem 1.2rem 0.5rem 0.9rem",
            cursor: "pointer",
            letterSpacing: "0.02em",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(0,0,0,0.05)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "var(--color-secondary)";
          }}
        >
          <BackArrow /> Back to Portfolio
        </button>

        {/* Label */}
        <span style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: "1.1rem", color: "var(--color-secondary)" }}>
          Selected Work
        </span>
      </motion.nav>

      {/* ── Page heading ── */}
      <div className="detail-heading" style={{ padding: "6rem 5vw 3rem", maxWidth: "1200px", margin: "0 auto" }}>
        <span className="detail-amber-dash" aria-hidden="true"/>
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.78rem", letterSpacing: "0.2em", color: "var(--color-secondary)", textTransform: "uppercase", marginBottom: "1.2rem" }}
        >
          {projects.length} Projects
        </motion.p>
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.4rem, 5vw, 4.5rem)", fontWeight: 800, fontStyle: "normal", color: "var(--color-primary)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "5rem" }}
        >
          Things I've Built.
        </motion.h1>
      </div>

      {/* ── Projects list ── */}
      <div className="detail-list" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 5vw 10rem" }}>
        <div className="detail-rail" aria-hidden="true"><div ref={railRef} className="detail-rail-fill"/></div>
        {projects.map((project, i) => (
          <motion.article
            key={project.id}
            className="detail-row"
            initial={reduced ? false : 'hidden'}
            whileInView="shown"
            viewport={{ once: true, amount: .25 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "5rem",
              alignItems: "center",
              marginBottom: "10rem",
              direction: i % 2 !== 0 ? "rtl" : "ltr",
            }}
          >
            {/* Image */}
            <motion.div className="detail-image-reveal" variants={rowReveal}>
            <div className="detail-image"
              style={{
                direction: "ltr",
                width: "100%",
                aspectRatio: "16/10",
                borderRadius: "20px",
                background: "rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.07)",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {(project as any).images && (project as any).images.length > 0 ? (
                <ImageSlideshow images={(project as any).images} title={project.title} />
              ) : project.image ? (
                <ProjectImage src={project.image} alt={project.title} priority={i === 0}/>
              ) : (
                <>
                  {/* Placeholder gradient shimmer */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(135deg, rgba(${[
                      "120,80,200", "80,140,220", "60,180,140", "200,120,60"
                    ][i]},0.08) 0%, transparent 70%)`,
                  }} />
                  <div style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                    textAlign: "center",
                  }}>
                    <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2vw, 1.4rem)", color: "rgba(0,0,0,0.25)", marginBottom: "0.5rem" }}>
                      0{project.id}
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(0,0,0,0.25)" }}>
                      Image coming soon
                    </div>
                  </div>
                </>
              )}
              {/* Corner lines */}
            </div>
            </motion.div>

            {/* Content */}
            <motion.div className="detail-content" style={{ direction: "ltr" }} variants={{hidden:rowReveal.hidden,shown:{...rowReveal.shown,transition:{...rowReveal.shown.transition,delay:reduced?0:.1}}}}>
              <div className="detail-meta" data-number={String(project.id).padStart(2,'0')} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.72rem", letterSpacing: "0.18em", color: "var(--color-secondary)", textTransform: "uppercase" }}>
                  Project 0{project.id}
                </span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem", color: "var(--color-secondary)" }}>
                  {project.date}
                </span>
              </div>

              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.1rem, 2vw, 1.6rem)", fontWeight: 700, fontStyle: "normal", color: "var(--color-primary)", lineHeight: 1.25, marginBottom: "1.6rem" }}>
                {project.title}
              </h2>

              <div className="detail-amber-dash" style={{ marginBottom: "1.6rem" }} />

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {project.bullets.map((b, bi) => (
                  <li key={bi} style={{ display: "flex", gap: "0.8rem", fontFamily: "'Outfit', sans-serif", fontSize: "0.88rem", color: "var(--color-secondary)", lineHeight: 1.75 }}>
                    <span style={{ marginTop: "0.55rem", width: "5px", height: "5px", borderRadius: "50%", background: "rgba(0,0,0,0.25)", flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Tags */}
              <div className="detail-tags" style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                {project.tags.map(tag => (
                  <span key={tag} style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    color: "var(--color-secondary)",
                    letterSpacing: "0.05em",
                    padding: "0.28em 0.75em",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "999px",
                    background: "rgba(0,0,0,0.03)",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.article>
        ))}
      </div>

      {/* ── Bottom back button ── */}
      <div className="detail-ending">
        <div className="detail-horizon" aria-hidden="true">
          <svg className="detail-hills" viewBox="0 0 1440 200" preserveAspectRatio="none"><NightHills d="M0 90C160 20 320 150 520 80S830 10 1050 90S1310 40 1440 65V200H0Z"/></svg>
          <div className="detail-lamp"><div className="detail-lamp-glow"/><svg viewBox="-5 -180 80 180"><NightLamp/></svg></div>
          <svg className="detail-road" viewBox="0 0 1440 100" preserveAspectRatio="none"><defs><path id={roadId} d="M0 50H1440"/></defs><NightRoad href={`#${roadId}`}/></svg>
        </div>
        <button
          onClick={handleBack}
          className="detail-back-bottom"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "999px",
            color: "var(--color-secondary)",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.88rem",
            fontWeight: 500,
            padding: "0.75rem 1.8rem 0.75rem 1.4rem",
            cursor: "pointer",
            letterSpacing: "0.02em",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(0,0,0,0.08)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(0,0,0,0.02)";
            e.currentTarget.style.color = "var(--color-secondary)";
          }}
        >
          <BackArrow /> Back to Portfolio
        </button>
      </div>
    </div>
  );
};
