import { useLayoutEffect, type RefObject } from 'react';
import { sceneReady } from '../../src/scroll-ready';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildAboutMotion, ABOUT_MOTION } from './about-motion';
import type { AsciiClock } from './use-ascii-character';
gsap.registerPlugin(ScrollTrigger);

const marks = ['CSS', 'JS', 'TS', 'REACT', 'NODE', 'SQL', 'GIT', 'FIGMA', 'HTML', 'AI', 'PY'];
// Times are in the existing single scroll clock. Later About beats retain their pace.
const HERO_END = 8.9, ABOUT_START = 9.1, DIVE_START = 2.6, DIVE_END = 7.4;
const COLOR_END = DIVE_END + HERO_END * .08, TEXT_START = COLOR_END + .02;
const colors = ['#C9D3EE', '#F4A640', '#F6F0E4', '#E4EAF6'];

/** Split headline into inline-block words with preserved spacing and accent elements */
function splitHeadlineWords(headlineEl: HTMLElement): HTMLElement[] {
  const lineEls = headlineEl.querySelectorAll<HTMLElement>('#next-title > span');
  const wordEls: HTMLElement[] = [];
  lineEls.forEach(line => {
    if (!line.dataset.originalHtml) {
      line.dataset.originalHtml = line.innerHTML;
    } else {
      line.innerHTML = line.dataset.originalHtml;
    }
    line.style.whiteSpace = 'nowrap';
    const childNodes = Array.from(line.childNodes);
    line.innerHTML = '';
    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const tokens = text.split(/(\s+)/);
        tokens.forEach(token => {
          if (!token) return;
          if (/^\s+$/.test(token)) {
            line.appendChild(document.createTextNode(' '));
          } else {
            const w = document.createElement('span');
            w.className = 'next-word';
            w.textContent = token;
            line.appendChild(w);
            wordEls.push(w);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const w = document.createElement('span');
        w.className = 'next-word';
        w.appendChild(el.cloneNode(true));
        line.appendChild(w);
        wordEls.push(w);
      }
    });
  });
  return wordEls;
}

/** One pin owns the physical hero, the only headline, and About's child timeline.
 * Fully reversible, scroll-scrubbed master timeline. */
