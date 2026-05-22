"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Matter from "matter-js";

// Ball pool — 3 full passes = ~33 balls for maximum density
const BASE_TECHS = [
  { name: "React",      url: "https://cdn.simpleicons.org/react" },
  { name: "Node.js",    url: "https://cdn.simpleicons.org/nodedotjs" },
  { name: "Python",     url: "https://cdn.simpleicons.org/python" },
  { name: "HTML",       url: "https://cdn.simpleicons.org/html5" },
  { name: "CSS",        url: "https://cdn.simpleicons.org/css" },
  { name: "JavaScript", url: "https://cdn.simpleicons.org/javascript" },
  { name: "MongoDB",    url: "https://cdn.simpleicons.org/mongodb" },
  { name: "TensorFlow", url: "https://cdn.simpleicons.org/tensorflow" },
  { name: "C++",        url: "https://cdn.simpleicons.org/cplusplus" },
  { name: "Figma",      url: "https://cdn.simpleicons.org/figma" },
  { name: "Express",    url: "https://cdn.simpleicons.org/express" },
  { name: "C",          url: "https://cdn.simpleicons.org/c" },
];
const techList = [...BASE_TECHS, ...BASE_TECHS, ...BASE_TECHS];

type TechItem = typeof techList[0];

const TechStackSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20% 0px" });

  const engineRef = useRef(Matter.Engine.create());
  const runnerRef = useRef(Matter.Runner.create());

  const [bodiesData, setBodiesData] = useState<
    Array<{ id: number; x: number; y: number; angle: number; tech: TechItem }>
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

    const wallOptions = { isStatic: true, render: { visible: false } };
    const floor     = Matter.Bodies.rectangle(width / 2, height + 25, width + 200, 50, wallOptions);
    const leftWall  = Matter.Bodies.rectangle(-25, height / 2, 50, height * 2, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOptions);

    Matter.World.add(world, [floor, leftWall, rightWall]);
    Matter.Runner.run(runner, engine);

    let animationFrameId: number;
    const updateLoop = () => {
      const dynamicBodies = Matter.Composite.allBodies(world).filter(
        (b) => !b.isStatic && b.plugin && b.plugin.tech
      );
      setBodiesData(
        dynamicBodies.map((b) => ({
          id: b.id,
          x: b.position.x,
          y: b.position.y,
          angle: b.angle,
          tech: b.plugin.tech,
        }))
      );
      animationFrameId = requestAnimationFrame(updateLoop);
    };
    updateLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, []);

  // Drop balls when scrolled into view
  useEffect(() => {
    if (isInView && containerRef.current) {
      const width = containerRef.current.clientWidth;
      const engine = engineRef.current;

      techList.forEach((tech, index) => {
        setTimeout(() => {
          const radius = 50;
          const startX = 70 + Math.random() * (width - 140);

          const ball = Matter.Bodies.circle(startX, -100 - Math.random() * 200, radius, {
            restitution: 0.7,
            friction: 0.008,
            density: 0.05,
            plugin: { tech },
          });

          Matter.Body.setVelocity(ball, {
            x: (Math.random() - 0.5) * 8,
            y: 0,
          });

          Matter.World.add(engine.world, ball);
        }, index * 90);  // tighter stagger → faster fill
      });
    }
  }, [isInView]);

  // Invisible drag canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = containerRef.current.clientWidth;
    canvas.height = 460;
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
        height: 460,
        wireframes: false,
        background: "transparent",
      },
    });

    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engineRef.current, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });

    Matter.World.add(engineRef.current.world, mouseConstraint);
    Matter.Render.run(render);

    return () => {
      Matter.Render.stop(render);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <section
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "15vh 5vw 10vh",
        position: "relative",
        zIndex: 2,
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-10% 0px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(3rem, 6vw, 5rem)",
          fontWeight: 800,
          color: "var(--color-primary)",
          letterSpacing: "-0.01em",
          marginBottom: "2rem",
          textShadow: "none",
          textAlign: "center",
        }}
      >
        MY TECH STACK
      </motion.h2>

      <p
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "1.1rem",
          color: "var(--color-secondary)",
          marginBottom: "3rem",
          textAlign: "center",
        }}
      >
        Throw them around!
      </p>

      <div
        ref={containerRef}
        style={{
          width: "95%",
          maxWidth: "1400px",
          height: "75vh",
          minHeight: "500px",
          position: "relative",
          borderBottom: "1px dashed rgba(255,255,255,0.2)",
          overflow: "visible",
        }}
      >
        {bodiesData.map((b) => (
          <div
            key={b.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: `
                radial-gradient(
                  circle at 30% 30%,
                  #ffffff 0%,
                  #fdfdfd 30%,
                  #e3e3eb 65%,
                  #babcce 90%,
                  #8e92ad 100%
                )
              `,
              boxShadow: `
                0 15px 35px rgba(0,0,0,0.25),
                0 5px 15px rgba(0,0,0,0.15),
                inset -15px -15px 25px rgba(0,0,0,0.15),
                inset 10px 10px 20px rgba(255,255,255,1)
              `,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `translate(${b.x - 50}px, ${b.y - 50}px) rotate(${b.angle}rad)`,
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
                background: "rgba(255,255,255,0.9)",
                filter: "blur(4px)",
                pointerEvents: "none",
              }}
            />
            <img
              src={b.tech.url}
              alt={b.tech.name}
              style={{
                width: "36%",
                height: "36%",
                objectFit: "contain",
                marginBottom: "3px",
                /* Invert icons so they appear dark on white ball */
                filter: "none",
              }}
              draggable={false}
            />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "10px",
                fontWeight: 800,
                color: "rgba(30,20,60,0.85)",
                letterSpacing: "0.02em",
              }}
            >
              {b.tech.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export { TechStackSection };
