import assert from'node:assert/strict';import{chromium}from'./playwright-runtime.mjs';import{mkdir,writeFile}from'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const reports=[];const base='http://127.0.0.1:5174/output/playwright/journey-ride/fixture.html';
for(const scenario of[{count:4,w:1440,h:900},{count:5,w:390,h:844},{count:3,w:1440,h:900,vehicle:'car'},{count:3,w:390,h:844,details:true},{count:5,w:390,h:844,reduce:true}]){
 const page=await browser.newPage({viewport:{width:scenario.w,height:scenario.h}});const errors=[],warnings=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});if(scenario.reduce)await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(`${base}?count=${scenario.count}&vehicle=${scenario.vehicle||'scooter'}${scenario.details?'&details':''}`);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);
 const dir='output/playwright/journey-ride/variants';await mkdir(dir,{recursive:true});
 const semantic=await page.evaluate(()=>({items:document.querySelectorAll('.ride-checkpoint').length,headings:document.querySelectorAll('.ride-card h3').length,periods:document.querySelectorAll('.ride-card-period').length,descriptions:document.querySelectorAll('.ride-card-description').length,overflow:document.documentElement.scrollWidth>innerWidth}));
 assert.equal(semantic.items,scenario.count);assert.equal(semantic.headings,scenario.count);assert.equal(semantic.periods,scenario.details?scenario.count:0);assert.equal(semantic.descriptions,scenario.details?scenario.count:0);assert(!semantic.overflow);
 let measurements;
 if(!scenario.reduce){
  await page.waitForFunction(()=>document.querySelector('#my-journey-ride').__ride);
  const stops=[];
  for(let i=1;i<=scenario.count;i++){
   await page.evaluate(i=>{const a=document.querySelector('#my-journey-ride').__ride;a.seek(a.timeline.labels[`stop-${i}`]);},i);await page.waitForTimeout(75);
   stops.push(await page.evaluate(()=>{const root=document.querySelector('#my-journey-ride'),a=root.__ride;return{...a.sample(),active:[...root.querySelectorAll('.ride-card')].filter(e=>+getComputedStyle(e).opacity>.99).length,stageY:root.querySelector('.journey-stage').getBoundingClientRect().y};}));
  }
  assert(stops.every(s=>s.active===1&&Math.abs(s.stageY)<1));assert.equal(stops[0].totalVh,scenario.w<640?120+scenario.count*130:120+scenario.count*160);
  measurements={stops};await page.screenshot({path:`${dir}/count-${scenario.count}-${scenario.vehicle||'scooter'}-${scenario.w}${scenario.details?'-details':''}.png`});
 }else{
  measurements=await page.evaluate(()=>({pinCount:document.querySelectorAll('.pin-spacer').length,mode:document.querySelector('#my-journey-ride').dataset.motion,cardYs:[...document.querySelectorAll('.ride-card')].map(e=>e.getBoundingClientRect().y),worldWidth:document.querySelector('.world').getBoundingClientRect().width}));
  assert.equal(measurements.pinCount,0);assert.equal(measurements.mode,'reduced');assert(measurements.cardYs.every((y,i,a)=>!i||y>a[i-1]));
  await page.screenshot({path:`${dir}/reduced-${scenario.count}-${scenario.w}.png`,fullPage:true});
 }
 assert.equal(errors.length,0);assert.equal(warnings.length,0);reports.push({scenario,semantic,measurements,errors,warnings,passed:true});console.log(JSON.stringify({scenario,passed:true}));await page.close();
}
await writeFile('output/playwright/journey-ride/variants.json',JSON.stringify(reports,null,2));await browser.close();