export function useHeroJourney(ref: RefObject<HTMLDivElement | null>, resolve: RefObject<AsciiClock>) {
  useLayoutEffect(() => {
    let disposed = false, frame = 0, ctx: gsap.Context | undefined;
    const boot = () => {
      if (disposed) return;
      const hero = ref.current?.closest<HTMLElement>('.stage'), journey = hero?.closest<HTMLElement>('.journey');
      const about = hero?.querySelector<HTMLElement>('#about'), badge = document.querySelector<HTMLElement>('#avatar-badge');
      if (!hero || !journey || !about || !badge) { frame = requestAnimationFrame(boot); return; }
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add({ mobile: '(max-width:899px)', desktop: '(min-width:900px)', reduced: '(prefers-reduced-motion:reduce)' }, media => {
          const { mobile, reduced } = media.conditions!;
          const scene = hero.querySelector<HTMLElement>('.journey-scene')!;
          const camera = hero.querySelector<HTMLElement>('#zoom-layer') || hero.querySelector<HTMLElement>('.journey-camera')!;
          const headline = hero.querySelector<HTMLElement>('.next-screen')!;
          const svg = hero.querySelector<SVGSVGElement>('#character-svg')!;
          const lid = svg.querySelector('#lid')!;
          const opening = svg.querySelector<SVGEllipseElement>('#head-opening')!;
          const interior = svg.querySelector<SVGGElement>('#head-interior')!;
          const frontRim = svg.querySelector<SVGGElement>('#head-rim')!;
          const tunnel = svg.querySelector<SVGGElement>('#head-tunnel')!;
          const tunnelRings = Array.from(svg.querySelectorAll<SVGEllipseElement>('#head-tunnel-rings > ellipse'));
          const surface = svg.querySelectorAll('#head-face-surface,#head-ears,#face,#body,#arm,#neck,#hand');
          const ringClock = { travel:0 };
          const openingGlow = svg.querySelector('#head-opening-glow');
          const rimShadow = svg.querySelector('#head-rim-shadow');
          const tiles = hero.querySelector<HTMLElement>('.tiles')!;
          const chrome = hero.querySelectorAll('.hero-nav,.hero-name,.hero-subtitle,.hero-sky,.hero-scroll,.hero-ruler,.experiment-toggle');
          const eyebrow = headline.querySelector<HTMLElement>('.next-content > p');
          const cta = headline.querySelector<HTMLElement>('.next-content > a');

          gsap.set(badge, { x: 0, y: 0, xPercent: 0, yPercent: 0, scale: 1, rotation: 0, autoAlpha: reduced ? 1 : 0 });
          badge.inert = false; (badge as HTMLButtonElement).disabled = false;
          badge.dataset.docked = 'true';

          if (reduced) {
            gsap.set(headline, { opacity: 1, clipPath: 'none', visibility: 'visible' }); headline.inert = false;
            document.body.dataset.storyBadge = 'visible'; resolve.current.update(0);
            return () => { delete document.body.dataset.storyBadge; };
          }

          // Layout geometry, never transformed viewport bounds: refreshing or reversing
          // halfway through a dive must not move the camera pivot or tile source.
          const characterStage = hero.querySelector<HTMLElement>('.character-stage')!;
          const geometry = () => {
            const size = characterStage.clientWidth;
            const matrix = new DOMMatrix(getComputedStyle(characterStage).transform);
            const left = characterStage.offsetLeft + matrix.e;
            const top = characterStage.offsetTop + matrix.f;
            const unit = size / 600;
            return { left, top, unit, x: left + 300 * unit, y: top + 150 * unit,
              width: 220 * unit, height: 52 * unit };
          };
          const getOpeningCenter = () => geometry();
          // The face is 190 SVG units high: 40% = 76 units (109px at 1440).
          // No title-dependent cap is permitted to collapse this movement.
          const getLidLift = () => -Math.max(190 * .40, 190 * .25);

          // A foreground copy keeps the composite lid above emerging tiles. It
          // shares the exact same tween as the source used by the ASCII dissolve.
          const lidLayer = document.createElement('div');
          lidLayer.className = 'character-stage journey-lid-layer';
          lidLayer.setAttribute('aria-hidden', 'true');
          const lidSvg = svg.cloneNode(false) as SVGSVGElement;
          lidSvg.removeAttribute('id'); lidSvg.removeAttribute('role'); lidSvg.removeAttribute('aria-label');
          lidSvg.setAttribute('class', 'hero-character');
          lidSvg.style.cssText = 'display:block;overflow:visible;';
          const foregroundLid = lid.cloneNode(true) as SVGElement;
          foregroundLid.id = 'foreground-lid';
          lidSvg.append(foregroundLid); lidLayer.append(lidSvg); camera.append(lidLayer);
          const lids = [lid, foregroundLid];
          gsap.set(lidLayer, { opacity:0 });

          gsap.set([scene, camera], { opacity: 1, visibility: 'visible', x: 0, y: 0, scale: 1 });
          gsap.set(chrome, { opacity: 1, x: 0, y: 0 });
          gsap.set(headline, { opacity: 0, visibility: 'hidden', clipPath: 'none' });
          gsap.set(lids, { x: 0, y: 0, rotation: 0, transformOrigin: '50% 100%' });
          if (openingGlow) gsap.set(openingGlow, { opacity: 0 });
          if (rimShadow) gsap.set(rimShadow, { opacity: 0.35 });

          // Split headline words cleanly
          const wordNodes = splitHeadlineWords(headline);
          if (eyebrow) gsap.set(eyebrow, { y: 24, opacity: 0 });
          gsap.set(wordNodes, { y: 24, opacity: 0 });
          if (cta) gsap.set(cta, { y: 24, opacity: 0 });

          // Create tiles with inner float wrapper
          tiles.innerHTML = '';
          const nodeItems = marks.map((mark, i) => {
            const node = document.createElement('div');
            node.className = 'tech-tile';
            const floatInner = document.createElement('div');
            floatInner.className = 'tech-tile-float';
            const face = document.createElement('span');
            face.textContent = mark;
            face.style.background = colors[i % colors.length];
            floatInner.append(face);
            node.append(floatInner);
            tiles.append(node);
            return { node, floatInner };
          });

          // Idle float timeline for tiles
          const tileFloats = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
          nodeItems.forEach(({ floatInner }, i) => {
            tileFloats.to(floatInner, {
              y: i % 2 === 0 ? 8 : -8,
              duration: 1.6 + (i % 4) * 0.25,
              ease: 'sine.inOut',
            }, (i % 3) * 0.15);
          });

          type Box = { left:number; right:number; top:number; bottom:number };
          const overlaps = (a:Box,b:Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
          let fanKey = '', fan: {targetX:number;targetY:number;targetRotation:number;targetScale:number}[] = [];
          const getTileTarget = (index:number) => {
            const c = geometry(), key = `${innerWidth}:${innerHeight}:${c.width}:${c.y}`;
            if (key !== fanKey) {
              fanKey = key;
              const unit = c.unit, tileSize = nodeItems[0].node.offsetWidth;
              const half = tileSize * .72; // rotation, scale and 8px idle float included
              const box = (x:number,y:number):Box => ({left:x-half,right:x+half,top:y-half,bottom:y+half});
              const name = hero.querySelector<HTMLElement>('.hero-name')!;
              const titleTop = name.offsetTop, titleBottom = titleTop + parseFloat(getComputedStyle(name).fontSize) * .94;
              const obstacles:Box[] = [
                {left:24,right:innerWidth-24,top:titleTop-12,bottom:titleBottom+12},
                {left:c.left+160*unit-12,right:c.left+440*unit+12,top:c.top+124*unit-12,bottom:c.top+385*unit+12},
                {left:c.left+455*unit-18,right:c.left+595*unit+18,top:c.top+155*unit-18,bottom:c.top+305*unit+18},
              ];
              const subtitle = hero.querySelector<HTMLElement>('.hero-subtitle')!;
              for(const word of Array.from(subtitle.children) as HTMLElement[]) {
                obstacles.push({left:subtitle.offsetLeft+word.offsetLeft-12,
                  right:subtitle.offsetLeft+word.offsetLeft+word.offsetWidth+12,
                  top:subtitle.offsetTop-12,bottom:subtitle.offsetTop+subtitle.offsetHeight+12});
              }
              const occupied:Box[] = [];
              const clear = (b:Box) => b.left>=24 && b.right<=innerWidth-24 && b.top>=24 && b.bottom<=innerHeight-24 && ![...obstacles,...occupied].some(o=>overlaps(b,o));
              fan = new Array(marks.length);
              // Eleven tiles: five mirrored pairs plus one centered canopy tile.
              const canopyY = half+24;
              fan[10]={targetX:c.x,targetY:canopyY,targetRotation:0,targetScale:.98};
              occupied.push(box(c.x,canopyY));
              const angles=[30,45,60,70,80], rings=[1.6,1,1.6,1,1.6];
              angles.forEach((angle,pair)=>{
                const rad=angle*Math.PI/180, radius=c.width*rings[pair];
                const desiredX=radius*Math.sin(rad);
                const desiredY=c.y+getLidLift()*unit*.7-radius*Math.cos(rad);
                let best:{dx:number;y:number;cost:number}|undefined;
                // Choose the nearest clear mirrored pair to the two-ring fan.
                // This is measured only on layout changes, never on scroll frames.
                // Honor the requested angles first; a short viewport may need
                // projection into a clear lateral slot to preserve readable type.
                for(let pass=0;pass<2&&!best;pass++) {
                for(let dx=half+12;dx<=Math.min(c.x,innerWidth-c.x)-half-24;dx+=12) {
                  for(let y=half+24;y<=innerHeight-half-24;y+=12) {
                    const fanAngle=Math.atan2(dx,c.y-y)*180/Math.PI;
                    if(pass===0&&(fanAngle<25||fanAngle>80))continue;
                    const l=box(c.x-dx,y),r=box(c.x+dx,y);
                    if(!clear(l)||!clear(r)||overlaps(l,r))continue;
                    const cost=(dx-desiredX)**2+(y-desiredY)**2;
                    if(!best||cost<best.cost)best={dx,y,cost};
                  }
                }
                }
                // Narrow phones retain a compact fan; desktop always uses clear slots.
                const dx=best?.dx??Math.min(desiredX,innerWidth/2-half-24);
                const y=best?.y??Math.max(half+24,Math.min(innerHeight-half-24,desiredY));
                const scale=rings[pair]>1?.98:1.1;
                fan[pair*2]={targetX:c.x-dx,targetY:y,targetRotation:-12,targetScale:scale};
                fan[pair*2+1]={targetX:c.x+dx,targetY:y,targetRotation:12,targetScale:scale};
                occupied.push(box(c.x-dx,y),box(c.x+dx,y));
              });
            }
            return fan[index];
          };

          // Tiles start inside opening
          nodeItems.forEach(({ node }, i) => {
            gsap.set(node, {
              x: () => getOpeningCenter().x,
              y: () => getOpeningCenter().y,
              xPercent: -50,
              yPercent: -50,
              scale: 0.2,
              opacity: 0,
              rotation: ((i * 37) % 61) - 30,
            });
          });

          // All new dive geometry lives inside the existing opening. SVG group
          // transforms are also cleared by the unchanged ASCII snapshot renderer.
          gsap.set([interior,frontRim],{scaleY:1,svgOrigin:'300 150'});
          gsap.set(surface,{y:0});
          gsap.set(tunnel,{opacity:0});
          gsap.set(hero,{'--dive-interior':getComputedStyle(hero).getPropertyValue('--inner').trim()});

          const aboutMotion = buildAboutMotion(about, headline, badge);
          let trigger: ScrollTrigger;
          let rasterProgress = -1;

          const master = gsap.timeline({
            paused: true,
            defaults: { ease: 'power3.inOut', immediateRender: false },
            onUpdate: () => {
              const t = master.time(), a = Math.max(0, t - ABOUT_START);
              const nextRasterProgress = Math.min(.3, (t / .6) * .18);
              if (nextRasterProgress !== rasterProgress) {
                resolve.current.update(nextRasterProgress);
                rasterProgress = nextRasterProgress;
              }
              headline.inert = t < TEXT_START || t > ABOUT_START + .85;
              scene.inert = t > DIVE_START;

              // Keep scene visible during the dive so no blank frames occur
              scene.style.visibility = t >= COLOR_END ? 'hidden' : 'visible';

              const badgeState = t < TEXT_START + .3 || (a > .85 && a < 9.5) ? 'hidden' : 'visible';
              if (document.body.dataset.storyBadge !== badgeState) document.body.dataset.storyBadge = badgeState;

              // Tile hover belongs to the same scroll clock, so reverse visits
              // identical offsets rather than replaying an independent idle clock.
              const floatTime = resolve.current.freezeIdle ? 0 : Math.max(0, Math.min(2, t - 1.35));
              tileFloats.pause().time(floatTime);

              // Scroll-owned ring travel: reverse retraces exactly, including the
              // continuously moving interior after the rim has left the viewport.
              const cameraScale=Number(gsap.getProperty(camera,'scaleX'))||1;
              tunnelRings.forEach((ring,index)=>{
                const phase=(index/tunnelRings.length+ringClock.travel)%1;
                const radius=.5+phase*phase*108;
                ring.setAttribute('rx',String(radius));
                ring.setAttribute('ry',String(radius*26/110));
                ring.setAttribute('stroke-width',String(1/cameraScale));
                ring.setAttribute('stroke-opacity',String(.25*Math.sin(Math.PI*phase)));
              });
              aboutMotion.sync(a, !!trigger?.isActive);
            }
          });

          master.addLabel('hero',0).addLabel('lid',.65).addLabel('tiles',1.35)
            .addLabel('dive',DIVE_START).addLabel('interior',DIVE_END)
            .addLabel('pink',COLOR_END).addLabel('headline',TEXT_START).addLabel('mind',HERO_END).addLabel('about',ABOUT_START)
            .addLabel('pullback',ABOUT_START+1.65).addLabel('stage',ABOUT_START+3.35)
            .addLabel('beat-a',ABOUT_START+4.75).addLabel('beat-b',ABOUT_START+6.45)
            .addLabel('exit',ABOUT_START+8.2);

          master.to(lidLayer,{opacity:1,duration:.08},.6);
          master.to(lids, { y:getLidLift, x:0, rotation:0, transformOrigin:'50% 100%',
            duration:.65, ease:'back.out(1.6)' },.65);
          if(openingGlow) master.to(openingGlow,{opacity:.28,duration:.5,ease:'power2.out'},.7);
          if(rimShadow) master.to(rimShadow,{opacity:0,duration:.4},.65);

          nodeItems.forEach(({node},i)=>{
            const at=1.35+i*.03;
            master.to(node,{opacity:1,duration:.12,ease:'power2.out'},at)
              .to(node,{x:()=>getTileTarget(i).targetX,y:()=>getTileTarget(i).targetY,
                scale:()=>getTileTarget(i).targetScale,rotation:()=>getTileTarget(i).targetRotation,
                duration:.6,ease:'back.out(1.7)'},at);
          });

          // A single neutral, function-based opening pivot survives refresh/reverse.
          gsap.set(camera,{transformOrigin:()=>{const c=geometry();return `${c.x}px ${c.y}px`;}});
          master.to(chrome,{opacity:0,y:-20,duration:.6,ease:'power2.in'},DIVE_START);
          master.to(camera,{scale:24,transformOrigin:()=>{const c=geometry();return `${c.x}px ${c.y}px`;},
            duration:DIVE_END-DIVE_START,ease:'power2.inOut'},DIVE_START);
          nodeItems.forEach(({node},i)=>{
            const destination=(axis:'x'|'y')=>{
              const c=geometry(),target=getTileTarget(i),dx=target.targetX-c.x,dy=target.targetY-c.y;
              const distance=Math.hypot(dx,dy)||1;
              return (axis==='x'?target.targetX:target.targetY)+(axis==='x'?dx:dy)/distance*Math.max(innerWidth,innerHeight)*.9;
            };
            master.to(node,{x:()=>destination('x'),y:()=>destination('y'),scale:()=>getTileTarget(i).targetScale*2.8,
              duration:1.7,ease:'power2.in'},DIVE_START)
              .to(node,{opacity:0,duration:.5,ease:'power1.out'},DIVE_START+1.25);
          });

          // Tilt down into the real jar: its ellipse becomes round. The original
          // front rim follows the same transform while the face/body leave below.
          // No replacement disc, DOM overlay or circular CSS reveal exists.
          const tiltAt=DIVE_START+(DIVE_END-DIVE_START)*.6;
          master.to([interior,frontRim],{scaleY:110/26,svgOrigin:'300 150',
            duration:DIVE_END-tiltAt,ease:'power2.inOut'},tiltAt);
          master.to(surface,{y:260,duration:DIVE_END-tiltAt,ease:'power2.in'},tiltAt);
          if(openingGlow)master.to(openingGlow,{opacity:0,duration:.5,ease:'power2.out'},DIVE_START);
          master.to(tunnel,{opacity:1,duration:.4,ease:'power1.out'},DIVE_START);
          master.to(ringClock,{travel:2.5,duration:DIVE_END-DIVE_START,ease:'none'},DIVE_START);

          // The real opening already covers every viewport corner before this
          // uniform color change. Its fill follows the same stage color token;
          // serialized ASCII snapshots fall back to the unchanged inner token.
          const token=(name:string)=>getComputedStyle(hero).getPropertyValue(name).trim();
          master.set(hero,{backgroundColor:()=>token('--inner'),'--dive-interior':()=>token('--inner')},DIVE_END);
          master.fromTo(hero,{backgroundColor:()=>token('--inner'),'--dive-interior':()=>token('--inner')},{backgroundColor:()=>token('--pink'),'--dive-interior':()=>token('--pink'),
            duration:COLOR_END-DIVE_END,ease:'none'},DIVE_END);
          master.to(tunnel,{opacity:0,duration:COLOR_END-DIVE_END,ease:'none'},DIVE_END);
          // The pink section is revealed fully opaque only once the color is pink.
          master.set(headline,{opacity:1,visibility:'visible',clipPath:'none'},COLOR_END);
          if(eyebrow)master.to(eyebrow,{y:0,opacity:1,duration:.35,ease:'power2.out'},TEXT_START);
          master.to(wordNodes,{y:0,opacity:1,duration:.4,stagger:.035,ease:'power2.out'},TEXT_START+.05);
          if(cta)master.to(cta,{y:0,opacity:1,duration:.4,ease:'power2.out'},TEXT_START+.2);
          master.to(badge,{autoAlpha:1,duration:.4},TEXT_START+.3)
            .add(aboutMotion.timeline.paused(false),ABOUT_START);

          trigger = ScrollTrigger.create({
            id: 'hero-journey',
            trigger: journey,
            animation: master,
            start: 'top top',
            end: () => `+=${(innerHeight * (mobile ? ABOUT_MOTION.mobileScrollVh : ABOUT_MOTION.scrollVh)) / 100 * master.duration() / (2.9 + aboutMotion.timeline.duration())}`,
            pin: hero,
            pinType: 'transform',
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 10,
            onUpdate: self => aboutMotion.velocity(self.getVelocity()),
            onToggle: () => aboutMotion.sync(Math.max(0, master.time() - ABOUT_START), trigger?.isActive || false),
          });

          (about as any).__aboutMotion = { timeline: aboutMotion.timeline, trigger, master, heroEnd:HERO_END };
          const reset = () => aboutMotion.velocity(0);
          ScrollTrigger.addEventListener('scrollEnd', reset);
          resolve.current.measure();

          return () => {
            ScrollTrigger.removeEventListener('scrollEnd', reset);
            aboutMotion.dispose();
            tileFloats.kill();
            nodeItems.forEach(({ node }) => node.remove());
            lidLayer.remove();
            delete (about as any).__aboutMotion;
            scene.inert = false;
            headline.inert = false;
            scene.style.removeProperty('visibility');
            delete document.body.dataset.storyBadge;
          };
        });
      }, hero);
      ScrollTrigger.refresh();
      journey.dataset.storyReady = 'true';
      sceneReady('hero');
    };

    Promise.all([document.fonts.ready, resolve.current.whenReady]).then(() => {
      if (!disposed) frame = requestAnimationFrame(boot);
    });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!disposed) {
          gsap.matchMediaRefresh();
          ScrollTrigger.refresh();
        }
      }, 220);
    };
    window.addEventListener('resize', resize);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', resize);
      ctx?.revert();
    };
  }, [ref, resolve]);
}
