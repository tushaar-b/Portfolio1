"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { motion, useInView } from "framer-motion";
import Matter from "matter-js";
import { NightStars, NightCloud, NightLamp, NightHills, NightRoad, NightFinish } from './night-scenery';
import './tech-stack.css';
import { siPython, siReact, siNextdotjs, siJavascript, siNodedotjs, siFastapi, siExpress, siTypescript, siSupabase, siPostgresql, siMongodb, siCplusplus, siTensorflow, siFigma, siC, siHtml5, siCss, siGit, siArduino, siRaspberrypi } from "simple-icons";

type TechItem = { id: string; name: string; icon?: { path: string; hex: string }; size: "lg" | "md" | "sm"; copies: number };
const techStack: TechItem[] = [
  { id: "python", name: "Python", icon: siPython, size: "lg", copies: 2 },
  { id: "react", name: "React", icon: siReact, size: "lg", copies: 2 },
  { id: "nextjs", name: "Next.js", icon: siNextdotjs, size: "lg", copies: 2 },
  { id: "javascript", name: "JavaScript", icon: siJavascript, size: "lg", copies: 2 },
  { id: "nodejs", name: "Node.js", icon: siNodedotjs, size: "lg", copies: 2 },
  { id: "fastapi", name: "FastAPI", icon: siFastapi, size: "md", copies: 1 },
  { id: "express", name: "Express", icon: siExpress, size: "md", copies: 1 },
  { id: "typescript", name: "TypeScript", icon: siTypescript, size: "md", copies: 1 },
  { id: "supabase", name: "Supabase", icon: siSupabase, size: "md", copies: 1 },
  { id: "postgresql", name: "PostgreSQL", icon: siPostgresql, size: "md", copies: 1 },
  { id: "mongodb", name: "MongoDB", icon: siMongodb, size: "md", copies: 1 },
  { id: "cplusplus", name: "C++", icon: siCplusplus, size: "md", copies: 1 },
  { id: "tensorflow", name: "TensorFlow", icon: siTensorflow, size: "md", copies: 1 },
  { id: "figma", name: "Figma", icon: siFigma, size: "md", copies: 1 },
  { id: "c", name: "C", icon: siC, size: "sm", copies: 1 },
  { id: "html", name: "HTML", icon: siHtml5, size: "sm", copies: 1 },
  { id: "css", name: "CSS", icon: siCss, size: "sm", copies: 1 },
  { id: "git", name: "Git", icon: siGit, size: "sm", copies: 1 },
  { id: "arduino", name: "Arduino", icon: siArduino, size: "sm", copies: 1 },
  { id: "raspberrypi", name: "Raspberry Pi", icon: siRaspberrypi, size: "sm", copies: 1 },
];
const headingText = "Throw them around!";
const radiusMultipliers = { lg: 1.15, md: 1, sm: 0.85 };
const cargoFloor = (stage: HTMLDivElement, mobile: boolean) => stage.clientHeight - stage.closest<HTMLElement>('.tech-night')!.clientHeight * (mobile ? .12 : .17);

const TechStackSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const roadId = `cargo-road-${useId().replace(/:/g, '')}`;
  const isInView = useInView(sectionRef, { once: true, amount: .3 });

  const engineRef = useRef(Matter.Engine.create());
  const runnerRef = useRef(Matter.Runner.create());
  const [hoveredBall, setHoveredBall] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 639px)").matches);

  useEffect(() => {
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const sync = () => { setReducedMotion(reduceQuery.matches); setMobile(mobileQuery.matches); };
    reduceQuery.addEventListener("change", sync); mobileQuery.addEventListener("change", sync);
    return () => { reduceQuery.removeEventListener("change", sync); mobileQuery.removeEventListener("change", sync); };
  }, []);

  const [bodiesData, setBodiesData] = useState<
    Array<{ id: number; x: number; y: number; angle: number; radius: number; tech: TechItem }>
  >([]);

  // Physics world setup
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = engineRef.current;
    const world = engine.world;
    const runner = runnerRef.current;

    Matter.World.clear(world, false);

    const width = containerRef.current.clientWidth;
    const height = 460;
    const floorY = cargoFloor(containerRef.current, mobile);

    const wallOptions = { isStatic: true, render: { visible: false } };
    const floor     = Matter.Bodies.rectangle(width / 2, floorY + 25, width + 200, 50, wallOptions);
    const leftWall  = Matter.Bodies.rectangle(-25, height / 2, 50, height * 2, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOptions);

    Matter.World.add(world, [floor, leftWall, rightWall]);
    const resize = new ResizeObserver(() => {
      if (containerRef.current) Matter.Body.setPosition(floor, { x: containerRef.current.clientWidth / 2, y: cargoFloor(containerRef.current, mobile) + 25 });
    });
    resize.observe(containerRef.current);
    let animationFrameId = 0;
    let visible = false;
    const updateLoop = () => {
      animationFrameId = 0;
      if (!visible || document.hidden) return;
      const dynamicBodies = Matter.Composite.allBodies(world).filter(
        (b) => b.plugin && b.plugin.tech
      );
      if (dynamicBodies.length) setBodiesData(
        dynamicBodies.map((b) => ({
          id: b.id,
          x: b.position.x,
          y: b.position.y,
          angle: b.angle,
          radius: b.circleRadius!,
          tech: b.plugin.tech,
        }))
      );
      animationFrameId = requestAnimationFrame(updateLoop);
    };
    const syncPhysics = () => {
      cancelAnimationFrame(animationFrameId); Matter.Runner.stop(runner);
      if (visible && !document.hidden && !reducedMotion) { Matter.Runner.run(runner, engine); updateLoop(); }
    };
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPhysics(); });
    visibility.observe(containerRef.current);
    document.addEventListener('visibilitychange', syncPhysics);

    return () => {
      visibility.disconnect(); document.removeEventListener('visibilitychange', syncPhysics);
      resize.disconnect();
      cancelAnimationFrame(animationFrameId);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, [reducedMotion, mobile]);

  // Drop balls when scrolled into view
  useEffect(() => {
    if (isInView && containerRef.current) {
      const width = containerRef.current.clientWidth;
      const engine = engineRef.current;
      const techList = techStack.flatMap(tech => Array.from({ length: tech.copies }, () => tech)).slice(0, mobile ? 24 : undefined);
      const spawned: Matter.Body[] = [];
      let pileX = 0, pileBottom = cargoFloor(containerRef.current, mobile), rowHeight = 0;
      setBodiesData([]); setHoveredBall(null);
      const createBall = (tech: TechItem, index: number) => {
          const radius = 50 * radiusMultipliers[tech.size] * (mobile ? 0.85 : 1);
          if (pileX + radius * 2 > width) { pileX = 0; pileBottom -= rowHeight; rowHeight = 0; }
          const startX = reducedMotion ? pileX + radius : index < Math.ceil(techList.length / 2) ? width / 2 + Math.random() * Math.max(0, width / 2 - radius) : radius + Math.random() * Math.max(0, width - radius * 2);
          const startY = reducedMotion ? pileBottom - radius : -100 - Math.random() * 200;
          pileX += radius * 2; rowHeight = Math.max(rowHeight, radius * 2);
          const ball = Matter.Bodies.circle(startX, startY, radius, {
            restitution: 0.7, friction: 0.008, density: 0.05,
            isStatic: reducedMotion, plugin: { tech },
          });
          if (!reducedMotion) Matter.Body.setVelocity(ball, { x: (Math.random() - 0.5) * 8, y: 0 });
          Matter.World.add(engine.world, ball); spawned.push(ball);
      };
      const timers: ReturnType<typeof setTimeout>[] = [];
      techList.forEach((tech, index) => {
        if (reducedMotion) createBall(tech, index);
        else timers.push(setTimeout(() => createBall(tech, index), index * 40));
      });
      if (reducedMotion) setBodiesData(spawned.map(b => ({ id: b.id, x: b.position.x, y: b.position.y, angle: b.angle, radius: b.circleRadius!, tech: b.plugin.tech })));
      return () => { timers.forEach(clearTimeout); spawned.forEach(ball => Matter.World.remove(engine.world, ball)); };
    }
  }, [isInView, reducedMotion, mobile]);

  // Invisible drag canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "auto";
    canvas.style.zIndex = "10";
    canvas.style.opacity = "0";

    containerRef.current.appendChild(canvas);

    const render = Matter.Render.create({
      canvas,
      engine: engineRef.current,
      options: {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        wireframes: false,
        background: "transparent",
      },
    });

    const mouse = Matter.Mouse.create(render.canvas);
    const showName = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const point = { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
      const hit = Matter.Query.point(Matter.Composite.allBodies(engineRef.current.world).filter(b => b.plugin?.tech), point).pop();
      setHoveredBall(hit?.id ?? null);
    };
    const hideName = (event: PointerEvent) => { if (event.pointerType !== "touch") setHoveredBall(null); };
    canvas.addEventListener("pointermove", showName); canvas.addEventListener("pointerdown", showName); canvas.addEventListener("pointerleave", hideName);
    const mouseConstraint = Matter.MouseConstraint.create(engineRef.current, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });

    if (!reducedMotion) Matter.World.add(engineRef.current.world, mouseConstraint);
    Matter.Render.run(render);
    const resize = new ResizeObserver(() => {
      if (!containerRef.current) return;
      Matter.Render.setSize(render, containerRef.current.clientWidth, containerRef.current.clientHeight);
    });
    resize.observe(containerRef.current);

    return () => {
      Matter.Render.stop(render);
      resize.disconnect();
      canvas.removeEventListener("pointermove", showName); canvas.removeEventListener("pointerdown", showName); canvas.removeEventListener("pointerleave", hideName);
      Matter.World.remove(engineRef.current.world, mouseConstraint);
      Matter.Mouse.clearSourceEvents(mouse);
      canvas.removeEventListener("mousemove", mouse.mousemove);
      canvas.removeEventListener("mousedown", mouse.mousedown);
      canvas.removeEventListener("mouseup", mouse.mouseup);
      canvas.removeEventListener("wheel", mouse.mousewheel);
      canvas.removeEventListener("touchmove", mouse.mousemove);
      canvas.removeEventListener("touchstart", mouse.mousedown);
      canvas.removeEventListener("touchend", mouse.mouseup);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [reducedMotion, mobile]);

  return (
    <section ref={sectionRef} className="tech-night night-scene" aria-labelledby="tech-night-title">
      <div className="tech-night-scenery" aria-hidden="true">
        <svg className="tech-night-sky"><NightStars count={28}/><NightCloud className="tech-night-cloud" x="12%" y="22%" width="180" height="60"/><NightCloud className="tech-night-cloud tech-night-cloud-second" x="70%" y="31%" width="180" height="60"/></svg>
        <svg className="tech-night-hills" viewBox="0 0 1440 200" preserveAspectRatio="none"><NightHills d="M0 90C160 20 320 150 520 80S830 10 1050 90S1310 40 1440 65V200H0Z"/></svg>
        <div className="tech-night-lamp tech-night-lamp-left"><div className="tech-night-glow"/><svg viewBox="-5 -180 80 180"><NightLamp/></svg></div>
        <div className="tech-night-lamp tech-night-lamp-right"><div className="tech-night-glow"/><svg viewBox="-5 -180 80 180"><NightLamp/></svg></div>
        <svg className="tech-night-road" viewBox="0 0 1440 200" preserveAspectRatio="none"><defs><path id={roadId} d="M0 100H1440"/></defs><NightRoad href={`#${roadId}`} width={196}/></svg>
      </div>
      <motion.header className="tech-night-heading"
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        animate={isInView || reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: reducedMotion ? 0 : .6, ease: [0.215, 0.61, 0.355, 1] }}>
        <span className="tech-night-dash" aria-hidden="true"/>
        <h2 id="tech-night-title">MY TECH STACK</h2>
        <p>{headingText}</p>
      </motion.header>

      <div
        ref={containerRef}
        className="tech-cargo-stage"
      >
        {bodiesData.map((b) => (
          <div
            key={b.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: b.radius * 2,
              height: b.radius * 2,
              borderRadius: "50%",
              background: `
                radial-gradient(
                  circle at 30% 30%,
                  #F1EEE6 0%,
                  #F1EEE6 30%,
                  var(--about-mist) 65%,
                  var(--about-skin) 85%,
                  var(--ride-road) 100%
                )
              `,
              boxShadow: `
                0 10px 18px rgba(6,8,22,0.5),
                inset -12px -12px 24px color-mix(in srgb, var(--ride-road) 20%, transparent),
                inset 2px 2px 1px color-mix(in srgb, var(--ride-amber) 28%, transparent),
                inset 10px 10px 20px #F1EEE6
              `,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `translate(${b.x - b.radius}px, ${b.y - b.radius}px) rotate(${b.angle}rad)`,
              pointerEvents: "none",
              willChange: "transform",
              overflow: "hidden",
            }}
          >
            {/* Gloss highlight dot */}
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "20px",
                width: "28px",
                height: "18px",
                borderRadius: "50%",
                background: "#F1EEE6",
                filter: "blur(4px)",
                pointerEvents: "none",
              }}
            />
            {b.tech.icon ? <svg viewBox="0 0 24 24" role="img" aria-label={b.tech.name} style={{ width: "36%", height: "36%", marginBottom: "3px", fill: b.tech.icon.hex === "000000" ? "var(--color-primary)" : `#${b.tech.icon.hex}` }}><path d={b.tech.icon.path}/></svg> : <span style={{ width: "70%", aspectRatio: "1", borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--about-cream)", color: "var(--color-primary)", font: "600 10px 'Outfit', sans-serif", fontVariantCaps: "small-caps", letterSpacing: ".08em", textAlign: "center" }}>{b.tech.name}</span>}
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "10px",
                fontWeight: 800,
                color: "var(--ride-road)",
                letterSpacing: "0.02em",
              }}
            >
              {b.tech.name}
            </span>
          </div>
        ))}
        {bodiesData.filter(b => b.id === hoveredBall).map(b => <div key={`label-${b.id}`} role="status" style={{ position: "absolute", left: b.x, top: b.y - b.radius - 10, transform: "translate(-50%, -100%)", zIndex: 11, pointerEvents: "none", borderRadius: 999, padding: "5px 10px", background: "var(--about-cream)", color: "var(--color-primary)", font: "600 11px 'Outfit', sans-serif", fontVariantCaps: "small-caps", letterSpacing: ".08em", whiteSpace: "nowrap" }}>{b.tech.name}</div>)}
      </div>
      <NightFinish/>
    </section>
  );
};

export { TechStackSection };
