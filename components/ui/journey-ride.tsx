import React,{useLayoutEffect,useRef,useId} from 'react';
import { sceneReady } from '../../src/scroll-ready';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {checkpoints as defaultCheckpoints,type JourneyCheckpoint} from './journey-checkpoints';
import {JourneyVehicleArt,type JourneyVehicle} from './journey-vehicle';
import {NightStars,NightCloud,NightLamp,NightHills,NightRoad,NightFinish} from './night-scenery';
import './journey-ride.css';
import { mobileMode } from '../../src/mobile-mode';
gsap.registerPlugin(ScrollTrigger);

// Scroll distances are viewport heights. No per-checkpoint timing is hard-coded.
export const INTRO=60,TRAVEL=80,DWELL=60,OUTRO=60;
export const MOBILE_TRAVEL=70,MOBILE_DWELL=50,SNAP=true;
export function journeySchedule(count:number,mobile=false){
  const travel=mobile?MOBILE_TRAVEL:TRAVEL,dwell=mobile?MOBILE_DWELL:DWELL;
  return {travel,dwell,total:INTRO+count*(travel+dwell)+OUTRO};
}
type RoadSample={y:number;angle:number};
type RideHandle={jump:(label:string)=>void};

function CheckpointIcon({icon}:{icon:JourneyCheckpoint['icon']}){
  if(icon==='trophy'||icon==='medal')return <g fill="none" stroke="var(--ride-bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
   {icon==='trophy'?<><path d="M27 25H53V37Q53 49 40 49Q27 49 27 37Z" fill="var(--ride-cream)"/><path d="M27 29H19V34Q19 43 29 43M53 29H61V34Q61 43 51 43M40 49V58M30 59H50"/></>:<><path d="M25 22H36L44 39L34 43ZM44 22H55L46 43L36 39Z" fill="var(--ride-cream)"/><circle cx="40" cy="49" r="14" fill="var(--ride-cream)"/><path d="M40 41L42 46L48 47L44 51L45 57L40 54L35 57L36 51L32 47L38 46Z" fill="var(--ride-bg)" strokeWidth="1"/></>}
  </g>;
  return <g fill="none" stroke="var(--ride-bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    {icon==='school'?<><path d="M21 26Q30 22 40 29Q50 22 59 26V51Q50 47 40 54Q30 47 21 51Z" fill="var(--ride-cream)"/><path d="M40 29V54M27 34L34 36M46 36L53 34"/></>:icon==='cap'?<><path d="M16 34L40 23L64 34L40 45Z" fill="var(--ride-cream)"/><path d="M25 39V49Q40 59 55 49V39M64 34V53"/></>:<><path d="M22 24H58V48H22Z" fill="var(--ride-cream)"/><path d="M17 49H63L58 55H22Z" fill="var(--ride-cream)"/><path d="M28 31H52V42H28Z"/></>}
  </g>;
}

function Marker({icon}:{icon:JourneyCheckpoint['icon']}){
 return <><div className="ride-ground-ring" aria-hidden="true"/>
  <svg className="ride-marker" viewBox="0 0 80 160" aria-hidden="true"><path className="ride-post" d="M40 156V48" stroke="var(--ride-cream)" strokeWidth="2"/></svg>
  <div className="ride-flag" aria-hidden="true"><svg viewBox="0 0 36 26"><path d="M0 0H33L25 13L33 26H0Z" fill="var(--ride-amber)"/></svg></div>
  <div className="checkpoint-badge" aria-hidden="true"><svg viewBox="0 0 80 80"><circle cx="40" cy="39" r="33" fill="var(--ride-amber)" stroke="var(--ink)" strokeWidth="3"/><CheckpointIcon icon={icon}/></svg></div>
 </>;
}

