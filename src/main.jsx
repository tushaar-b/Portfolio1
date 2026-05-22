import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import Lenis from 'lenis';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { DemoOne } from '../components/ui/demo.tsx';
import { SvgFollowScroll } from '../components/ui/svg-follow-scroll.tsx';
import { FlipCardsSection } from '../components/ui/flip-cards.tsx';
import { TechStackSection } from '../components/ui/tech-stack.tsx';
import { ProjectsSection } from '../components/ui/projects-section.tsx';
import { ProjectsPage } from '../components/ui/projects-page.tsx';
import { GoodDesignSection } from '../components/ui/good-design-section.tsx';
import { VideoFooter } from '../components/ui/video-footer.tsx';

// ─── Render MY JOURNEY section ───────────────────────────────────────────────
const journeyRoot = document.getElementById('journey-root');
if (journeyRoot) {
  ReactDOM.createRoot(journeyRoot).render(
    <React.StrictMode>
      <DemoOne />
    </React.StrictMode>
  );
}

// ─── Render SVG Scroll Follow Path ───────────────────────────────────────────
const svgScrollRoot = document.getElementById('svg-scroll-root');
if (svgScrollRoot) {
  ReactDOM.createRoot(svgScrollRoot).render(
    <React.StrictMode>
      <SvgFollowScroll />
    </React.StrictMode>
  );
}

// ─── Render Milestones Flip-Cards Section ────────────────────────────────────
const milestonesRoot = document.getElementById('milestones-root');
if (milestonesRoot) {
  ReactDOM.createRoot(milestonesRoot).render(
    <React.StrictMode>
      <FlipCardsSection />
    </React.StrictMode>
  );
}

// ─── Render Tech Stack Section ───────────────────────────────────────────────
const techStackRoot = document.getElementById('tech-stack-root');
if (techStackRoot) {
  ReactDOM.createRoot(techStackRoot).render(
    <React.StrictMode>
      <TechStackSection />
    </React.StrictMode>
  );
}

// ─── Render Projects Section (big title in portfolio) ───────────────────────────
const projectsRoot = document.getElementById('projects-root');
if (projectsRoot) {
  ReactDOM.createRoot(projectsRoot).render(
    <React.StrictMode>
      <ProjectsSection />
    </React.StrictMode>
  );
}

// ─── Render Projects Page (fully independent, outside #app) ───────────────────────
const projectsPageRoot = document.getElementById('projects-page-root');
if (projectsPageRoot) {
  ReactDOM.createRoot(projectsPageRoot).render(
    <React.StrictMode>
      <ProjectsPage />
    </React.StrictMode>
  );
}

// ─── Render Good Design Section ─────────────────────────────────────────────
const goodDesignRoot = document.getElementById('good-design-root');
if (goodDesignRoot) {
  ReactDOM.createRoot(goodDesignRoot).render(
    <React.StrictMode>
      <GoodDesignSection />
    </React.StrictMode>
  );
}

// ─── Render Video Footer ──────────────────────────────────────────────────
const videoFooterRoot = document.getElementById('video-footer-root');
if (videoFooterRoot) {
  ReactDOM.createRoot(videoFooterRoot).render(
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

// Handle anchor links for smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target);
    }
  });
});

// Handle initial load with hash
if (window.location.hash) {
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
window.addEventListener('close-projects-page', () => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});

// ─── Renderer ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;

// ─── Scene ─────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();

// ─── Camera — frame head + upper shoulders (cropping hollow cuffs) ─────────
const camera = new THREE.PerspectiveCamera(17, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 13.2, 22.0); // Moved closer and slightly higher
camera.lookAt(0, 13.0, 0); // Point at head/collar level
camera.zoom = 1.25;
camera.updateProjectionMatrix();

// ─── Lights ────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
keyLight.position.set(3, 10, 8);
scene.add(keyLight);

// Strong rim/back light — gives that blue-purple glow from the reference image
const rimLight = new THREE.DirectionalLight(0x3366ff, 5.0);
rimLight.position.set(-6, 5, -6);
scene.add(rimLight);

// Warm fill from front-left
const fillLight = new THREE.DirectionalLight(0xffe8cc, 1.2);
fillLight.position.set(-4, 12, 10);
scene.add(fillLight);

// ─── Environment (HDR) ─────────────────────────────────────────────────────
new RGBELoader().load('/models/char_enviorment.hdr', (tex) => {
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;
  // No scene.background → CSS gradient shows through
});

