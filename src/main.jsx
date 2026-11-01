import { installJourneyDebug } from '../components/ui/journey-debug';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import Lenis from 'lenis';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { JourneyRide } from '../components/ui/journey-ride.tsx';
import { TechStackSection } from '../components/ui/tech-stack.tsx';
import { ProjectsSection } from '../components/ui/projects-section.tsx';
import { ProjectsPage } from '../components/ui/projects-page.tsx';
import { GoodDesignSection } from '../components/ui/good-design-section.tsx';
import { VideoFooter } from '../components/ui/video-footer.tsx';
import { AboutStage } from '../components/ui/about-stage.jsx';
import { WavingCharacter } from '../components/ui/waving-character.tsx';
import { HeroSocialRail } from '../components/ui/hero-social-rail.tsx';
import './hero-visuals.css';

const projectsReturnOnLoad = location.hash === '#projects' || sessionStorage.getItem('returnTo') === 'projects';
if (projectsReturnOnLoad) {
  history.scrollRestoration = 'manual';
  const app = document.getElementById('app');
  if (app) app.style.opacity = '0';
}

// Every React root is disposed with the vanilla entrypoint during HMR.
const mountedRoots = [];
const createAppRoot = node => {
  const root = ReactDOM.createRoot(node); mountedRoots.push(root); return root;
};
const avatarRoot = document.getElementById('avatar-root') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'avatar-root' }));
const characterRoot = document.getElementById('character-root');
const heroSocialRoot = document.getElementById('hero-social-root');
if (heroSocialRoot) createAppRoot(heroSocialRoot).render(<HeroSocialRail />);
if (characterRoot) {
  createAppRoot(characterRoot).render(<React.StrictMode><WavingCharacter size="100%" className="hero-character" /></React.StrictMode>);
}


const aboutRoot = document.getElementById('about-root');
if (aboutRoot) createAppRoot(aboutRoot).render(<React.StrictMode><AboutStage /></React.StrictMode>);

// ─── Render MY JOURNEY section ───────────────────────────────────────────────
const journeyRoot = document.getElementById('journey-root');
if (journeyRoot) {
  createAppRoot(journeyRoot).render(
    <React.StrictMode>
      <JourneyRide vehicle="auto" />
    </React.StrictMode>
  );
}

// ─── Render Tech Stack Section ───────────────────────────────────────────────
const techStackRoot = document.getElementById('tech-stack-root');
if (techStackRoot) {
  createAppRoot(techStackRoot).render(
    <React.StrictMode>
      <TechStackSection />
    </React.StrictMode>
  );
}

// ─── Render Projects Section (big title in portfolio) ───────────────────────────
const projectsRoot = document.getElementById('projects-root');
if (projectsRoot) {
  createAppRoot(projectsRoot).render(
    <React.StrictMode>
      <ProjectsSection />
    </React.StrictMode>
  );
}

// ─── Render Projects Page (fully independent, outside #app) ───────────────────────
const projectsPageRoot = document.getElementById('projects-page-root');
if (projectsPageRoot) {
  createAppRoot(projectsPageRoot).render(
    <React.StrictMode>
      <ProjectsPage />
    </React.StrictMode>
  );
}

// ─── Render Good Design Section ─────────────────────────────────────────────
const goodDesignRoot = document.getElementById('good-design-root');
if (goodDesignRoot) {
  createAppRoot(goodDesignRoot).render(
    <React.StrictMode>
      <GoodDesignSection />
    </React.StrictMode>
  );
}

// ─── Render Video Footer ──────────────────────────────────────────────────
const videoFooterRoot = document.getElementById('video-footer-root');
if (videoFooterRoot) {
  createAppRoot(videoFooterRoot).render(
    <React.StrictMode>
      <VideoFooter />
    </React.StrictMode>
  );
}

// ─── Lenis Smooth Scroll ───────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

