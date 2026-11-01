/** Focused acceptance checks supplement the full-page screenshot sweep. */
import{createRequire}from'node:module';import{writeFile}from'node:fs/promises';
import {chromium} from './playwright-runtime.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
for(const [width,height]of[[1470,769],[1920,1080],[390,844]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto((process.env.QA_URL||'http://127.0.0.1:5174')+'/?debug=1');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>!!document.querySelector('#about').__aboutMotion);await page.waitForTimeout(400);
 const measure=await page.evaluate(()=>{
  const a=document.querySelector('#about').__aboutMotion,pin=a.trigger,master=a.master,checks={pinCount:window.__scrollStoryQA.sample().pinned.length,headlineCount:document.querySelectorAll('.next-content,.about-intro-copy').length,badgeCount:document.querySelectorAll('#avatar-badge,.about-origin-badge').length,jointDrift:0,minimumRigScale:1,bodyTranslation:0,bubbleOverflow:false,overflow:false,beats:[]};
  for(let i=0;i<=100;i++){
   window.__scrollStoryQA.seek(pin.start+(pin.end-pin.start)*i/100);
   const rig=document.querySelector('.about-rig');const mat=getComputedStyle(rig).transform;if(mat!=='none'){const m=new DOMMatrix(mat);checks.minimumRigScale=Math.min(checks.minimumRigScale,Math.hypot(m.a,m.b));}
   document.querySelectorAll('[data-joint]').forEach(j=>{const m=j.transform.baseVal.consolidate()?.matrix;if(m)checks.jointDrift=Math.max(checks.jointDrift,Math.abs(m.e),Math.abs(m.f));});
   const body=document.querySelector('[data-layer="body-reveal"]');const m=new DOMMatrix(getComputedStyle(body).transform);checks.bodyTranslation=Math.max(checks.bodyTranslation,Math.abs(m.f));
   const bubble=document.querySelector('.about-bubble'),bb=bubble.getBoundingClientRect();if(+getComputedStyle(bubble).opacity>.05&&bb.width>10)checks.bubbleOverflow ||= bb.left<-.5||bb.right>innerWidth+.5||bb.top<-.5||bb.bottom>innerHeight+.5;
   checks.overflow ||= document.documentElement.scrollWidth>innerWidth;
  }
  for(const [time,selector]of[[8.8,'.about-beat-a'],[10.8,'.about-beat-b']]){
   window.__scrollStoryQA.seek(pin.start+(pin.end-pin.start)*time/master.duration());
   const el=document.querySelector(selector),box=el.getBoundingClientRect();const kids=[...el.children].map(e=>e.getBoundingClientRect());
   checks.beats.push({selector,top:box.top,bottom:box.bottom,childrenTop:Math.min(...kids.map(b=>b.top)),childrenBottom:Math.max(...kids.map(b=>b.bottom)),fits:Math.min(...kids.map(b=>b.top))>=innerHeight*.06-1&&Math.max(...kids.map(b=>b.bottom))<=innerHeight*.94+1});
  }
  window.__scrollStoryQA.seek(pin.end);
  checks.exitGap=document.querySelector('.journey-title').getBoundingClientRect().top-innerHeight;
  window.__scrollStoryQA.seek(0);
  checks.heroTitle=[...document.querySelectorAll('.hero-name .name-word')].every(e=>{const b=e.getBoundingClientRect();return b.left>=-1&&b.right<=innerWidth+1;});
  const labels=Object.values(master.labels).sort((a,b)=>a-b);checks.minimumBeat=Math.min(...labels.slice(1).map((v,i)=>v-labels[i]));
  const intervals=master.getChildren(true,true,false).filter(t=>t.targets().some(e=>e instanceof Element)).map(t=>{let start=t.startTime(),parent=t.parent;while(parent&&parent!==master){start+=parent.startTime();parent=parent.parent;}return [start,start+t.totalDuration()];}).sort((a,b)=>a[0]-b[0]);
  let edge=0,gap=0;for(const [start,end]of intervals){gap=Math.max(gap,start-edge);edge=Math.max(edge,end);}checks.maximumHold=Math.max(gap,master.duration()-edge);
  const sample=()=>[...document.querySelectorAll('.about-rig [data-joint],.about-amber-field,.about-beat-a,.about-beat-b')].map(e=>[e.getAttribute('transform'),e.style.opacity,e.style.clipPath]);
  const at=()=>window.__scrollStoryQA.seek(pin.start+(pin.end-pin.start)*.69);
  at();const first=sample();window.__scrollStoryQA.seek(pin.end*.97);at();checks.reverseStable=JSON.stringify(first)===JSON.stringify(sample());return checks;
 });
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(600);const reduced=await page.evaluate(()=>({pinCount:window.__scrollStoryQA.sample().pinned.length,beatA:getComputedStyle(document.querySelector('.about-beat-a')).opacity,beatB:getComputedStyle(document.querySelector('.about-beat-b')).opacity,overflow:document.documentElement.scrollWidth>innerWidth}));
 results.push({width,height,...measure,reduced,errors});console.log(JSON.stringify(results.at(-1)));await page.close();
}
await writeFile('output/playwright/scroll-story/acceptance.json',JSON.stringify(results,null,2));await browser.close();
const failures=results.filter(r=>r.errors.length||r.pinCount!==1||r.headlineCount!==1||r.badgeCount!==1||r.jointDrift>.01||r.minimumRigScale<.35||r.bodyTranslation>.01||r.bubbleOverflow||r.overflow||!r.reverseStable||r.beats.some(b=>!b.fits)||r.reduced.pinCount||r.reduced.overflow||r.maximumHold>.4||r.minimumBeat<.249||!r.heroTitle);
if(failures.length)process.exitCode=1;
