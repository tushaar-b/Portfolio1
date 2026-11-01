import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { NightStars, NightCloud, NightHills, NightFinish } from './night-scenery';
import './projects-section.css';

const paperTransition = { type: "spring" as const, stiffness: 300, damping: 20 };
const FolderIcon = ({ reduced }: { reduced: boolean }) => (
  <motion.div className="projects-folder" whileHover={reduced ? undefined : "hover"} initial="initial"
    variants={{ initial: { y: 0 }, hover: { y: -8 } }}>
    <div className="projects-folder-glow" aria-hidden="true"/>
    <svg className="projects-folder-back" viewBox="0 0 260 224" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 220V16Q4 4 16 4H80Q90 4 97 18L103 29H244Q256 29 256 42V208Q256 220 244 220Z" fill="var(--about-burnt)"/>
    </svg>
    {[0, 1].map(i => <motion.div key={i} className={`projects-folder-paper projects-folder-paper-${i}`}
      variants={{ initial: { y: 0, rotate: 0 }, hover: { y: i ? "-18%" : "-12%", rotate: i ? 2 : -3, transition: paperTransition } }}>
      <svg viewBox="0 0 240 180" preserveAspectRatio="none" aria-hidden="true">
        <rect x="3" y="3" width="234" height="174" rx="8" fill="#F1EEE6"/>
        <path d={i ? "M25 28H145M25 45H207" : "M25 23H207M25 40H163"} fill="none" stroke="var(--ride-road)" strokeWidth="2"/>
      </svg>
    </motion.div>)}
    <motion.div className="projects-folder-front"
      variants={{ initial: { rotateX: 0 }, hover: { rotateX: -10, transition: paperTransition } }}>
      <svg viewBox="0 0 260 170" preserveAspectRatio="none" aria-hidden="true">
        <rect x="3" y="3" width="254" height="164" rx="12" fill="var(--ride-amber)"/>
      </svg>
      <span className="projects-folder-tag">Portfolio</span>
    </motion.div>
  </motion.div>
);

export const ProjectsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: .3 });
  const reduced = !!useReducedMotion();
  const visible = inView || reduced;
  const openProjects = () => {
    sessionStorage.setItem('returnTo', 'projects');
    window.dispatchEvent(new CustomEvent("open-projects-page"));
  };
  const entrance = (index: number) => ({
    initial: reduced ? false as const : { opacity: 0, y: 24 },
    animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: reduced ? 0 : .6, delay: reduced ? 0 : index * .04, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] },
  });

  return <section ref={sectionRef} className="projects-night night-scene">
    <div className="projects-night-scenery" aria-hidden="true">
      <svg className="projects-night-stars"><g className="projects-stars-main"><NightStars count={14} twinkle/></g><g className="projects-stars-extra" transform="translate(19 48)"><NightStars count={14} twinkle/></g></svg>
      <svg className="projects-night-clouds"><NightCloud className="projects-cloud" x="14%" y="20%" width="180" height="60"/><NightCloud className="projects-cloud projects-cloud-second" x="73%" y="30%" width="180" height="60"/></svg>
      <svg className="projects-night-hills" viewBox="0 0 1440 200" preserveAspectRatio="none"><NightHills d="M0 90C160 20 320 150 520 80S830 10 1050 90S1310 40 1440 65V200H0Z"/></svg>
    </div>
    <motion.p className="projects-night-label" {...entrance(0)}>Curious?... Check out my</motion.p>
    <div className="projects-word">
      <span className="projects-letters">{Array.from('PR').map((letter, i) => <motion.span key={i} {...entrance(i + 1)}>{letter}</motion.span>)}</span>
      <motion.div className="projects-folder-link" onClick={openProjects}
        initial={reduced ? false : { opacity: 0, scale: .85 }}
        animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: .85 }}
        transition={{ duration: reduced ? 0 : .6, delay: reduced ? 0 : .12, ease: t => 1 + 2.6 * Math.pow(t - 1, 3) + 1.6 * Math.pow(t - 1, 2) }}>
        <FolderIcon reduced={reduced}/>
      </motion.div>
      <span className="projects-letters">{Array.from('JECTS').map((letter, i) => <motion.span key={i} {...entrance(i + 3)}>{letter}</motion.span>)}</span>
    </div>
    <NightFinish/>
  </section>;
};