// One delegated anchor handler shares the one Lenis instance. About is a beat
// within the master pin, so its navigation target is a timeline coordinate.
const handleAnchorClick = event => {
  const anchor = event.target.closest?.('a[href^="#"]');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href.length < 2) return;
  const target = document.querySelector(href);
  if (!target) return;
  event.preventDefault();
  const story = ScrollTrigger.getById('hero-journey');
  const destination = href === '#about' && story?.animation && !reducedMotion.matches
    ? story.start + (story.end - story.start) * story.animation.labels['beat-a'] / story.animation.duration()
    : target;
  lenis.scrollTo(destination, { duration: 1.2, force: true });
};
document.addEventListener('click', handleAnchorClick);

// Restore the folder only after fonts and both pinned scenes have their geometry.
let projectsLanding = null;
const landAtProjects = () => {
  if (projectsLanding) return projectsLanding;
  history.scrollRestoration = 'manual';
  const app = document.getElementById('app');
  if (app) { app.getAnimations().filter(animation => animation.id === 'projects-return').forEach(animation => animation.cancel()); app.style.opacity = '0'; }
  projectsLanding = (async () => {
    await document.fonts.ready;
    await new Promise(resolve => {
      const ready = () => {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const heroReady = reduced || !document.getElementById('character-root') || ScrollTrigger.getById('hero-journey');
        const rideReady = reduced || !document.getElementById('journey-root') || ScrollTrigger.getById('journey-ride');
        if (heroReady && rideReady) resolve();
        else requestAnimationFrame(ready);
      };
      requestAnimationFrame(ready);
    });
    ScrollTrigger.refresh();
    lenis.resize();
    const target = document.getElementById('projects');
    lenis.scrollTo(target ? '#projects' : 0, { immediate: true, force: true });
    ScrollTrigger.update();
    const landingY = window.scrollY;
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.end <= landingY) {
        trigger.getTween()?.progress(1);
        trigger.animation?.totalProgress(1);
      }
    });
    sessionStorage.removeItem('returnTo');
    history.replaceState({ ...history.state, projectsDetail: false }, '', '/#projects');
    if (app) {
      app.style.opacity = '';
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) app.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, id: 'projects-return' });
    }
  })().finally(() => { projectsLanding = null; });
  return projectsLanding;
};

// Other initial anchors retain their existing behavior.
if (projectsReturnOnLoad) {
  landAtProjects();
} else if (window.location.hash) {
  setTimeout(() => {
    const target = document.querySelector(window.location.hash);
    if (target) {
      lenis.scrollTo(target, { immediate: true });
    }
  }, 100);
}

// Stop Lenis when projects page opens so its scroll works freely.
// Also override the .lenis-stopped { overflow: hidden } rule that Lenis
// applies to <html> — without this the fixed overlay cannot scroll.
window.addEventListener('open-projects-page', () => {
  // lenis.stop() is removed because it eats wheel events and prevents native scroll
  // Instead we rely on data-lenis-prevent in the ProjectsPage
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
});
const closeProjectsPage = () => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  landAtProjects();
};
const restoreProjectsHistory = () => {
  if (location.hash === '#projects') queueMicrotask(() => {
    if (document.getElementById('app')?.style.display !== 'none') landAtProjects();
  });
};
window.addEventListener('close-projects-page', closeProjectsPage);
window.addEventListener('popstate', restoreProjectsHistory);
window.addEventListener('hashchange', restoreProjectsHistory);

// The root mascot and hero share one scrubbed journey controller.
const sayHi = () => {
  const contact = document.querySelector('#contact, [data-contact], #video-footer-root');
  lenis.scrollTo(contact || 0, { immediate: reducedMotion.matches, duration: 1.2, force: true });
};
window.addEventListener('journey-contact', sayHi);

lenis.on('scroll', ScrollTrigger.update);
const rafLenis = time => lenis.raf(time * 1000);
gsap.ticker.add(rafLenis);
gsap.ticker.lagSmoothing(0);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const syncScrollMotion = () => { lenis.options.smoothWheel = !reducedMotion.matches; };
reducedMotion.addEventListener('change', syncScrollMotion);
syncScrollMotion();

window.addEventListener('scroll', () => {
  document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 50);
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  document.querySelectorAll('.text-reveal').forEach(el => {
    el.classList.toggle('in-view', progress > 0.28);
  });
}, { passive: true });