export function JourneyRide({vehicle='auto',checkpoints=defaultCheckpoints}:{vehicle?:JourneyVehicle;checkpoints?:JourneyCheckpoint[]}){
 const ref=useRef<HTMLElement>(null),control=useRef<RideHandle|null>(null);
 const roadId=`ride-road-${useId().replace(/:/g,'')}`;
 useLayoutEffect(()=>{
  const root=ref.current!;let disposed=false;
  const ctx=gsap.context(()=>{
   const mm=gsap.matchMedia();
   mm.add({mobile:'(max-width:639px)',desktop:'(min-width:640px)',reduce:'(prefers-reduced-motion:reduce)'},media=>{
    const mobile=mobileMode,reduced=!!media.conditions!.reduce;
    const $=<T extends Element=HTMLElement>(s:string)=>root.querySelector<T>(s)!;
    const $$=<T extends Element=HTMLElement>(s:string)=>Array.from(root.querySelectorAll<T>(s));
    const cards=$$('.ride-card'),items=$$('.ride-checkpoint');
    if(reduced){
     const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){gsap.to(entry.target,{opacity:1,duration:.25,overwrite:true});observer.unobserve(entry.target);}}),{threshold:.15});
     gsap.set(cards,{opacity:.55});cards.forEach(c=>observer.observe(c));
     root.dataset.motion='reduced';
     sceneReady('ride');
     return()=>{observer.disconnect();gsap.killTweensOf(cards);delete root.dataset.motion;};
    }
    if (mobile) {
      const stage = $('.journey-stage'), world = $('.world'), vehicleNode = $('.vehicle');
      const hud = document.createElement('div'); hud.className = 'ride-mobile-hud'; stage.append(hud);
      const homes = cards.map(card => ({ card, parent: card.parentElement! }));
      cards.forEach(card => hud.append(card));
      const dots = $$('.ride-progress-dot'), road = $<SVGPathElement>('[data-road-path]');
      const wheels = $$<SVGGElement>('.ride-wheel');
      const state = { distance: 0 };
      const timeline = gsap.timeline({ paused: true });
      const measure = () => {
        const w = stage.clientWidth, h = stage.clientHeight;
        world.style.width = `${w * (checkpoints.length + 2)}px`;
        $$<SVGSVGElement>('.world > svg').forEach(svg => svg.setAttribute('viewBox', `0 0 ${w * (checkpoints.length + 2)} ${h}`));
        road.setAttribute('d', `M0 ${h * .62}H${w * (checkpoints.length + 2)}`);
        $<SVGPathElement>('[data-hills]').setAttribute('d', `M0 ${h*.7}Q${w} ${h*.5} ${w*2} ${h*.7}H${w*(checkpoints.length+2)}V${h}H0Z`);
        gsap.set(vehicleNode, { left: w * .3, xPercent: -50, y: h * .62 - vehicleNode.clientWidth * 218 / 360 });
      };
      measure();
      gsap.set(cards, { autoAlpha: 0, y: 12, x: 0, xPercent: -50 });
      checkpoints.forEach((_, i) => {
        const at = i * 120 + MOBILE_TRAVEL;
        timeline.to(state, { distance: i + 1, duration: MOBILE_TRAVEL, ease: 'none' }, i * 120)
          .to(cards[i], { autoAlpha: 1, y: 0, duration: 6 }, at)
          .to(cards[i], { autoAlpha: 0, y: -10, duration: 5 }, at + MOBILE_DWELL - 5);
      });
      const render = () => {
        const time = timeline.time(), index = Math.min(checkpoints.length - 1, Math.floor(time / 120));
        gsap.set(world, { x: -state.distance * stage.clientWidth * .8 });
        wheels.forEach(wheel => gsap.set(wheel, { rotation: state.distance * 360, svgOrigin: wheel.dataset.pivot }));
        cards.forEach((card, i) => { card.inert = i !== index || time % 120 < MOBILE_TRAVEL; });
        dots.forEach((dot, i) => { dot.dataset.active = String(i === index); dot.dataset.visited = String(i < index); });
        $('.progress').setAttribute('aria-valuenow', String(Math.round(timeline.progress() * 100)));
      };
      timeline.eventCallback('onUpdate', render);
      const trigger = ScrollTrigger.create({ id: 'journey-ride', trigger: root, animation: timeline,
        start: 'top top', end: () => `+=${stage.clientHeight * checkpoints.length * 1.2}`,
        pin: stage, pinType: 'transform', pinSpacing: true, scrub: true, invalidateOnRefresh: true,
        onRefreshInit: measure, onRefresh: render,
        onToggle: self => { world.style.willChange = self.isActive ? 'transform' : ''; } });
      render(); sceneReady('ride');
      return () => { trigger.kill(); homes.forEach(({ card, parent }) => { parent.append(card); card.inert = false; }); hud.remove(); world.style.removeProperty('will-change'); };
    }
    const stage=$('.journey-stage'),world=$('.world'),far=$('.ride-far'),mid=$('.ride-mid');
    const title=$('.journey-title'),hint=$('.ride-hint'),arrow=$('.ride-hint span');
    const bike=$('.vehicle'),lean=$(vehicle==='auto'?'.auto-lean':'.vehicle-lean'),bob=$(vehicle==='auto'?'.auto-bob':'.vehicle-bob');
    const wave=root.querySelector('.auto-wave');
    const wheels=$$<SVGGElement>('.ride-wheel'),puffs=$$('.ride-puffs i');
    const rings=$$('.ride-ground-ring'),flags=$$('.ride-flag'),badges=$$('.checkpoint-badge');
    const ruler=$('.progress'),fill=$('.ride-progress-fill'),dots=$$('.ride-progress-dot');
    const debug=$<HTMLElement>('.ride-debug'),debugOutput=$<HTMLOutputElement>('.ride-debug output');
    const road=$<SVGPathElement>('[data-road-path]');
    const schedule=journeySchedule(checkpoints.length,mobile);
    const state={distance:0,exit:0,bob:0};
    const geo={w:0,h:0,world:0,segment:0,anchor:0,markerScreen:0,wheelRadius:1,contact:0,scale:1,wheelbase:0,rear:0,front:0,titleX:0,titleY:0,table:[] as RoadSample[],markers:[] as number[]};
    const sampleRoad=(x:number):RoadSample=>{
     const n=Math.max(0,Math.min(geo.table.length-1.001,x/4)),i=Math.floor(n),f=n-i;
     const a=geo.table[i]||{y:0,angle:0},b=geo.table[i+1]||a;
     return {y:a.y+(b.y-a.y)*f,angle:a.angle+(b.angle-a.angle)*f};
    };
    const measure=()=>{
     geo.w=stage.clientWidth;geo.h=stage.clientHeight;geo.anchor=geo.w*.3;
     geo.markerScreen=geo.w*(mobile?.65:.62);geo.segment=geo.w*.9;
     geo.markers=checkpoints.map((_,i)=>geo.markerScreen+(i+1)*geo.segment);
     geo.world=geo.markerScreen+checkpoints.length*geo.segment+geo.w*1.5;
     world.style.width=`${geo.world}px`;
     $$<SVGSVGElement>('.world > svg').forEach(svg=>svg.setAttribute('viewBox',`0 0 ${geo.world} ${geo.h}`));
     $$<SVGSVGElement>('[data-ride-cloud]').forEach((cloud,i)=>{cloud.setAttribute('x',String(geo.w*(.12+i*.57)));cloud.setAttribute('width',mobile?'110':'180');cloud.setAttribute('height',mobile?'37':'60');});
     const base=geo.h*(mobile?(geo.h<700?.38:.43):.76),amp=Math.min(18,geo.h*.018,geo.w*.012),freq=2*Math.PI/(geo.segment*2);
     const y=(x:number)=>base+amp*Math.sin(x*freq),slope=(x:number)=>amp*freq*Math.cos(x*freq);
     let d=`M0 ${y(0)}`;
     const step=geo.segment/2;
     for(let x=0;x<geo.world;x+=step){const end=Math.min(geo.world,x+step),dx=end-x;d+=` C${x+dx/3} ${y(x)+slope(x)*dx/3} ${end-dx/3} ${y(end)-slope(end)*dx/3} ${end} ${y(end)}`;}
     road.setAttribute('d',d);
     const length=road.getTotalLength(),arc=[];
     for(let s=0;s<length;s+=4){const p=road.getPointAtLength(s);arc.push({x:p.x,y:p.y});}
     const last=road.getPointAtLength(length);arc.push({x:last.x,y:last.y});
     // Arc-length samples -> uniform 4px world-x table. All path reads stop here.
     geo.table=[];let j=0;
     for(let x=0;x<=geo.world+4;x+=4){
      while(j<arc.length-2&&arc[j+1].x<x)j++;
      const a=arc[j],b=arc[j+1],f=Math.max(0,Math.min(1,(x-a.x)/(b.x-a.x||1)));
      geo.table.push({y:a.y+(b.y-a.y)*f,angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI});
     }
     items.forEach((item,i)=>{item.style.left=`${geo.markers[i]}px`;item.style.top=`${sampleRoad(geo.markers[i]).y}px`;});
     const hillY=(x:number)=>geo.h*.68+geo.h*.075*Math.sin(x*freq*.9);
     const hillSlope=(x:number)=>geo.h*.075*freq*.9*Math.cos(x*freq*.9);
     let hills=`M0 ${hillY(0)}`;
     for(let x=0;x<geo.world;x+=step){const end=Math.min(geo.world,x+step),dx=end-x;hills+=` C${x+dx/3} ${hillY(x)+hillSlope(x)*dx/3} ${end-dx/3} ${hillY(end)-hillSlope(end)*dx/3} ${end} ${hillY(end)}`;}
     hills+=` L${geo.world} ${geo.h}H0Z`;$<SVGPathElement>('[data-hills]').setAttribute('d',hills);
     $$<SVGGElement>('[data-scenery]').forEach((g,i)=>{const x=(i+.45)*geo.world/Math.max(1,checkpoints.length*2+3);g.setAttribute('transform',`translate(${x} ${sampleRoad(x).y-40})`);});
     const drawingWidth=vehicle==='auto'||vehicle==='car'?360:300;
     geo.scale=bike.clientWidth/drawingWidth;
     geo.wheelRadius=(vehicle==='auto'?30:32)*geo.scale;
     geo.contact=(vehicle==='auto'?218:244)*geo.scale;
     // Contact coordinates relative to the SVG's bottom-center pose origin.
     geo.rear=(vehicle==='auto'?70-181:105-(vehicle==='car'?215:210))*geo.scale;
     geo.front=(vehicle==='auto'?292-181:315-(vehicle==='car'?215:210))*geo.scale;
     geo.wheelbase=geo.front-geo.rear;
     geo.anchor=geo.markerScreen-geo.w*.05-geo.front;
     bike.style.left=`${geo.anchor}px`;
     geo.titleX=(geo.w-title.offsetWidth)/2-title.offsetLeft;
     geo.titleY=geo.h*(mobile&&geo.h<700?.16:geo.h<500?.2:mobile?.24:.34)-title.offsetHeight/2-title.offsetTop;
    };
    measure();
    // Each property has one owner: pose is derived here, authored entrances below.
    const setWorld=gsap.quickSetter(world,'x','px'),setFar=gsap.quickSetter(far,'x','px'),setMid=gsap.quickSetter(mid,'x','px');
    const setX=gsap.quickSetter(bike,'x','px'),setY=gsap.quickSetter(bike,'y','px'),setAngle=gsap.quickSetter(bike,'rotation','deg');
    const setBob=gsap.quickSetter(bob,'y','px'),setFill=gsap.quickSetter(fill,'scaleX');
    gsap.set(bike,{xPercent:vehicle==='auto'?-181/360*100:-50,x:0,y:sampleRoad(geo.anchor).y-geo.contact,rotation:sampleRoad(geo.anchor).angle});
    gsap.set([world,far,mid],{x:0});gsap.set(bob,{y:0});gsap.set(lean,{rotation:0,scaleX:1});
    gsap.set(title,{x:()=>geo.titleX,y:()=>geo.titleY,scale:1,transformOrigin:'0 0'});
    gsap.set(hint,{opacity:1});gsap.set(arrow,{y:0});
    gsap.set(cards,{opacity:0,y:30,scale:.92,xPercent:-50});
    gsap.set(rings,{scale:.6,opacity:.6,xPercent:-50,transformOrigin:'50% 50%'});
    flags.forEach(flag=>gsap.set(flag,{rotation:0,transformOrigin:'0 50%'}));
    badges.forEach(badge=>gsap.set(badge,{x:0,y:0,scale:.7,opacity:.65,transformOrigin:'50% 50%'}));
    wheels.forEach(wheel=>gsap.set(wheel,{rotation:0,svgOrigin:wheel.dataset.pivot}));
    const spin=wheels.map(w=>gsap.quickSetter(w,'rotation','deg'));
    if(wave)gsap.set(wave,{svgOrigin:'185 119',rotation:0});
    const setWave=wave?gsap.quickSetter(wave,'rotation','deg'):null;
    gsap.set(puffs,{x:0,y:0,scale:.3,opacity:0});gsap.set(fill,{scaleX:0});
    const phases:{label:string;start:number;end:number;index:number;moving:boolean}[]=[];
    let timeline:gsap.core.Timeline,trigger:ScrollTrigger,lastLabel='',lastPercent=-1;
    const render=()=>{
     if(!timeline)return;
     const t=timeline.time(),distance=state.distance+state.exit,center=geo.anchor+distance;
     let angle=0,rear=sampleRoad(center+geo.rear),front=sampleRoad(center+geo.front);
     // Resolve the projected wheelbase against the same road lookup table.
     for(let i=0;i<4;i++){
      angle=Math.atan2(front.y-rear.y,geo.wheelbase*Math.cos(angle));
      rear=sampleRoad(center+geo.rear*Math.cos(angle));
      front=sampleRoad(center+geo.front*Math.cos(angle));
     }
     setWorld(-state.distance);setFar(state.distance*.8);setMid(state.distance*.5);
     setX(state.exit);setY((rear.y+front.y)/2-geo.contact);setAngle(angle*180/Math.PI);
     spin.forEach((set,i)=>set(distance/(Number(wheels[i].dataset.radius)*geo.scale)*180/Math.PI));
     setBob(Math.sin(distance/18)*state.bob);
     const progress=checkpoints.length?state.distance/(checkpoints.length*geo.segment):1;setFill(progress);
     const phase=phases.find(p=>t>=p.start&&t<p.end)||phases[phases.length-1];
     const label=phase?.label||'intro',active=phase?.index??-1;
     const parked=!!phase&&!phase.moving&&phase.index>=0;
     root.dataset.parked=String(parked);
     root.dataset.traveling=String(!!phase?.moving);
     if(setWave){
      const stopProgress=parked?(t-phase!.start)/(phase!.end-phase!.start):0;
      setWave(parked?12*Math.sin(stopProgress*Math.PI*2)*Math.sin(stopProgress*Math.PI):0);
     }
     if(lastLabel!==label){
      lastLabel=label;root.dataset.label=label;
      dots.forEach((dot,i)=>{dot.dataset.active=String(i===active);dot.dataset.visited=String(i<active);});
      items.forEach((item,i)=>{if(i===active)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
     }
     const percent=Math.round(progress*100);if(percent!==lastPercent){lastPercent=percent;ruler.setAttribute('aria-valuenow',String(percent));}
     if(!debug.hidden)debugOutput.textContent=`${(timeline.progress()*100).toFixed(1)}% · ${label}\nWorld x: ${(geo.anchor+distance).toFixed(1)}px\nScrollTriggers: ${ScrollTrigger.getAll().length} (ride: 1)`;
    };
    timeline=gsap.timeline({paused:true,defaults:{ease:'none',immediateRender:false},onUpdate:render});
    timeline.addLabel('intro',0).set(state,{distance:0,exit:0,bob:0},'intro')
     .set(title,{x:()=>geo.titleX,y:()=>geo.titleY,scale:1},'intro')
     .to(title,{x:0,y:0,scale:.28,duration:INTRO*.85,ease:'power2.inOut'},'intro')
     .to(hint,{opacity:0,duration:INTRO*.6},'intro')
     .to(arrow,{y:8,duration:INTRO*.1,repeat:5,yoyo:true,ease:'sine.inOut'},'intro');
    phases.push({label:'intro',start:0,end:INTRO,index:-1,moving:false});
    const puff=(at:string,span:number)=>{
     timeline.set(puffs,{x:0,y:0,scale:.3,opacity:.5},at)
      .to(puffs,{x:-24,y:(_,el)=>-12-Array.from(puffs).indexOf(el)*5,scale:1.2,opacity:0,duration:span,ease:'power1.out',stagger:span*.08},at);
    };
    checkpoints.forEach((_,i)=>{
     const start=INTRO+i*(schedule.travel+schedule.dwell),arrive=start+schedule.travel;
     const travel=`travel-${i+1}`,arrival=`arrive-${i+1}`,stop=`stop-${i+1}`;
     timeline.addLabel(travel,start).addLabel(arrival,arrive).addLabel(stop,arrive+schedule.dwell*.26);
     phases.push({label:travel,start,end:arrive,index:i-1,moving:true},{label:stop,start:arrive,end:arrive+schedule.dwell,index:i,moving:false});
     timeline.to(state,{distance:()=>geo.segment*(i+1),duration:schedule.travel,ease:'power1.inOut'},travel)
      .to(state,{bob:1.5,duration:schedule.travel*.1,ease:'power1.out'},travel)
      .to(state,{bob:0,duration:schedule.travel*.1,ease:'power1.in'},`${travel}+=${schedule.travel*.9}`)
      .to(lean,{rotation:2,duration:schedule.travel*.1,ease:'power1.out'},travel)
      .to(lean,{rotation:0,duration:schedule.travel*.12},`${travel}+=${schedule.travel*.1}`)
      .to(lean,{rotation:-2,scaleX:.97,duration:schedule.travel*.1,ease:'power1.in'},`${travel}+=${schedule.travel*.9}`)
      .to(lean,{rotation:0,scaleX:1,duration:schedule.dwell*.12,ease:'power1.out'},arrival)
      .to(cards[i],{opacity:1,y:0,scale:1,duration:schedule.dwell*.22,ease:'back.out(1.4)'},arrival)
      .to(badges[i],{scale:1,opacity:1,duration:schedule.dwell*.22,ease:'back.out(1.4)'},arrival)
      .to(rings[i],{scale:2.4,opacity:0,duration:schedule.dwell,ease:'none'},arrival)
      .to(flags[i],{rotation:6,duration:schedule.dwell*.12,ease:'sine.inOut'},arrival)
      .to(flags[i],{rotation:-6,duration:schedule.dwell*.24,repeat:1,yoyo:true,ease:'sine.inOut'},`${arrival}+=${schedule.dwell*.12}`)
      .to(flags[i],{rotation:0,duration:schedule.dwell*.12,ease:'sine.inOut'},`${arrival}+=${schedule.dwell*.6}`);
     if(i>0)timeline.to(cards[i-1],{opacity:.35,scale:.96,y:-6,duration:schedule.dwell*.18},arrival);
     puff(travel,schedule.travel*.12);puff(arrival,schedule.dwell*.18);
    });
    const outroStart=schedule.total-OUTRO;timeline.addLabel('outro',outroStart);
    phases.push({label:'outro',start:outroStart,end:schedule.total+1,index:checkpoints.length-1,moving:true});
    timeline.to(state,{exit:()=>geo.w*1.2-geo.anchor,duration:OUTRO,ease:'power1.in'},'outro')
     .to(state,{bob:1.5,duration:OUTRO*.1},'outro');
    puff('outro',OUTRO*.15);
    // Lenis already owns smooth scrolling. Its dwell zones are retained without
    // adding a competing snap animation to the same physical scroll position.
    const hasLenis=document.documentElement.classList.contains('lenis');
    const stops=checkpoints.map((_,i)=>timeline.labels[`stop-${i+1}`]/schedule.total);
    trigger=ScrollTrigger.create({id:'journey-ride',trigger:root,animation:timeline,start:'top top',
     end:()=>`+=${innerHeight*schedule.total/100}`,pin:stage,pinType:'transform',pinSpacing:true,scrub:.4,anticipatePin:1,invalidateOnRefresh:true,
     onRefreshInit:measure,onRefresh:render,onToggle:self=>{root.dataset.active=String(self.isActive);},
     snap:SNAP&&!hasLenis?{snapTo:stops,directional:true,duration:{min:.2,max:.6},delay:.12,ease:'power1.inOut',inertia:false}:false,
    });
    const seek=(time:number)=>{
     const y=trigger.start+(trigger.end-trigger.start)*time/schedule.total;
     window.dispatchEvent(new CustomEvent('journey-debug-jump',{detail:y}));
     if(!document.documentElement.classList.contains('lenis'))window.scrollTo(0,y);
     ScrollTrigger.update();trigger.getTween()?.progress(1);timeline.time(time,false);render();
    };
    control.current={jump:label=>seek(timeline.labels[label]??0)};
    const sample=()=>({time:timeline.time(),progress:timeline.progress(),label:root.dataset.label,distance:state.distance,exit:state.exit,worldX:geo.anchor+state.distance+state.exit,
     moving:phases.find(p=>timeline.time()>=p.start&&timeline.time()<p.end)?.moving??false,totalVh:schedule.total,snapEnabled:SNAP&&!hasLenis,
     roadAngle:sampleRoad(geo.anchor+state.distance+state.exit).angle,wheelRadius:geo.wheelRadius,tableSize:geo.table.length});
    (root as any).__ride={timeline,trigger,seek,sample,phases,checkpoints,road:()=>geo.table};
    const key=(event:KeyboardEvent)=>{
     if(event.key.toLowerCase()!=='d'||event.repeat||event.metaKey||event.ctrlKey||event.altKey||(event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]'))return;
     const b=stage.getBoundingClientRect();if(b.bottom<=0||b.top>=innerHeight||Math.abs(b.top)>innerHeight*.6)return;
     event.stopImmediatePropagation();debug.hidden=!debug.hidden;render();
    };
    const visibility=()=>{root.dataset.paused=String(document.hidden);if(!document.hidden)render();};
    window.addEventListener('keydown',key,true);document.addEventListener('visibilitychange',visibility);
    const fonts=()=>{if(!disposed&&!document.documentElement.classList.contains('mobile'))ScrollTrigger.refresh();};document.fonts.ready.then(fonts);
    render();root.dataset.motion='ride';
    sceneReady('ride');
    return()=>{window.removeEventListener('keydown',key,true);document.removeEventListener('visibilitychange',visibility);control.current=null;delete(root as any).__ride;delete root.dataset.motion;delete root.dataset.parked;delete root.dataset.traveling;};
   });
   return()=>mm.revert();
  },root);
  return()=>{disposed=true;ctx.revert();};
 },[checkpoints,vehicle]);
 return <section ref={ref} id="my-journey-ride" className="journey ride-journey night-scene" aria-label="My journey" style={{'--checkpoint-count':checkpoints.length} as React.CSSProperties}>
  <div className="journey-stage">
   <div className="world">
    <svg className="ride-far" aria-hidden="true" preserveAspectRatio="none">
     <NightStars count={Math.max(16,checkpoints.length*10)}/>
     {[.14,.47,.8].map((x,i)=><NightCloud key={i} data-ride-cloud x={`${x*100}%`} y={`${19+i%2*9}%`} width="180" height="60"/>)}
    </svg>
    <svg className="ride-mid" aria-hidden="true" preserveAspectRatio="none"><NightHills data-hills/></svg>
    <svg className="ride-near" aria-hidden="true" preserveAspectRatio="none">
     {Array.from({length:checkpoints.length*2+3},(_,i)=><g key={i} data-scenery>
      {i%3===0?<NightLamp/>:i%3===1?<g><path d="M0 0V-68" stroke="var(--about-skin)" strokeWidth="4"/><path d="M0-149L-29-84H-15L-38-50H38L15-84H29Z" fill="var(--ride-road)" stroke="var(--about-skin)" strokeOpacity=".35" strokeWidth="1"/></g>:<g fill="none" stroke="var(--ride-cream)" strokeWidth="2"><path d="M0 0V-61"/><path d="M-19-62H21L29-53L21-44H-19Z" fill="var(--ride-road)"/></g>}
     </g>)}
    </svg>
    <svg className="ride-road" aria-hidden="true" preserveAspectRatio="none"><defs><path id={roadId} data-road-path/></defs><NightRoad href={`#${roadId}`}/></svg>
    <ol className="ride-checkpoints">
     {checkpoints.map(c=><li key={c.id} className="ride-checkpoint" data-checkpoint={c.id}>
      <Marker icon={c.icon}/>
      <article className="ride-card" aria-labelledby={`ride-${c.id}`}><span className="ride-card-dash" aria-hidden="true"/><p className="ride-card-label">{c.label}</p><h3 id={`ride-${c.id}`}>{c.title}</h3>
       {!!c.highlights?.length&&<dl className="ride-card-highlights">{c.highlights.map((item,i)=><div className="ride-card-highlight" key={`${item.label}-${i}`}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>}
       {c.period?.trim()&&<p className="ride-card-period">{c.period}</p>}{c.description?.trim()&&<p className="ride-card-description">{c.description}</p>}</article>
     </li>)}
    </ol>
   </div>
   <div className="vehicle" data-vehicle={vehicle} aria-hidden="true"><div className="vehicle-lean"><div className="vehicle-bob"><JourneyVehicleArt vehicle={vehicle}/></div></div>{vehicle!=='auto'&&<div className="ride-puffs">{[0,1,2].map(i=><i key={i} style={{left:-i*9,top:i%2*5}}/>)}</div>}</div>
   <NightFinish/>
   <h2 className="journey-title">MY JOURNEY</h2>
   <p className="ride-hint">Scroll to ride <span aria-hidden="true">↓</span></p>
   <div className="progress" role="progressbar" aria-label="Journey progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
    <svg className="ride-ticks" viewBox="0 0 1000 18" preserveAspectRatio="none" aria-hidden="true">{Array.from({length:81},(_,i)=><path key={i} d={`M${i*12.5} ${i%5===0?0:9}V18`} stroke="currentColor" strokeWidth=".7"/>)}</svg><div className="ride-progress-fill"/>
    {checkpoints.map((c,i)=><div key={c.id} className="ride-progress-dot" style={{left:`${(i+1)/checkpoints.length*100}%`}} aria-hidden="true"><span>{c.short??c.label}</span></div>)}
   </div>
   <aside className="ride-debug" aria-label="Journey debug controls" hidden><output/><div className="ride-debug-buttons"><button type="button" onClick={()=>control.current?.jump('intro')}>Start</button>{checkpoints.map((c,i)=><button key={c.id} type="button" onClick={()=>control.current?.jump(`stop-${i+1}`)}>Stop {i+1}</button>)}<button type="button" onClick={()=>control.current?.jump('outro')}>Outro</button><button type="button" onClick={()=>{const a=(ref.current as any)?.__ride;a?.seek(a.timeline.duration());}}>End</button></div></aside>
  </div>
 </section>;
}
