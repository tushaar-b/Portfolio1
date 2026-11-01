"use client";
import React, { useEffect, useRef, useState, useId } from 'react';
import { motion, useInView } from 'framer-motion';
import { NightStars, NightCloud, NightLamp, NightHills, NightRoad, NightFinish } from './night-scenery';
import './tech-stack.css';
import { mobileMode } from '../../src/mobile-mode';

const headingText = 'Throw them around!';
export const TechStackSection = () => {
  const sectionRef = useRef<HTMLElement>(null), stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null), tooltipRef = useRef<HTMLOutputElement>(null);
  const roadId = `cargo-road-${useId().replace(/:/g, '')}`;
  const isInView = useInView(sectionRef, { once: true, amount: .3 });
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [mobile, setMobile] = useState(() => mobileMode || matchMedia('(max-width:639px)').matches);
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)'), phone = matchMedia('(max-width:639px)');
    const sync = () => { setReduced(reduce.matches); setMobile(mobileMode || phone.matches); };
    reduce.addEventListener('change', sync); phone.addEventListener('change', sync);
    return () => { reduce.removeEventListener('change', sync); phone.removeEventListener('change', sync); };
  }, []);
  useEffect(() => {
    let cancelled = false, dispose: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return; observer.disconnect();
      Promise.all([import('./tech-stack-physics'), document.fonts.ready]).then(([{ mountCargo }]) => {
        if (!cancelled && sectionRef.current && stageRef.current && canvasRef.current && tooltipRef.current) dispose = mountCargo(sectionRef.current, stageRef.current, canvasRef.current, tooltipRef.current, reduced);
      });
    }, { rootMargin: '100% 0px' });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { cancelled = true; observer.disconnect(); dispose?.(); };
  }, [reduced, mobile]);
  return <section ref={sectionRef} className="tech-night night-scene" aria-labelledby="tech-night-title">
    <div className="tech-night-scenery" aria-hidden="true">
      <svg className="tech-night-sky"><NightStars count={28}/><NightCloud className="tech-night-cloud" x="12%" y="22%" width="180" height="60"/><NightCloud className="tech-night-cloud tech-night-cloud-second" x="70%" y="31%" width="180" height="60"/></svg>
      <svg className="tech-night-hills" viewBox="0 0 1440 200" preserveAspectRatio="none"><NightHills d="M0 90C160 20 320 150 520 80S830 10 1050 90S1310 40 1440 65V200H0Z"/></svg>
      <div className="tech-night-lamp tech-night-lamp-left"><div className="tech-night-glow"/><svg viewBox="-5 -180 80 180"><NightLamp/></svg></div>
      <div className="tech-night-lamp tech-night-lamp-right"><div className="tech-night-glow"/><svg viewBox="-5 -180 80 180"><NightLamp/></svg></div>
      <svg className="tech-night-road" viewBox="0 0 1440 200" preserveAspectRatio="none"><defs><path id={roadId} d="M0 100H1440"/></defs><NightRoad href={`#${roadId}`} width={196}/></svg>
    </div>
    <motion.header className="tech-night-heading" initial={reduced ? false : { opacity: 0, y: 24 }} animate={isInView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: reduced ? 0 : .6, ease: [.215, .61, .355, 1] }}>
      <span className="tech-night-dash" aria-hidden="true"/><h2 id="tech-night-title">MY TECH STACK</h2><p>{headingText}</p>
    </motion.header>
    <div ref={stageRef} className="tech-cargo-stage"><canvas ref={canvasRef} className="tech-cargo-canvas" role="img" aria-label="Technology balls. Drag and throw them to explore the stack."/><output ref={tooltipRef} className="tech-cargo-tooltip" hidden/></div>
    <NightFinish/>
  </section>;
};