// ─── Interactive Particle Text — Manifesto Section ──────────────────────────
const initManifestoParticles = () => {
  const section       = document.querySelector('.manifesto-section');
  const textContainer = section?.querySelector('.about-content');
  if (!section) return;

  // ── Create canvas ──────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.id    = 'manifesto-particle-canvas';
  section.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  // ── Config ─────────────────────────────────────────────────────────────────
  const FORCE   = 90;          // repulsion force
  const DENSITY = Math.round(4 * DPR); // sample every Nth physical pixel
  const RADIUS  = 180 * DPR;  // interaction radius in physical px
  
  const PALETTE = [
    [212, 255, 0],    // Lime Green
    [37, 99, 235],    // Vivid Blue
    [17, 17, 17],     // Black
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  let particles = [];
  let ptr       = { x: undefined, y: undefined };
  let hasPtr    = false;
  let frameId   = null;
  let active    = false;   // only animate when section is visible
  let isAssembling = false;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const rand  = (max, min = 0) => min + Math.random() * (max - min);
  const clamp = (v, lo, hi)   => Math.max(lo, Math.min(hi, v));

  // ── Particle class ─────────────────────────────────────────────────────────
  function Particle(x, y, r, g, b) {
    this.ox = x; this.oy = y;
    this.cx = x; this.cy = y;
    this.or = rand(3.5 * DPR, 0.8 * DPR); // radius scales with DPR
    this.f  = rand(FORCE + 22, FORCE - 22);
    this.r  = clamp(r + rand(18, -12), 0, 255);
    this.g  = clamp(g + rand(18, -12), 0, 255);
    this.b  = clamp(b + rand(18, -12), 0, 255);
  }

  Particle.prototype.draw = function () {
    ctx.fillStyle = `rgb(${this.r | 0},${this.g | 0},${this.b | 0})`;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.or, 0, Math.PI * 2);
    ctx.fill();
  };

  Particle.prototype.move = function () {
    // Repel from cursor
    if (hasPtr && ptr.x !== undefined) {
      const dx = this.cx - ptr.x;
      const dy = this.cy - ptr.y;
      const d  = Math.hypot(dx, dy);
      if (d < RADIUS && d > 0) {
        const force = Math.min(this.f, (RADIUS - d) / d * 2);
        this.cx += (dx / d) * force;
        this.cy += (dy / d) * force;
      }
    }
    // Restore toward origin
    const dx = this.ox - this.cx;
    const dy = this.oy - this.cy;
    const d  = Math.hypot(dx, dy);
    if (d > 0.5) {
      // During entry assembly, move faster without a strict speed cap
      const speed = isAssembling ? (d * 0.08) : Math.min(d * 0.09, 4 * DPR);
      this.cx += (dx / d) * speed;
      this.cy += (dy / d) * speed;
    }
    this.draw();
  };

  // ── Build particle array from rendered text ────────────────────────────────
  const build = () => {
    const W = canvas.width;
    const H = canvas.height;

    // Font sizes matching CSS clamp() — scaled to physical pixels
    const cssW = W / DPR;
    const cssH = H / DPR;
    const lfs  = clamp(0.09 * cssW, 64, 135) * DPR;
    const sfs  = clamp(0.08 * cssW, 56, 115) * DPR;
    const gap  = clamp(0.035 * cssH, 20, 52) * DPR;

    const lines = [
      { t: 'Passionate',         fs: lfs },
      { t: 'about building',     fs: lfs },
      { t: 'things that matter', fs: sfs },
    ];

    const totalH = lines.reduce((s, l) => s + l.fs, 0) + gap * (lines.length - 1);
    let y = (H - totalH) / 2;

    ctx.clearRect(0, 0, W, H);

    // Diagonal gradient across the text block
    const grad = ctx.createLinearGradient(W * 0.1, y, W * 0.9, y + totalH);
    PALETTE.forEach(([r, g, b], i) => {
      grad.addColorStop(i / (PALETTE.length - 1), `rgb(${r},${g},${b})`);
    });

    lines.forEach(line => {
      ctx.font         = `900 ${line.fs}px 'Outfit', sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle    = grad;
      ctx.fillText(line.t, W / 2, y);
      y += line.fs + gap;
    });

    // Sample rendered pixels → particles
    const data = ctx.getImageData(0, 0, W, H).data;
    particles  = [];
    for (let py = 0; py < H; py += DENSITY) {
      for (let px = 0; px < W; px += DENSITY) {
        const i = (py * W + px) * 4;
        if (data[i + 3] > 110) {
          particles.push(new Particle(px, py, data[i], data[i + 1], data[i + 2]));
        }
      }
    }

    // Clear temp render and draw initial particle state
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => p.draw());
  };

  // ── Entry Scatter Trigger ──────────────────────────────────────────────────
  const triggerAssemble = () => {
    isAssembling = true;
    const W = canvas.width;
    const H = canvas.height;
    particles.forEach(p => {
      const angle = Math.random() * Math.PI * 2;
      // Scatter them widely outwards
      const dist = rand(Math.max(W, H) * 0.45, Math.max(W, H) * 0.15);
      p.cx = p.ox + Math.cos(angle) * dist;
      p.cy = p.oy + Math.sin(angle) * dist;
    });
  };

  // ── Animation loop ─────────────────────────────────────────────────────────
  const tick = () => {
    if (!active) { frameId = null; return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let maxDist = 0;
    particles.forEach(p => {
      p.move();
      if (isAssembling) {
        const d = Math.hypot(p.ox - p.cx, p.oy - p.cy);
        if (d > maxDist) maxDist = d;
      }
    });

    if (isAssembling && maxDist < 2.5 * DPR) {
      isAssembling = false;
    }

    frameId = requestAnimationFrame(tick);
  };

  const startTick = () => {
    if (frameId) return;
    active  = true;
    triggerAssemble();
    frameId = requestAnimationFrame(tick);
  };

  const stopTick = () => {
    active = false;
    if (frameId) { cancelAnimationFrame(frameId); frameId = null; }
  };

  // ── Resize — rebuild on every size change ──────────────────────────────────
  const resize = () => {
    stopTick();
    canvas.style.width  = section.offsetWidth  + 'px';
    canvas.style.height = section.offsetHeight + 'px';
    canvas.width  = Math.round(section.offsetWidth  * DPR);
    canvas.height = Math.round(section.offsetHeight * DPR);
    build();
    if (active !== false) startTick();
  };

  // Wait for Outfit font before first build
  document.fonts.ready.then(() => {
    // Hide the HTML text — canvas is now the visual
    if (textContainer) textContainer.style.visibility = 'hidden';
    resize();
    window.addEventListener('resize', resize, { passive: true });
  });

  // ── IntersectionObserver — pause when scrolled away ───────────────────────
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) startTick();
      else stopTick();
    });
  }, { threshold: 0.05 });
  io.observe(section);

  // ── Pointer events ─────────────────────────────────────────────────────────
  canvas.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    ptr.x  = (e.clientX - rect.left)  * DPR;
    ptr.y  = (e.clientY - rect.top)   * DPR;
    hasPtr = true;
  }, { passive: true });

  canvas.addEventListener('pointerleave', () => {
    hasPtr = false;
    ptr.x  = undefined;
    ptr.y  = undefined;
  }, { passive: true });

  canvas.addEventListener('pointerenter', () => { hasPtr = true; }, { passive: true });
};

// ─── Cinematic Blur Text Animation (About Me paragraphs) ────────────────────
const initBlurTextAnimation = () => {
  const paragraphs = document.querySelectorAll('.blur-reveal-paragraph');
  if (paragraphs.length === 0) return;

  paragraphs.forEach(paragraph => {
    const text = paragraph.textContent.trim();
    // Split on whitespace but preserve words
    const words = text.split(/\s+/);
    const totalWords = words.length;
    
    paragraph.innerHTML = ''; // Clear original text

    const wordData = words.map((word, index) => {
      const progress = index / totalWords;
      const exponentialDelay = Math.pow(progress, 0.8) * 0.2;
      const baseDelay = index * 0.022;
      const microVariation = (Math.random() - 0.5) * 0.015;
      
      const delay = baseDelay + exponentialDelay + microVariation;
      const duration = 1.1 + Math.cos(index * 0.3) * 0.15;
      const blurVal = 12 + Math.floor(Math.random() * 8);
      const scaleVal = 0.9 + Math.sin(index * 0.2) * 0.05;

      const span = document.createElement('span');
      span.textContent = word;
      
      // Add a trailing space so they align as words
      const space = document.createTextNode(' ');
      
      // Initial state styles
      span.style.opacity = '0';
      span.style.filter = `blur(${blurVal}px) brightness(0.6)`;
      span.style.transform = `translateY(20px) scale(${scaleVal}) rotateX(-15deg)`;
      span.style.transitionDuration = `${duration}s`;
      span.style.transitionDelay = `${delay}s`;
      span.style.marginRight = '0.35em';
      
      paragraph.appendChild(span);
      paragraph.appendChild(space);
      return span;
    });

    // Create an intersection observer specifically for this paragraph
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Trigger the animation by setting the final style values
          wordData.forEach(span => {
            span.style.opacity = '1';
            span.style.filter = 'blur(0px) brightness(1)';
            span.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
            span.style.textShadow = '0 2px 8px rgba(255,255,255,0.1)';
          });
          obs.unobserve(paragraph); // Only animate once
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    obs.observe(paragraph);
  });
};

// ─── Text Scramble Hover Animations ─────────────────────────────────────────
const scrambleText = (element, duration = 1.0, speed = 0.065) => {
  if (element.dataset.isAnimatingScramble === 'true') return;
  element.dataset.isAnimatingScramble = 'true';

  if (!element.dataset.originalHtml) {
    element.dataset.originalHtml = element.innerHTML;
  }
  const originalText = element.textContent.trim();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const steps = duration / speed;
  let step = 0;

  const interval = setInterval(() => {
    let scrambled = '';
    const progress = step / steps;

    for (let i = 0; i < originalText.length; i++) {
      if (originalText[i] === ' ') {
        scrambled += ' ';
        continue;
      }
      if (progress * originalText.length > i) {
        scrambled += originalText[i];
      } else {
        scrambled += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    element.textContent = scrambled;
    step++;

    if (step > steps) {
      clearInterval(interval);
      element.innerHTML = element.dataset.originalHtml;
      element.dataset.isAnimatingScramble = 'false';
    }
  }, speed * 1000);
};

const initTextScramble = () => {
  const targets = document.querySelectorAll('.subtitle-flank p');
  targets.forEach(target => {
    target.dataset.isAnimatingScramble = 'false';
    target.dataset.originalHtml = target.innerHTML;

    target.addEventListener('mouseenter', () => {
      scrambleText(target);
    });
  });
};

// ─── Scroll Progress Bar ────────────────────────────────────────────────────
const progressBar = document.getElementById('scroll-progress');
const updateProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
};
window.addEventListener('scroll', updateProgress, { passive: true });

// ─── Parallax on data-parallax elements ─────────────────────────────────────
const parallaxEls = document.querySelectorAll('[data-parallax]');
const updateParallax = () => {
  parallaxEls.forEach(el => {
    const rect = el.closest('section')?.getBoundingClientRect() ?? el.getBoundingClientRect();
    const speed = parseFloat(el.dataset.parallax);
    // How far the section has scrolled past the viewport center
    const offset = (window.innerHeight / 2 - rect.top - rect.height / 2) * speed;
    el.style.transform = el.style.transform.replace(/translateY\([^)]*\)/, '') + ` translateY(${offset}px)`;
  });
};
window.addEventListener('scroll', updateParallax, { passive: true });

// ─── Animated Counter for Stat Cards ────────────────────────────────────────
const animateCounter = (el) => {
  const target = parseInt(el.dataset.target, 10);
  const numberEl = el.querySelector('.stat-number');
  if (!numberEl) return;
  const duration = 1200;
  const startTime = performance.now();

  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    numberEl.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

// ─── Journey Section Animation Logic ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Initialise the interactive particle text on the manifesto quote
  initManifestoParticles();

  // Initialise the cinematic blur text animation for the About paragraphs
  initBlurTextAnimation();

  // Initialise the text scramble hover animation on hero section elements
  initTextScramble();

  // ── Generic fade/slide observer ──────────────────────────────
  const makeObserver = (selector, threshold = 0.15) => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target); // fire once
        }
      });
    }, { threshold, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(selector).forEach(el => obs.observe(el));
  };

  // All standard animation classes
  makeObserver('.scroll-fade-up');
  makeObserver('.text-reveal', 0.2);
  makeObserver('.word-reveal', 0.3);
  makeObserver('.slide-in-left', 0.15);
  makeObserver('.slide-in-right', 0.15);
  makeObserver('.reveal-line', 0.2);
  makeObserver('.skill-tag', 0.3);

  // ── Stat card observer — also fires counter ──────────────────
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Stagger each card slightly
        setTimeout(() => {
          el.classList.add('in-view');
          animateCounter(el);
        }, i * 140);
        statObs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-card').forEach(el => statObs.observe(el));
});

// ─── Footer 3D Character Rendering ─────────────────────────────────────────
const footerRenderDisposers = [];
const initFooter3D = () => {
  const canvas = document.getElementById('footer-canvas');
  if (!canvas) {
    // Wait until React renders the footer canvas
    setTimeout(initFooter3D, 500);
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const frame = canvas.parentElement;
  const palette = getComputedStyle(canvas.closest('.footer-night'));
  const color = token => palette.getPropertyValue(token).trim();
  const navy = color('--about-ink'), amber = color('--about-amber'), cream = color('--cream');
  renderer.setClearColor(navy, 0);
  renderer.setSize(frame.clientWidth, frame.clientHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .82;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  
  // Set camera to frame the character sitting at the desk from a side angle
  const camera = new THREE.PerspectiveCamera(35, frame.clientWidth / frame.clientHeight, 0.1, 1000);
  camera.position.set(-18, 12, 14); // Positioned to the left side (looking at character facing right)
  camera.lookAt(0, 8, 0); // Looking at the character's face/chest level

  // Lighting
  scene.add(new THREE.AmbientLight(navy, .8));
  const keyLight = new THREE.DirectionalLight(amber, 1.3);
  keyLight.position.set(-10, 18, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -14; keyLight.shadow.camera.right = 14;
  keyLight.shadow.camera.top = 18; keyLight.shadow.camera.bottom = -14;
  keyLight.shadow.normalBias = .03; keyLight.shadow.radius = 4;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(color('--about-skin'), 1.1);
  fillLight.position.set(9, 10, -8);
  scene.add(fillLight);

  // Draw each monitor texture once. Blinking swaps the cached cursor variant.
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 256; screenCanvas.height = 160;
  const screenContext = screenCanvas.getContext('2d');
  screenContext.fillStyle = navy; screenContext.fillRect(0, 0, 256, 160);
  [164, 116, 188, 142, 98, 174, 130, 194, 108].forEach((width, i) => {
    screenContext.fillStyle = i % 3 === 0 ? amber : cream;
    screenContext.globalAlpha = i % 3 === 0 ? .85 : .65;
    screenContext.fillRect(i % 2 ? 30 : 18, 16 + i * 13, width, 3);
  });
  screenContext.globalAlpha = 1;
  const cursorCanvas = document.createElement('canvas');
  cursorCanvas.width = 256; cursorCanvas.height = 160;
  const cursorContext = cursorCanvas.getContext('2d');
  cursorContext.drawImage(screenCanvas, 0, 0);
  cursorContext.fillStyle = amber; cursorContext.fillRect(18, 139, 8, 10);
  const screenTextures = [screenCanvas, cursorCanvas].map(source => {
    const texture = new THREE.CanvasTexture(source);
    texture.colorSpace = THREE.SRGBColorSpace; texture.flipY = false;
    return texture;
  });
  const screenMaterials = [], screenLights = [];
  const ownedMaterials = new Set();
  let mixer, model, disposed = false, monitorLevel = 0, lastCursor = -1;
  const modelBox = new THREE.Box3();
  const viewDirection = new THREE.Vector3(-18, 4, 14).normalize();
  const fitCamera = () => {
    if (!model) return;
    model.updateMatrixWorld(true);
    modelBox.setFromObject(model);
    const center = modelBox.getCenter(new THREE.Vector3());
    const sphere = modelBox.getBoundingSphere(new THREE.Sphere());
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const limitingFov = Math.min(halfFov, Math.atan(Math.tan(halfFov) * camera.aspect));
    camera.position.copy(center).addScaledVector(viewDirection, sphere.radius / Math.sin(limitingFov) * 1.06);
    camera.lookAt(center);
    keyLight.target.position.copy(center); scene.add(keyLight.target);
  };
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  loader.setDRACOLoader(draco);

  loader.load('/models/character.glb', (gltf) => {
    if (disposed) return;
    model = gltf.scene;
    
    model.traverse((node) => {
      if (node.isMesh) {
        node.visible = true;
        node.castShadow = true; node.receiveShadow = true;
        node.geometry.computeBoundingBox();
        const extent = node.geometry.boundingBox.getSize(new THREE.Vector3());
        const dimensions = [extent.x, extent.y, extent.z].sort((a, b) => a - b);
        const thin = dimensions[0] < dimensions[2] * .12;
        const recolor = original => {
          if (!original.color || original.map || original.lightMap) return original;
          const material = original.clone(); ownedMaterials.add(material);
          const name = `${node.name} ${original.name}`.toLowerCase();
          const blueScreen = thin && original.color.b > original.color.r * 1.8 && original.color.b > original.color.g * 1.2;
          if ((/screen|display/.test(name) || blueScreen) && material.emissive) {
            material.color.set(cream); material.map = screenTextures[0];
            material.emissive.set(cream); material.emissiveMap = screenTextures[0]; material.emissiveIntensity = 0;
            material.roughness = .6; screenMaterials.push(material);
            const light = new THREE.PointLight(amber, 0, 12, 2);
            light.position.copy(node.geometry.boundingBox.getCenter(new THREE.Vector3()));
            light.position.z += .4; node.add(light); screenLights.push(light);
          } else if (/hoodie|shirt|sweater|cube[._]?006/.test(name)) material.color.set(color('--inner'));
          else if (/trouser|pants|jeans/.test(name)) material.color.set(color('--about-navy'));
          else if (/(^|[^a-z])(cap|hat)([^a-z]|$)/.test(name)) material.color.set(cream);
          else if (/desktop|tabletop|desk.*top|table.*top/.test(name)) material.color.set(cream);
          else if (/chair|seat/.test(name)) material.color.set(amber);
          return material;
        };
        node.material = Array.isArray(node.material) ? node.material.map(recolor) : recolor(node.material);
      }
    });

    // Lower the model slightly if needed so desk sits correctly
    model.position.y = -1;
    // Rotate model to match the exact angle requested (facing slightly left from our view)
    model.rotation.y = -1.65; 
    
    scene.add(model);
    fitCamera();
    canvas.dataset.ready = "true";

    // Play typing animation
    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(model);
      // Explicitly find 'typing'
      const anim = gltf.animations.find(c => c.name === 'typing') || gltf.animations[0];
      if (anim) {
        const action = mixer.clipAction(anim);
        action.play();
      }
    }
  });

  const clock = new THREE.Clock();
  
  // IntersectionObserver owns visibility. No per-frame layout polling while
  // the user is in the scroll story, including on a reverse visit.
  let footerVisible = false, footerFrame = 0;
  const animate = () => {
    footerFrame = 0;
    if (!footerVisible || document.hidden) return;
    const delta = Math.min(clock.getDelta(), .05);
    if (mixer) mixer.update(delta);
    const monitorOn = canvas.dataset.monitor === 'on';
    monitorLevel = canvas.dataset.reducedMotion === 'true' ? (monitorOn ? 1 : 0) : Math.min(monitorOn ? 1 : 0, monitorLevel + delta * 1.5);
    screenMaterials.forEach(material => { material.emissiveIntensity = monitorLevel * .6; });
    screenLights.forEach(light => { light.intensity = monitorLevel * 3; });
    const cursor = canvas.dataset.reducedMotion === 'true' ? 1 : Math.floor(performance.now() / 900) % 2;
    if (cursor !== lastCursor) {
      lastCursor = cursor;
      screenMaterials.forEach(material => { material.map = screenTextures[cursor]; material.emissiveMap = screenTextures[cursor]; });
    }
    renderer.render(scene, camera);
    footerFrame = requestAnimationFrame(animate);
  };
  const syncFooter = () => {
    cancelAnimationFrame(footerFrame); footerFrame = 0;
    if (footerVisible && !document.hidden) { clock.getDelta(); animate(); }
  };
  const visibility = new IntersectionObserver(([entry]) => { footerVisible = entry.isIntersecting; syncFooter(); });
  visibility.observe(canvas);
  document.addEventListener('visibilitychange', syncFooter);
  footerRenderDisposers.push(() => {
    disposed = true;
    cancelAnimationFrame(footerFrame); visibility.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', syncFooter);
    mixer?.stopAllAction(); if (model) mixer?.uncacheRoot(model);
    renderer.dispose(); draco.dispose();
    ownedMaterials.forEach(material => material.dispose()); screenTextures.forEach(texture => texture.dispose());
  });

  // Handle Resize
  const resizeObserver = new ResizeObserver(() => {
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitCamera();
  });
  resizeObserver.observe(frame);
};

// The offscreen model and WebGL context do not compete with the scroll story.
const footerBootObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) {
    footerBootObserver.disconnect(); initFooter3D();
  }
}, { rootMargin: '1200px 0px' });
footerBootObserver.observe(document.getElementById('video-footer-root'));

// Typography preview and decorative layers are independent of the SVG renderer.
const hero = document.querySelector('.hero-section');
if (hero) {
  let letterIndex = 0;
  hero.querySelectorAll('.name-word').forEach(word => {
    const letters = [...word.textContent]; word.textContent = '';
    letters.forEach(letter => {
      const span = document.createElement('span'); span.textContent = letter;
      span.className = 'name-letter'; span.style.setProperty('--letter', letterIndex++);
      word.appendChild(span);
    });
  });
  const sky = hero.querySelector('.hero-sky');
  for (let i = 0; i < 25; i++) {
    const star = document.createElement('i'); star.className = 'hero-star';
    star.style.cssText = `left:${4 + (i * 37 % 92)}%;top:${35 + (i * 19 % 54)}%;animation-delay:${i * -.47}s`;
    sky.appendChild(star);
  }
  for (let i = 0; i < 6; i++) {
    const bird = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    bird.setAttribute('viewBox', '0 0 28 16'); bird.classList.add('hero-bird');
    bird.style.cssText = `left:${7 + i * 5}%;top:${55 + i % 3 * 7}%;animation-delay:${-i * 2}s`;
    bird.innerHTML = '<path d="M2 10Q8 2 14 9Q20 2 26 10" fill="none" stroke="var(--white)" stroke-width="1.2"/>';
    sky.appendChild(bird);
  }

}


const disposeJourneyDebug = installJourneyDebug();
const debugJump = event => lenis.scrollTo(event.detail, { immediate: true, force: true });
window.addEventListener('journey-debug-jump', debugJump);
if (import.meta.hot) import.meta.hot.dispose(() => {
  footerBootObserver.disconnect(); footerRenderDisposers.forEach(dispose => dispose());
  document.removeEventListener('click', handleAnchorClick);
  window.removeEventListener('close-projects-page', closeProjectsPage);
  window.removeEventListener('popstate', restoreProjectsHistory);
  window.removeEventListener('hashchange', restoreProjectsHistory);
  mountedRoots.forEach(root => root.unmount());
  disposeJourneyDebug(); window.removeEventListener('journey-debug-jump', debugJump);
  window.removeEventListener('journey-contact', sayHi);
  lenis.off('scroll', ScrollTrigger.update); gsap.ticker.remove(rafLenis);
  reducedMotion.removeEventListener('change', syncScrollMotion); lenis.destroy();
});

if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());