// ─── Load model ────────────────────────────────────────────────────────────
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('/draco/');
loader.setDRACOLoader(draco);

let mixer;
let headBone;
let model;

loader.load(
  '/models/character.glb',
  (gltf) => {
    model = gltf.scene;

    // 1. Console log to print names of all meshes for debugging
    console.log("=== ALL MESHES IN GLTF ===");
    model.traverse((child) => {
      if (child.isMesh) {
        console.log(child.name);
      }
    });

    // 2. Allowed meshes (normalized to lower-case without dots or underscores to prevent Three.js sanitization issues)
    const allowedNormalized = [
      "cap001",
      "cap002",
      "ear001",
      "eyebrow",
      "eyes001",
      "face002",
      "hair",
      "neck",
      "teeth001"
    ];

    model.traverse((node) => {
      if (node.isMesh) {
        const normName = node.name.toLowerCase().replace(/[\._]/g, '');
        const isShirt = normName.startsWith("cube006");
        
        // 3. Toggle child.visible = false on everything else
        if (!allowedNormalized.includes(normName) && !isShirt) {
          node.visible = false;
        } else {
          node.visible = true;
          node.castShadow = true;
          node.receiveShadow = true;
          node.frustumCulled = false;

          // Set shirt color to a rich dark black
          if (isShirt) {
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach(mat => {
              mat.transparent = false;
              mat.opacity = 1;
              mat.depthWrite = true;
              if (mat.color) {
                mat.color.set("#000000"); // Pure opaque black
              }
              // Adjust lighting response for ultra-matte fabric look
              mat.roughness = 1.0;
              mat.metalness = 0.0;
              mat.needsUpdate = true;
            });
          }
        }
      }
    });

    model.position.y = -0.5; // Lift up slightly but keep arm joints hidden
    scene.add(model);

    // Use spine006 for head look-at (original bone name)
    headBone = model.getObjectByName('spine.006') || model.getObjectByName('spine006') || null;

    // Play intro + blink animations if present
    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(model);
      const introClip = gltf.animations.find(c => c.name === 'introAnimation');
      if (introClip) {
        const action = mixer.clipAction(introClip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();
        // Start blink after intro
        setTimeout(() => {
          const blinkClip = gltf.animations.find(c => c.name === 'Blink');
          if (blinkClip) mixer.clipAction(blinkClip).play().fadeIn(0.5);
        }, 2500);
      } else {
        // fallback — play first clip
        mixer.clipAction(gltf.animations[0]).play();
      }
    }

    // Show canvas once model is in
    canvas.style.transition = 'opacity 1.5s ease-in';
    canvas.style.opacity = '1';
    modelLoaded = true;
    setTimeout(() => {
      canvas.style.transition = 'none';
    }, 1500);
  },
  undefined,
  (err) => console.error('Model error', err)
);

// ─── Mouse & Scroll tracking ───────────────────────────────────────────────
const mouse = { x: 0, y: 0 };
const interp = { x: 0, y: 0 };
let scrollPercent = 0;
let targetScroll = 0;
let modelLoaded = false;

document.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  // Update navbar background on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// ─── Render loop ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();

(function animate(time) {
  requestAnimationFrame(animate);
  lenis.raf(time);

  // Fade out WebGL canvas as we scroll down
  if (modelLoaded && canvas) {
    canvas.style.opacity = Math.max(0, 1 - (scrollPercent / 0.35));
  }

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  // Smooth interpolation towards mouse target
  interp.x += (mouse.x - interp.x) * 0.05;
  interp.y += (mouse.y - interp.y) * 0.05;

  targetScroll = THREE.MathUtils.lerp(targetScroll, scrollPercent, 0.08);

  // 1. Model sits at its place (no scroll transformations)
  if (headBone) {
    // Mouse look-at applies normally without scroll fading
    headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, interp.x * 0.35, 0.08);
    headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, interp.y * 0.18, 0.08);
  }

  // 2. Parallax animations for background glass sphere
  const bubbleL = document.querySelector('.bubble-left');
  if (bubbleL) {
    bubbleL.style.transform = `translateY(${-targetScroll * 160}px) rotate(${targetScroll * 15}deg)`;
  }

  // 3. Cinematic scroll reveal trigger for section 2 text
  const revealElements = document.querySelectorAll('.text-reveal');
  revealElements.forEach((el) => {
    if (scrollPercent > 0.28) {
      el.classList.add('in-view');
    } else {
      el.classList.remove('in-view');
    }
  });


  renderer.render(scene, camera);
}(performance.now()));

