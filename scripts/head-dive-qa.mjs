import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from './playwright-runtime.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const prior=JSON.parse(await readFile('output/playwright/composition/checks.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
for(const [width,height] of [[1440,900],[1920,1080],[1280,720]]) {
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5174/?debug=1');await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>document.querySelector('#about').__aboutMotion&&document.querySelector('.character-renderer').__asciiClock?.ready);
 await page.waitForTimeout(1300);await page.evaluate(()=>{document.querySelector('#journey-debug').hidden=true;window.__journeyDebug.freezeIdle(true);});
 const dir=`output/playwright/head-dive/${width}x${height}`;await mkdir(dir,{recursive:true});
 const seek=async time=>{await page.evaluate(time=>{const a=document.querySelector('#about').__aboutMotion;window.__scrollStoryQA.seek(a.trigger.start+(a.trigger.end-a.trigger.start)*time/a.master.duration());},time);await page.waitForTimeout(70);};
 const sample=()=>page.evaluate(()=>{
  const q=s=>document.querySelector(s),cs=s=>getComputedStyle(q(s)),rect=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom};};
  const a=q('#about').__aboutMotion,opening=q('#head-opening'),inv=opening.getScreenCTM().inverse();
  const coverage=Math.max(...[[0,0],[innerWidth,0],[0,innerHeight],[innerWidth,innerHeight]].map(([x,y])=>{const p=new DOMPoint(x,y).matrixTransform(inv);return ((p.x-300)/106)**2+((p.y-150)/22)**2;}));
  return {time:a.master.time(),heroEnd:a.heroEnd,duration:a.master.duration(),portalCount:document.querySelectorAll('.portal').length,head:rect(q('#head-body')),lid:rect(q('#lid')),hand:rect(q('#hand')),body:rect(q('#body')),subtitle:rect(q('.hero-subtitle')),camera:cs('#zoom-layer').transform,pivot:cs('#zoom-layer').transformOrigin,lidMatrix:q('#lid').getAttribute('transform'),interior:{transform:q('#head-interior').getAttribute('transform'),fill:cs('#head-opening').fill,coverage,box:rect(opening)},rings:{opacity:cs('#head-tunnel').opacity,clip:cs('#head-tunnel-rings').clipPath,items:[...q('#head-tunnel-rings').children].map(e=>({rx:e.getAttribute('rx'),ry:e.getAttribute('ry'),width:e.getAttribute('stroke-width'),opacity:e.getAttribute('stroke-opacity'),fill:getComputedStyle(e).fill,stroke:getComputedStyle(e).stroke}))},stage:cs('.stage').backgroundColor,mind:{opacity:cs('.next-screen').opacity,visibility:cs('.next-screen').visibility,clip:cs('.next-screen').clipPath,bg:cs('.next-screen').backgroundColor,words:[...document.querySelectorAll('.next-word')].map(e=>({opacity:getComputedStyle(e).opacity,transform:getComputedStyle(e).transform})),accent:cs('.next-accent').color,cta:cs('.next-cta').opacity},colors:{bg:cs('.journey-scene').backgroundColor,skin:cs('#head-body').fill,body:cs('#body').fill,accent:cs('.next-accent').color,display:cs('.hero-name').fontFamily,grain:cs('.film-grain').opacity,status:cs('.availability i').backgroundColor},tiles:[...document.querySelectorAll('.tech-tile')].map(e=>({text:e.textContent,opacity:getComputedStyle(e).opacity,...rect(e)})),overflow:document.documentElement.scrollWidth>innerWidth};
 });
 const canvasHash=async()=>createHash('sha256').update(await page.evaluate(()=>document.querySelector('#ascii-canvas').toDataURL())).digest('hex');
 await seek(0);await page.waitForTimeout(250);const initial=await sample();const initialAscii=await canvasHash();
 await writeFile(`${dir}/ascii-initial.png`,Buffer.from((await page.evaluate(()=>document.querySelector('#ascii-canvas').toDataURL())).split(',')[1],'base64'));const previous=prior.find(v=>v.width===width).forward[0];
 for(const key of ['colors','head','hand','body','lidMatrix'])assert.deepEqual(initial[key],previous[key],`Resting ${key} changed at ${width}`);
 await seek(2.52);const fan=await sample(),previousFan=prior.find(v=>v.width===width).forward.find(s=>s.progress===.35);
 assert.deepEqual(fan.tiles,previousFan.tiles,`Settled tile fan changed at ${width}`);assert.equal(fan.lidMatrix,previousFan.lidMatrix);
 const end=initial.heroEnd,points=[0,.4,.5,.6,.7,.8,.83,.85,.9,.92,.95,1];const captures={forward:[],reverse:[]};
 for(const direction of ['forward','reverse']) {
  if(direction==='reverse')await seek(end+4.5);
  for(const p of direction==='forward'?points:[...points].reverse()) {
   await seek(end*p);const state=await sample();captures[direction].push({progress:p,...state});
   await page.screenshot({path:`${dir}/${direction}-${String(Math.round(p*100)).padStart(3,'0')}.png`});
  }
 }
 assert.equal(errors.length,0);const reverse=new Map(captures.reverse.map(s=>[s.progress,s]));
 for(const s of captures.forward) {
  assert.equal(s.portalCount,0);assert(!s.overflow);assert.equal(s.mind.clip,'none');assert.equal(s.mind.opacity,'1');
  for(const ring of s.rings.items)assert.equal(ring.fill,'none');
  if(s.time<7.4)assert.equal(s.interior.fill,'rgb(46, 42, 79)','Interior is not opaque dark');
  if(s.time<8.112)assert(s.mind.words.every(w=>+w.opacity===0),'Text entered during background fade');
  if(s.time>=7.4&&s.time<8.112){assert(s.interior.coverage<1,'Rim visible during background fade');assert.equal(s.mind.visibility,'hidden');assert.equal(s.interior.fill,s.stage);}
  for(const key of ['camera','pivot','lidMatrix','interior','rings','mind','stage'])assert.deepEqual(s[key],reverse.get(s.progress)[key],`${width}: reverse ${s.progress} ${key}`);
 }
 const movingA=captures.forward.find(s=>s.progress===.7),movingB=captures.forward.find(s=>s.progress===.8);
 assert(movingA.interior.coverage<1&&movingB.interior.coverage<1);assert.notDeepEqual(movingA.rings.items,movingB.rings.items);
 const final=captures.forward.at(-1);assert.equal(final.stage,'rgb(231, 176, 222)');assert.equal(final.mind.visibility,'visible');assert(final.mind.words.every(w=>+w.opacity===1));assert.equal(final.mind.cta,'1');
 assert((7.4-2.6)/initial.duration>=.25);
 await seek(7.8);const before=await sample();await page.evaluate(()=>window.__scrollStoryQA.refresh());await seek(7.8);const after=await sample();
 assert.equal(before.pivot,after.pivot);assert.equal(before.stage,after.stage);assert.equal(before.interior.fill,after.interior.fill);
 if(width===1440){
  // Compile snapshots while the source SVG is tilted and recolored, then return
  // to the original dimensions. The unchanged ASCII renderer must recover exactly.
  await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(900);
  await page.setViewportSize({width,height});await page.waitForTimeout(900);await seek(0);
  await page.waitForFunction(()=>document.querySelector('.character-renderer').__asciiClock.ready);await page.waitForTimeout(150);
  await writeFile(`${dir}/ascii-after-resize.png`,Buffer.from((await page.evaluate(()=>document.querySelector('#ascii-canvas').toDataURL())).split(',')[1],'base64'));
  assert.equal(await canvasHash(),initialAscii,'ASCII source changed after resizing inside the dive');
 }
 results.push({width,height,passed:true,errors,initial,fan,refresh:{before:before.stage,after:after.stage},...captures});console.log(JSON.stringify({width,height,passed:true,coverage70:movingA.interior.coverage,coverage80:movingB.interior.coverage,diveFraction:4.8/initial.duration}));await page.close();
}
await writeFile('output/playwright/head-dive/checks.json',JSON.stringify(results,null,2));await browser.close();
