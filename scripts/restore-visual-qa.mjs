import {chromium} from './playwright-runtime.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5174/?debug=1');
await page.evaluate(()=>document.fonts.ready);
await page.waitForFunction(()=>document.querySelector('#about').__aboutMotion && document.querySelector('.character-renderer').__asciiClock?.ready);
await page.waitForTimeout(700);
await page.evaluate(()=>{document.querySelector('#journey-debug').hidden=true;window.__journeyDebug.freezeIdle(true);});
await mkdir('output/playwright/restoration',{recursive:true});
const seek=async t=>{await page.evaluate(t=>{const a=document.querySelector('#about').__aboutMotion;window.__scrollStoryQA.seek(a.trigger.start+(a.trigger.end-a.trigger.start)*t/a.master.duration());},t);await page.waitForTimeout(150);};
await seek(0);await page.screenshot({path:'output/playwright/restoration/hero.png'});
const sample=()=>page.evaluate(()=>{
const css=s=>getComputedStyle(document.querySelector(s));
const rect=s=>{const b=document.querySelector(s).getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};};
return {bg:css('.journey-scene').backgroundColor,skin:css('#head-body').fill,body:css('#body').fill,arm:css('#arm').stroke,lid:rect('#lid'),head:rect('#head-body'),ascii:css('#ascii-canvas').opacity,lines:[...document.querySelectorAll('.next-line')].map(e=>({text:e.textContent,whiteSpace:getComputedStyle(e).whiteSpace,rect:{x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,height:e.getBoundingClientRect().height},words:[...e.querySelectorAll('.next-word')].map(w=>({text:w.textContent,y:w.getBoundingClientRect().y}))})),accent:css('.next-accent').color,italic:css('.next-accent').fontStyle,mind:css('.next-screen').backgroundColor,clouds:document.querySelectorAll('.hero-cloud').length,birds:document.querySelectorAll('.hero-bird').length,tiles:[...document.querySelectorAll('.tech-tile')].filter(e=>+getComputedStyle(e).opacity>.5).length,lidTransform:document.querySelector('#lid').getAttribute('transform'),portal:{opacity:css('.portal').opacity,transform:css('.portal').transform},badge:{background:css('.avatar-face').backgroundColor,ring:css('.avatar-face').borderColor},overflow:document.documentElement.scrollWidth>innerWidth,master:document.querySelector('#about').__aboutMotion.master.time()};});
const initial=await sample();const states=[];
for(const t of [.55,.85,1.4,1.85,2.35,2.89]){await seek(t);states.push(await sample());await page.screenshot({path:`output/playwright/restoration/forward-${t}.png`});}
await page.screenshot({path:'output/playwright/restoration/mind.png'});
await seek(5);await seek(2.89);await page.screenshot({path:'output/playwright/restoration/mind-reverse.png'});
for(const t of [2.35,1.85,1.4,.85,.55,0]){await seek(t);states.push(await sample());}
await page.screenshot({path:'output/playwright/restoration/hero-reverse.png'});
const returned=await sample();
await writeFile('output/playwright/restoration/checks.json',JSON.stringify({initial,returned,states,errors},null,2));
const finalMind=states.find(s=>s.master>2.88&&s.master<2.9);
const pass=errors.length===0 && initial.bg==='rgb(82, 73, 127)' && initial.body==='rgb(20, 20, 20)' && initial.arm==='rgb(20, 20, 20)' && initial.clouds===0 && initial.birds===6 && Math.abs(initial.head.width/1440-.22)<.001 && JSON.stringify(initial.head)===JSON.stringify(returned.head) && initial.ascii===returned.ascii && finalMind.lines.map(l=>l.text).join('|')==='A curious mind.|A world to build.' && finalMind.lines.every(l=>l.whiteSpace==='nowrap' && Math.max(...l.words.map(w=>w.y))-Math.min(...l.words.map(w=>w.y))<1) && finalMind.italic==='normal' && states.some(s=>s.tiles===11) && states.every(s=>!s.overflow);
console.log(JSON.stringify({pass,errors,headWidth:initial.head.width,finalMind,returnGeometry:JSON.stringify(initial.head)===JSON.stringify(returned.head)},null,2));await browser.close();if(!pass)process.exitCode=1;
