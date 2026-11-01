import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { mobileMode, liteMode } from '../../src/mobile-mode';
gsap.registerPlugin(SplitText,MotionPathPlugin);
export const ABOUT_MOTION={scrollVh:840,mobileScrollVh:720,scrub:1};

/** Child of the ONE scroll-story master; no pin or ScrollTrigger here. */
export function buildAboutMotion(root,headline,badge){
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const mobile=mobileMode,layer=n=>$(`[data-layer="${n}"]`),joint=n=>$(`[data-joint="${n}"]`);
 const camera=$('.about-character-camera'),rig=$('.about-rig'),bubble=$('.about-bubble');
 const iris=$('.about-iris'),field=$('.about-amber-field'),ring=$('.about-iris-ring');
 const beatA=$('.about-beat-a'),beatB=$('.about-beat-b'),view=$('.about-viewport');
 const irisCenter=()=>{const b=badge.getBoundingClientRect(),v=view.getBoundingClientRect();return `${b.left+b.width/2-v.left}px ${b.top+b.height/2-v.top}px`;};
 const split=SplitText.create($('.about-bubble-letters>span'),{type:'chars',aria:'hidden'});
 const quote=SplitText.create($('.about-quote'),{type:'lines,words',wordsClass:'about-quote-word',mask:'lines',aria:'auto'});
 quote.lines.forEach(line=>line.parentElement.classList.add('about-quote-mask'));
 const paragraph=SplitText.create($('.about-paragraphs p'),{type:'lines',mask:'lines',aria:'auto'});
 const pupils=$$('[data-pupil]'),eyes=$$('[data-eye]'),words=[...headline.querySelectorAll('.next-accent')];
 const coins=$$('.about-medallion'),stickers=$$('.about-sticker'),curtains=$$('.about-curtains i');
 // Measure in the neutral pose. The camera pivots around the complete head,
 // including its headband, so a close-up cannot drift beyond a short viewport.
 const initialCamera=()=>{const c=camera.getBoundingClientRect(),h=layer('head').getBoundingClientRect(),v=view.getBoundingClientRect();const scale=Math.min(innerHeight*.86/h.height,innerWidth*.9/h.width);return {scale,x:v.width/2-(h.left+h.width/2-v.left),y:v.height*.48-(h.top+h.height/2-v.top),origin:`${h.left+h.width/2-c.left}px ${h.top+h.height/2-c.top}px`};};
 // A real vector tail terminates at the neutral profile mouth, not a generic
 // CSS triangle. Its origin stays outside the head silhouette.
 const mouth=new DOMPoint(396,288).matrixTransform(rig.getScreenCTM());
 const br=bubble.getBoundingClientRect();
 const tip={x:(mouth.x-br.left)/br.width*600,y:(mouth.y-br.top)/br.height*250};
 gsap.set(bubble.querySelector('path'),{attr:{d:`M90 5 H510 Q595 5 595 75 Q595 145 510 145 H470 L${tip.x} ${tip.y} L430 145 H90 Q5 145 5 75 Q5 5 90 5Z`}});
 // All trajectory reads happen in the neutral pose, before playback writes.
 // No MotionPath initializer forces layout halfway through a scrubbed frame.
 const neutralHand=new DOMPoint(455,322).matrixTransform(rig.getScreenCTM());
 const badgeRect=badge.getBoundingClientRect();
 const inhalePaths=words.map(word=>{const b=word.getBoundingClientRect(),x=badgeRect.left+badgeRect.width/2-b.left-b.width/2,y=badgeRect.top+badgeRect.height/2-b.top-b.height/2;return [{x:0,y:0},{x:x*.55,y:y*.25-45},{x,y}];});
 const stickerPaths=stickers.map(sticker=>{const b=sticker.getBoundingClientRect(),x=neutralHand.x-b.left-b.width/2,y=neutralHand.y-b.top-b.height/2;return [{x,y},{x:x*.45,y:Math.min(-100,y)-60},{x:0,y:0}];});
 const close=initialCamera();
 gsap.set(iris,{clipPath:()=>`circle(0px at ${irisCenter()})`});
 gsap.set(field,{scale:.987,transformOrigin:()=>irisCenter()});
 gsap.set([$('.about-theatre'),$('.about-stage-arch'),$('.about-ray-window'),$('.about-ground'),$('.about-stage-caption'),beatA,beatB],{opacity:0});
 gsap.set(curtains,{scaleX:0});gsap.set($('.about-scroll-cue'),{opacity:0});gsap.set(bubble,{scale:0,rotation:-3});
 gsap.set(split.chars,{yPercent:-120,scaleY:1.2,opacity:0});
 gsap.set(layer('body-reveal'),{y:0,opacity:0});
 gsap.set(camera,{scale:close.scale*.93,x:close.x,y:close.y,transformOrigin:close.origin});
 gsap.set(quote.words,{yPercent:115,opacity:0});gsap.set(paragraph.lines,{yPercent:110,opacity:0});
 gsap.set(coins,{x:-100,rotation:-110,opacity:0});gsap.set($('.about-ticket'),{y:-70,opacity:0,scale:1.1});
 let live=false,disposed=false,blinkTimer;const tweens=[],events=[];
 const on=(node,name,fn)=>{node.addEventListener(name,fn);events.push(()=>node.removeEventListener(name,fn));};
 const idle=gsap.timeline({paused:true,repeat:-1,yoyo:true}).to($('[data-idle="breath"]'),{scaleY:1.01,svgOrigin:'300 595',duration:1.6,ease:'sine.inOut'},0).to(layer('ground-shadow'),{scaleX:1.05,svgOrigin:'300 856',duration:1.6,ease:'sine.inOut'},0);
 const rayTurn=gsap.to($('.about-rays'),{rotation:360,duration:100,repeat:-1,ease:'none',paused:true});
 const stamp=gsap.to($('.about-stamp'),{rotation:360,duration:30,repeat:-1,ease:'none',paused:true});
 const wave=gsap.timeline({paused:true,repeat:-1,repeatDelay:6.5}).to($('[data-idle="wave"]'),{attr:{transform:'rotate(-8)'},duration:.3,ease:'sine.inOut'}).to($('[data-idle="wave"]'),{attr:{transform:'rotate(7)'},duration:.3,yoyo:true,repeat:2,ease:'sine.inOut'}).to($('[data-idle="wave"]'),{attr:{transform:'rotate(0)'},duration:.3});
 const blink=()=>{if(disposed||liteMode)return;if(live)tweens.push(gsap.to(eyes,{scaleY:.06,transformOrigin:'50% 50%',duration:.09,repeat:1,yoyo:true}));blinkTimer=gsap.delayedCall(gsap.utils.random(3,6),blink);};if(!liteMode)blinkTimer=gsap.delayedCall(4,blink);
 const gaze={x:0,y:0};const gx=gsap.quickTo(gaze,'x',{duration:.35,ease:'power3.out'}),gy=gsap.quickTo(gaze,'y',{duration:.35,ease:'power3.out'});
 const gazeTick=()=>{if(live)pupils.forEach(p=>{p.style.translate=`${gaze.x}px ${gaze.y}px`;});};if(!liteMode)gsap.ticker.add(gazeTick);
 const tiltState={rotation:0};
 const neckTilt=gsap.quickTo(tiltState,'rotation',{duration:.4,ease:'power3.out',onUpdate:()=>{$('[data-idle="head-tilt"]').setAttribute('transform',`rotate(${tiltState.rotation} 300 363)`);}});
 const point=$('[data-idle="point"]');
 const tl=gsap.timeline({paused:true,defaults:{ease:'power3.inOut',immediateRender:false}});
 // 0–.55: readable whole words inhale; no per-character squiggles.
 tl.to(badge,{scaleX:1.08,scaleY:.9,duration:.25,ease:'power2.in'},0).to(badge,{scaleX:1,scaleY:1,duration:.3,ease:'back.out(1.7)'},.25);
 words.forEach((word,i)=>tl.to(word,{motionPath:{path:inhalePaths[i],curviness:1.25},scale:.08,opacity:0,duration:.65,ease:'power3.in'},i*.04));
 tl.to(headline.querySelectorAll('h2>span'),{x:-20,duration:.65},0).to(headline.querySelectorAll('h2>span'),{opacity:0,duration:.4},.28).to(headline.querySelectorAll('.next-content>p,.next-content>a'),{opacity:0,duration:.4},0);
 // .30–1.15: full amber iris from the exact fixed badge center. Sun is a narrow leading edge.
 tl.to(iris,{clipPath:()=>`circle(${Math.hypot(innerWidth,innerHeight)*1.05}px at ${irisCenter()})`,duration:.85,ease:'power4.inOut'},.3).to(field,{scale:1,duration:.3},.95).to(ring,{opacity:0,duration:.25},1.05).to(badge,{opacity:0,duration:.25},.8);
 // .85–1.85: continuous scale-in, blink and glance. No frozen close-up hold.
 tl.to($('.about-theatre'),{opacity:1,duration:.25},.85).to(camera,{scale:close.scale,duration:.9,ease:'sine.inOut'},.9).to(eyes,{scaleY:.06,transformOrigin:'50% 50%',duration:.13,repeat:1,yoyo:true},1.05).to(pupils,{x:-10,y:7,duration:.3},1.12).to(pupils,{x:10,y:0,duration:.3,ease:'expo.out'},1.45).to(pupils,{x:0,y:0,duration:.3},1.75);
 // 1.65–3.05: camera pulls back continuously; connected body rises beneath the neck.
 tl.to(camera,{scale:1,x:0,y:0,duration:1.4,ease:'power3.inOut'},1.65).to(layer('body-reveal'),{opacity:1,duration:.35,ease:'power3.out'},1.9);
 // 2.85–3.65: front → 3/4 → profile. Never flatter than 0.65 of the rig width.
 tl.to(rig,{scaleX:.65,skewY:2,transformOrigin:'50% 50%',duration:.4},2.85).set($('[data-view="front"]'),{opacity:0},3.04).set($('[data-view="three-quarter"]'),{opacity:1},3.04).set($('[data-view="three-quarter"]'),{opacity:0},3.27).set($('[data-view="profile"]'),{opacity:1},3.27).set($('[data-view="band-front"]'),{opacity:0},3.27).set($('[data-view="band-profile"]'),{opacity:1},3.27).set($('[data-view="torso-front"]'),{opacity:0},3.27).set($('[data-view="torso-profile"]'),{opacity:1},3.27).to(rig,{scaleX:1,skewY:0,duration:.4,ease:'back.out(1.7)'},3.25);
 // 3.35–4.45: axis-aligned inset with round top corners. No point-order morph or rotated quadrilateral.
 const archClip=()=>mobile?'inset(4vh 16vw 66vh 16vw round 34vw 34vw 0px 0px)':'inset(19vh 59vw 10vh 5vw round 18vw 18vw 0px 0px)';
 tl.to(field,{clipPath:archClip,duration:1.05,ease:'power4.inOut'},3.35).to(curtains,{scaleX:1,duration:.7,stagger:.06,ease:'power4.inOut'},3.4).to([$('.about-stage-arch'),$('.about-ray-window'),$('.about-ground')],{opacity:1,duration:.35},4.05).to($('.about-stage-caption'),{opacity:1,duration:.35},4.3).to($('.about-scroll-cue'),{opacity:1,duration:.35},4.5);
 const walk=(start,duration,steps,exit=false)=>{
  for(let s=0;s<steps;s++){const at=start+s*duration/steps,d=duration/steps;
   tl.to(joint('near-hip'),{attr:{transform:`rotate(${s%2?13:-13})`},duration:d,ease:'sine.inOut'},at).to(joint('far-hip'),{attr:{transform:`rotate(${s%2?-13:13})`},duration:d,ease:'sine.inOut'},at).to(joint('near-knee'),{attr:{transform:`rotate(${s%2?0:22})`},duration:d*.5,repeat:1,yoyo:true,ease:'sine.inOut'},at).to(joint('far-knee'),{attr:{transform:`rotate(${s%2?22:0})`},duration:d*.5,repeat:1,yoyo:true,ease:'sine.inOut'},at).to($('.about-character-hop'),{y:-6,duration:d*.5,repeat:1,yoyo:true,ease:'sine.inOut'},at);
  }
  tl.to([joint('near-hip'),joint('far-hip'),joint('near-knee'),joint('far-knee')],{attr:{transform:'rotate(0)'},duration:.25},start+duration);
 };
 if(!mobile)walk(3.4,.9,3);
 // 4.15–4.95: letter drop stays inside its own bowl mask; tail points toward the mouth.
 tl.to(bubble,{scale:1,rotation:0,duration:.65,ease:'elastic.out(1,.5)'},4.15).to(split.chars,{yPercent:0,scaleY:1,opacity:1,duration:.4,stagger:.045,ease:'back.out(1.7)'},4.3).to(joint('neck'),{attr:{transform:'rotate(4)'},duration:.2,repeat:3,yoyo:true},4.25);
 // Beat A 4.75–6.60: one short human paragraph. Nothing pans or exits through the top.
 tl.to(beatA,{opacity:1,duration:.35},4.75).fromTo($('.about-eyebrow'),{y:20},{y:0,duration:.5,ease:'expo.out'},4.75).fromTo($('.about-eyebrow i'),{scaleX:0},{scaleX:1,duration:.5},4.8).to(quote.words,{yPercent:0,opacity:1,duration:.5,stagger:.025,ease:'expo.out'},4.8).to(paragraph.lines,{yPercent:0,opacity:1,duration:.5,stagger:.04,ease:'expo.out'},5.15).to(joint('neck'),{attr:{transform:'rotate(-2)'},duration:.5},5.8);
 // Beat B replaces A through a mask/short settle, with equal safe-area padding.
 tl.to(beatA,{clipPath:'inset(0 0 100% 0)',opacity:0,duration:.5},6.25).fromTo(beatB,{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',opacity:1,duration:.5},6.45).to(point,{attr:{transform:'rotate(-12)'},duration:.5},6.45);
 coins.forEach((coin,i)=>{const n=coin.querySelector('.about-count'),v={number:0};tl.to(coin,{x:0,rotation:0,opacity:1,duration:.65,ease:'back.out(1.7)'},6.55+i*.1).to(v,{number:+n.dataset.value,duration:.65,ease:'power2.out',onUpdate:()=>n.textContent=Math.round(v.number)},6.55+i*.1);});
 stickers.forEach((sticker,i)=>tl.fromTo(sticker,{opacity:0,scale:.5},{opacity:1,scale:1,rotation:[-2,2,-1,3,-3,1,-2][i],motionPath:{path:stickerPaths[i],curviness:1.2},duration:.65,ease:'back.out(1.7)'},7+i*.045));
 tl.to($('.about-ticket'),{y:0,scale:1,opacity:1,duration:.5,ease:'back.out(1.7)'},7.55).to(joint('neck'),{attr:{transform:'rotate(2)'},duration:.45},7.7);
 // 8.20–9.60: hinge tip, whole skeleton exits in four connected steps, midnight rises.
 tl.to(bubble,{scale:0,opacity:0,duration:.4,ease:'back.in(1.7)'},8.25).to(joint('headband-hinge'),{attr:{transform:'rotate(-8)'},duration:.25,repeat:1,yoyo:true},8.15);
 walk(8.45,.9,4,true);
 tl.to(camera,{x:()=>innerWidth*.8,duration:1.05,ease:'power2.in'},8.45).to($('.about-exit'),{clipPath:'inset(0% 0 0 0)',duration:.8,ease:'power4.inOut'},8.7).to($('.about-scroll-cue'),{opacity:0,duration:.3},8.6).to(badge,{opacity:1,duration:.25},9.35).to({}, {duration:.1},9.5);
 const sync=(time,active)=>{
  const next=active&&time>=3.8&&time<8.5&&!document.hidden;
  if(next!==live){live=next;[idle,rayTurn,stamp,wave].forEach(t=>live&&!liteMode?t.resume():t.pause());}
  beatA.inert=time<4.75||time>6.7;beatB.inert=time<6.45||time>8.8;
  $('.about-character-button').disabled=!live;
  const beat=time<4.75?'stage':time<6.45?'a':time<8.7?'b':'exit';
  if(root.dataset.beat!==beat) root.dataset.beat=beat;
  camera.style.willChange=active&&time<4.5?'transform':'';
 };
 on(document,'visibilitychange',()=>sync(tl.time(),true));
 on(window,'pointermove',event=>{if(!live||event.pointerType==='touch')return;const m=rig.getScreenCTM();if(!m)return;const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(m.inverse()),dx=p.x-343,dy=p.y-215,l=Math.hypot(dx,dy)||1,r=Math.min(10,l/20);gx(dx/l*r);gy(dy/l*r);});
 on(document,'pointerleave',()=>{gx(0);gy(0);});
 [...coins,...stickers].forEach((item,i)=>{on(item,'pointerenter',()=>{tweens.push(gsap.to(point,{attr:{transform:`rotate(${-12-i*1.5})`},duration:.3,overwrite:'auto'}));});on(item,'pointerleave',()=>tweens.push(gsap.to(point,{attr:{transform:'rotate(-12)'},duration:.3,overwrite:'auto'})));});
 on($('.about-character-button'),'click',()=>{if(!live)return;tweens.push(gsap.timeline().to($('.about-character-hop'),{y:-14,duration:.2,ease:'power2.out'}).to($('.about-character-hop'),{y:0,duration:.25,ease:'bounce.out'}));});
 if(import.meta.env.DEV)root.__aboutMotion={timeline:tl};
 return {timeline:tl,sync,velocity:v=>neckTilt(gsap.utils.clamp(-2,2,v/1800)),dispose:()=>{disposed=true;blinkTimer?.kill();[idle,rayTurn,stamp,wave,...tweens].forEach(t=>t.kill());[gx,gy,neckTilt].forEach(f=>f.tween.kill());gsap.ticker.remove(gazeTick);events.forEach(f=>f());[split,quote,paragraph].forEach(s=>s.revert());camera.style.removeProperty('will-change');pupils.forEach(p=>p.style.removeProperty('translate')); $('[data-idle="head-tilt"]').removeAttribute('transform');delete root.__aboutMotion;delete document.body.dataset.storyBadge;}};
}