// ─── Resize ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Neural Background Flow Field for About Section ───────────────────────────
const initNeuralBackground = (canvasId = 'shader-canvas') => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const numNodes = 100;
  const color = '#111111'; // Dark gray/black for light theme
  const trailOpacity = 0.1;
  const particleCount = 600;
  const speed = 0.8;

  let width = window.innerWidth;
  let height = window.innerHeight;
  let particles = [];
  let animationFrameId;
  let mouse = { x: -1000, y: -1000 };

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = 0;
      this.vy = 0;
      this.age = 0;
      this.life = Math.random() * 200 + 100;
    }

    update() {
      const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;
      
      this.vx += Math.cos(angle) * 0.2 * speed;
      this.vy += Math.sin(angle) * 0.2 * speed;

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const interactionRadius = 150;

      if (distance < interactionRadius) {
        const force = (interactionRadius - distance) / interactionRadius;
        this.vx -= dx * force * 0.05;
        this.vy -= dy * force * 0.05;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.95;
      this.vy *= 0.95;

      this.age++;
      if (this.age > this.life) {
        this.reset();
      }

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = 0;
      this.vy = 0;
      this.age = 0;
      this.life = Math.random() * 200 + 100;
    }

    draw(context) {
      context.fillStyle = color;
      const alpha = 1 - Math.abs((this.age / this.life) - 0.5) * 2;
      context.globalAlpha = alpha * 0.15; // Darker lines
      context.strokeStyle = color;
      context.fillRect(this.x, this.y, 1.5, 1.5);
    }
  }

  const init = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  };

  const animate = () => {
    // Fade out existing pixels towards transparent to create trails without making the canvas opaque black
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
    ctx.fillRect(0, 0, width, height);

    // Reset to normal drawing for particles
    ctx.globalCompositeOperation = 'source-over';

    particles.forEach((p) => {
      p.update();
      p.draw(ctx);
    });

    animationFrameId = requestAnimationFrame(animate);
  };

  const handleResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    init();
  };

  const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  const handleMouseLeave = () => {
    mouse.x = -1000;
    mouse.y = -1000;
  };

  init();
  animate();

  window.addEventListener('resize', handleResize);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', handleMouseLeave);
};

initNeuralBackground('shader-canvas');

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

  // Intercept anchor hash clicks to scroll smoothly using Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        lenis.scrollTo(targetEl, {
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easeOutExpo
        });
      }
    });
  });

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
const initFooter3D = () => {
  const canvas = document.getElementById('footer-canvas');
  if (!canvas) {
    // Wait until React renders the footer canvas
    setTimeout(initFooter3D, 500);
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  
  // Set camera to frame the character sitting at the desk from a side angle
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-18, 12, 14); // Positioned to the left side (looking at character facing right)
  camera.lookAt(0, 8, 0); // Looking at the character's face/chest level

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(5, 15, 10);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x3366ff, 1.5);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  let mixer;
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  loader.setDRACOLoader(draco);

  loader.load('/models/character.glb', (gltf) => {
    const model = gltf.scene;
    
    model.traverse((node) => {
      if (node.isMesh) {
        // Keep EVERYTHING visible so we see the desk, chair, monitor, etc.
        node.visible = true;
        
        // Optional: Keep the shirt black like in the hero
        const normName = node.name.toLowerCase().replace(/[\._]/g, '');
        if (normName.startsWith("cube006")) {
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach(mat => {
            mat.transparent = false;
            mat.opacity = 1;
            if (mat.color) mat.color.set("#000000");
          });
        }
      }
    });

    // Lower the model slightly if needed so desk sits correctly
    model.position.y = -1;
    // Rotate model to match the exact angle requested (facing slightly left from our view)
    model.rotation.y = -1.65; 
    
    scene.add(model);

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
  
  // Render loop
  const animate = () => {
    requestAnimationFrame(animate);
    
    // Only render if it's actually somewhat in view to save performance
    const rect = canvas.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (mixer) mixer.update(clock.getDelta());
      renderer.render(scene, camera);
    } else {
      // Just keep clock ticking
      clock.getDelta();
    }
  };
  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
};

initFooter3D();
