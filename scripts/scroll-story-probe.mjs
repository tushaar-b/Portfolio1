import {createRequire} from 'node:module';import{mkdir,writeFile}from'node:fs/promises';
import {chromium} from './playwright-runtime.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
for(const [width,height]of[[1470,769],[1920,1080],[390,844]]){
 const page=await browser.newPage({viewport:{width,height}});await page.goto((process.env.QA_URL||'http://127.0.0.1:5174')+'/?debug=1');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1800);
 for(const t of[0,2.75,4.25,5.7,7.5,8.8,10.7,12.4]){
  await page.evaluate(t=>{const a=document.querySelector('#about').__aboutMotion;window.__scrollStoryQA.seek(a.trigger.start+(a.trigger.end-a.trigger.start)*t/a.master.duration());},t);await page.waitForTimeout(100);
  await mkdir('output/playwright/scroll-story/probe',{recursive:true});await page.screenshot({path:`output/playwright/scroll-story/probe/${width}-${t}.png`});
  results.push(await page.evaluate(({width,t})=>({width,t,errors:document.querySelector('#error-log').textContent,overflow:document.documentElement.scrollWidth>innerWidth,pins:window.__scrollStoryQA.sample().pinned,rects:['.about-beat-a','.about-beat-b','.about-character-button','.about-stage-arch'].map(s=>{const e=document.querySelector(s),b=e.getBoundingClientRect();return {s,opacity:getComputedStyle(e).opacity,x:b.x,y:b.y,w:b.width,h:b.height,scrollH:e.scrollHeight};})}),{width,t}));
 }
 await page.close();console.log(`Probed ${width}`);
}await writeFile('output/playwright/scroll-story/probe/report.json',JSON.stringify(results,null,2));await browser.close();
