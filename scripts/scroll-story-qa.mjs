/** Reproduce: node scripts/scroll-story-qa.mjs before|after
 * Uses the installed Playwright module, or PLAYWRIGHT_MODULE if supplied.
 * Captures 40 evenly spaced full-page scroll positions per viewport.
 */
import {mkdir,writeFile,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
let modulePath=process.env.PLAYWRIGHT_MODULE;
if(!modulePath){try{modulePath=require.resolve('playwright');}catch{
  const cache=path.join(process.env.HOME,'.npm/_npx');
  for(const dir of await readdir(cache)){try{modulePath=require.resolve(path.join(cache,dir,'node_modules/playwright'));break;}catch{}}
}}
if(!modulePath)throw Error('Playwright is required. Set PLAYWRIGHT_MODULE to its installed index.mjs.');
const loaded=await import(pathToFileURL(modulePath).href);
const {chromium}=loaded.default||loaded;
const phase=process.argv[2]||'before';
const base=`output/playwright/scroll-story/${phase}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
for(const [width,height] of [[1470,769],[1920,1080],[390,844]]){
 const directory=`${base}/${width}x${height}`;await mkdir(directory,{recursive:true});
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.QA_URL||'http://127.0.0.1:5174')+'/?debug=1');
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>!!window.__scrollStoryQA);
 await page.waitForTimeout(1800);
 await page.evaluate(()=>window.__scrollStoryQA.refresh());
 const max=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
 const directions=phase==='after'?['forward','reverse']:['forward'];
 for(const direction of directions){
  for(let index=0;index<40;index++){
   const position=direction==='reverse'?39-index:index;
   await page.evaluate(y=>window.__scrollStoryQA.seek(y),max*position/39);
   await page.waitForTimeout(120);
   if(position>=37) await page.waitForFunction(()=>{const c=document.querySelector('#footer-canvas');return !c||c.getBoundingClientRect().top>innerHeight*1.5||c.dataset.ready==='true';},{},{timeout:5000}).catch(()=>{});
   const metrics=await page.evaluate(()=>{
    const visible=e=>{if(!e)return false;const b=e.getBoundingClientRect();if(b.bottom<=0||b.top>=innerHeight||b.right<=0||b.left>=innerWidth)return false;for(let n=e;n instanceof Element;n=n.parentElement){const s=getComputedStyle(n);if(+s.opacity<.02||s.visibility==='hidden'||s.display==='none')return false;}return true;};
    const rect=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};};
    const headlines=[...document.querySelectorAll('.next-content,.about-intro-copy')];
    const badges=[...document.querySelectorAll('#avatar-badge,.about-origin-badge')];
    return {y:Math.round(scrollY),overflow:document.documentElement.scrollWidth>innerWidth,headlines:headlines.filter(visible).length,badges:badges.filter(visible).length,pins:window.__scrollStoryQA.sample().pinned,beatA:rect(document.querySelector('.about-beat-a')),beatB:rect(document.querySelector('.about-beat-b')),errorLog:document.querySelector('#error-log')?.textContent};
   });
   await page.screenshot({path:`${directory}/${direction}-${String(position).padStart(2,'0')}.png`});
   report.push({viewport:{width,height},direction,index:position,...metrics});
  }
  console.log(`${phase} ${width}x${height} ${direction}: 40 captures; page errors: ${errors.length}`);
 }
 await writeFile(`${directory}/errors.json`,JSON.stringify(errors,null,2));await page.close();
}
await writeFile(`${base}/report.json`,JSON.stringify(report,null,2));await browser.close();
console.log(`Saved ${report.length} screenshots and ${base}/report.json`);
