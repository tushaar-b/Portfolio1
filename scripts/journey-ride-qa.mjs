import assert from 'node:assert/strict';
import{chromium}from'./playwright-runtime.mjs';
import{mkdir,writeFile}from'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const reports=[];
for(const[width,height]of[[1440,900],[1280,720],[768,1024],[390,844],[390,667],[900,430]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});const errors=[],warnings=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});
 await page.goto('http://127.0.0.1:5174/?debug=1');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>document.querySelector('#my-journey-ride')?.__ride);await page.waitForTimeout(900);
 await page.evaluate(()=>{window.__journeyDebug?.freezeIdle(true);const p=document.querySelector('#journey-debug');if(p)p.hidden=true;});
 const dir=`output/playwright/journey-ride/${width}x${height}`;await mkdir(dir,{recursive:true});
 const sample=()=>page.evaluate(()=>{
  const root=document.querySelector('#my-journey-ride'),a=root.__ride,q=s=>root.querySelector(s),cs=e=>getComputedStyle(e),rect=e=>{const b=e.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom};};
  return{...a.sample(),flags:[...root.querySelectorAll('.ride-flag')].map(e=>cs(e).transform),rings:[...root.querySelectorAll('.ride-ground-ring')].map(e=>[cs(e).transform,cs(e).opacity]),puffs:[...root.querySelectorAll('.ride-puffs i')].map(e=>[cs(e).transform,cs(e).opacity]),badges:[...root.querySelectorAll('.checkpoint-badge')].map(e=>rect(e)),markers:[...root.querySelectorAll('.ride-checkpoint')].map(e=>rect(e)),world:cs(q('.world')).transform,vehicle:rect(q('.vehicle')),pose:cs(q('.vehicle')).transform,lean:cs(q('.vehicle-lean')).transform,bob:cs(q('.vehicle-bob')).transform,wheels:[...root.querySelectorAll('.ride-wheel')].map(e=>e.getAttribute('transform')),title:{box:rect(q('.journey-title')),transform:cs(q('.journey-title')).transform},cards:[...root.querySelectorAll('.ride-card')].map(e=>({text:e.textContent,opacity:+cs(e).opacity,transform:cs(e).transform,box:rect(e)})),stage:rect(q('.journey-stage')),ruler:rect(q('.progress')),overflow:document.documentElement.scrollWidth>innerWidth,ownPins:[...document.querySelectorAll('.pin-spacer')].filter(e=>e.querySelector('.journey-stage')).length};
 });
 const points=await page.evaluate(()=>{const a=document.querySelector('#my-journey-ride').__ride,l=a.timeline.labels,ts=a.timeline.duration();return[['intro',0],['travel-1',(l['travel-1']+l['arrive-1'])/2],['stop-1',l['stop-1']],['travel-2',(l['travel-2']+l['arrive-2'])/2],['stop-2',l['stop-2']],['stop-3',l['stop-3']],['outro',l.outro+(ts-l.outro)*.65],['end',ts]];});
 const captures={forward:[],reverse:[]};
 for(const direction of['forward','reverse'])for(const[name,time]of direction==='forward'?points:[...points].reverse()){
  await page.evaluate(t=>document.querySelector('#my-journey-ride').__ride.seek(t),time);await page.waitForTimeout(100);const s=await sample();captures[direction].push({name,...s});await page.screenshot({path:`${dir}/${direction}-${name}.png`});
 }
 const rest=[];
 for(let i=1;i<=3;i++){
  const label=`stop-${i}`,time=points.find(p=>p[0]===label)[1];const a=captures.forward.find(s=>s.name===label);
  await page.evaluate(t=>document.querySelector('#my-journey-ride').__ride.seek(t),time+20);const b=await sample();rest.push({label,worldStill:a.world===b.world,wheelsStill:JSON.stringify(a.wheels)===JSON.stringify(b.wheels)});
 }
 await page.evaluate(()=>document.querySelector('#my-journey-ride').__ride.seek(300));const before=await sample();await page.evaluate(()=>window.__scrollStoryQA.refresh());await page.evaluate(()=>document.querySelector('#my-journey-ride').__ride.seek(300));const after=await sample();
 const reverse=new Map(captures.reverse.map(s=>[s.name,s]));
 const intersects=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
 assert.equal(errors.length,0);assert.equal(warnings.length,0);
 for(const s of captures.forward){
  assert(!s.overflow);assert.equal(s.ownPins,1);assert(Math.abs(s.stage.y)<1);assert.equal(Math.round(s.stage.h),height);
  for(const key of ['world','pose','lean','bob','wheels','title','cards','flags','rings','puffs'])assert.deepEqual(s[key],reverse.get(s.name)[key],`${width}: reverse ${s.name} ${key}`);
  if(s.name.startsWith('stop-')){
   const index=+s.name.slice(5)-1,active=s.cards[index];assert.equal(s.cards.filter(c=>c.opacity>.99).length,1);
   assert.equal(active.opacity,1);assert(active.box.x>=0&&active.box.right<=width&&active.box.y>=0&&active.box.bottom<=height);
   assert(!intersects(active.box,s.vehicle));assert(!intersects(active.box,s.title.box));assert(!intersects(active.box,s.ruler));
   assert(Math.abs(s.badges[index].x+s.badges[index].w/2-s.markers[index].x)<2,'Badge shifted away from milestone');
  }
 }
 assert(rest.every(r=>r.worldStill&&r.wheelsStill));assert.equal(before.world,after.world);assert.deepEqual(before.wheels,after.wheels);
 const road=await page.evaluate(()=>document.querySelector('#my-journey-ride').__ride.road());assert(Math.max(...road.map(s=>Math.abs(s.angle)))<8);
 reports.push({width,height,errors,warnings,passed:true,points,rest,refresh:{before,after},...captures});console.log(JSON.stringify({width,height,errors,warnings,stageYs:captures.forward.map(s=>[s.name,s.stage.y]),rest}));await page.close();
}
await writeFile('output/playwright/journey-ride/checks.json',JSON.stringify(reports,null,2));await browser.close();
