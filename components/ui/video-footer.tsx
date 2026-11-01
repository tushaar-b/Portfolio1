import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { NightStars, NightCloud, NightFinish } from './night-scenery';
import { SocialIcon } from './hero-social-rail';
import { socials } from '../../src/socials';
import './video-footer.css';
import { liteMode, mobileMode } from '../../src/mobile-mode';

export const VideoFooter = () => {
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(ref, { once: true, amount: .3 });
  const reduced = !!useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [nearby, setNearby] = useState(false);
  const poster = '/assets/footer-poster.webp';
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearby(true); observer.disconnect(); }
    }, { rootMargin: '100% 0px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (mobileMode || !nearby || !canvasRef.current) return;
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lite = liteMode || device.connection?.saveData || ((device.deviceMemory ?? 8) <= 2) || ((device.hardwareConcurrency || 8) <= 2);
    let cancelled = false;
    let dispose: (() => void) | undefined;
    if (!lite) import('./footer-scene.js').then(({ initFooter3D }) => {
      if (cancelled || !canvasRef.current) return;
      dispose = initFooter3D(canvasRef.current, () => {
        if (cancelled || !canvasRef.current) return;
        setSceneReady(true);
      });
    }).catch(() => { /* The poster remains available when WebGL is unavailable. */ });
    return () => { cancelled = true; dispose?.(); };
  }, [nearby]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copyEmail = async (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(href.slice(7));
      if (timer.current) clearTimeout(timer.current);
      setCopied(true); timer.current = setTimeout(() => setCopied(false), 1800);
    } catch { window.location.href = href; }
  };
  const shown = inView || reduced;
  return <footer ref={ref} className="footer-night night-scene">
    <svg className="footer-stars" aria-hidden="true"><g><NightStars count={13} twinkle/></g><g className="footer-stars-extra" transform="translate(24 54)"><NightStars count={12} twinkle/></g><NightCloud className="footer-cloud" x="17%" y="20%" width="180" height="60"/></svg>
    <div className="footer-floor-glow" aria-hidden="true"/>
    <h1 className="footer-name" aria-label="Tushaar Bharara">{['TUSHAAR', 'BHARARA'].map((word, wi) => <React.Fragment key={word}>{wi > 0 && ' '}<span className="footer-name-word">{Array.from(word).map((letter, i) => <motion.span key={i} aria-hidden="true"
      initial={reduced ? false : { opacity: 0, y: 40 }} animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: reduced ? 0 : .6, delay: reduced ? 0 : (wi * 7 + i) * .03, ease: [0.215, .61, .355, 1] }}>{letter}</motion.span>)}</span></React.Fragment>)}</h1>
    <motion.div className="footer-model"
      initial={reduced ? false : { opacity: 0, scale: .96 }} animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: .96 }}
      transition={{ duration: reduced ? 0 : .8, delay: reduced ? 0 : 1, ease: [0.215, .61, .355, 1] }}
      onAnimationComplete={() => { if (shown && canvasRef.current) canvasRef.current.dataset.monitor = 'on'; }}>
      {(mobileMode || nearby) && <img className={`footer-poster${sceneReady ? ' is-hidden' : ''}`} src={mobileMode ? '/assets/footer-poster-600.webp' : poster} srcSet={mobileMode ? '/assets/footer-poster-600.webp 600w' : '/assets/footer-poster-600.webp 600w, /assets/footer-poster.webp 1200w'} sizes={mobileMode ? 'min(100vw, 480px)' : '(max-width: 639px) 100vw, 72vw'} alt="Character working at a desk" width="1200" height="756" loading="lazy" decoding="async"/>}
      {!mobileMode && <canvas ref={canvasRef} id="footer-canvas" className={sceneReady ? 'is-ready' : ''} data-reduced-motion={String(reduced)} />}
    </motion.div>
    <div className="footer-made"><span className="footer-made-label">Website made using:</span>{['React', 'Vite', 'Framer Motion', 'Three.js', 'Lenis Scroll'].map(item => <span className="footer-made-item" key={item}>{item}</span>)}</div>
    <nav className="footer-socials" aria-label="Footer social links">{socials.map(social => <a key={social.id} href={social.href}
      target={social.id === 'email' ? undefined : '_blank'} rel={social.id === 'email' ? undefined : 'noopener noreferrer'}
      aria-label={social.id === 'email' ? 'Email tushaar.bharara@gmail.com' : `Open ${social.label} profile`}
      title={social.id === 'email' ? social.href.slice(7) : social.label}
      onClick={social.id === 'email' ? event => copyEmail(event, social.href) : undefined}><SocialIcon id={social.id}/>{social.label}</a>)}<span className="footer-copy-toast" role="status" aria-live="polite">{copied ? 'Email copied' : ''}</span></nav>
    <div className="footer-taglines"><span>Aspiring Web Developer 2026</span><span className="footer-available"><i aria-hidden="true"/>Available for Opportunities</span></div>
    <NightFinish/>
  </footer>;
};
