import{chromium}from'./playwright-runtime.mjs';import{writeFile}from'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
for(const [width,height]of[[1470,769],[1920,1080],[390,844]]){
 const page=await browser.newPage({viewport:{width,height}});await page.goto((process.env.QA_URL||'http://127.0.0.1:5174')+'/?debug=1');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>!!document.querySelector('#about').__aboutMotion);await page.waitForTimeout(700);
 if(width<900)await page.locator('.hero-menu summary').click();
 const link=page.locator(width<900?'.hero-menu a[href="#about"]':'.hero-nav-links a[href="#about"]');
 const box=await link.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 // Resolve automation actionability outside the measured interval. The sample
 // records trusted mouse input + real Lenis/ScrollTrigger work, not first-use
 // Playwright helper compilation or locator checks.
 await page.waitForTimeout(250);
 const pending=page.evaluate(()=>new Promise(resolve=>{const samples=[];let prev=null;const tick=t=>{if(prev!==null)samples.push(t-prev);prev=t;if(samples.length<180)requestAnimationFrame(tick);else{const sorted=[...samples].sort((a,b)=>a-b);resolve({meanMs:+(samples.reduce((a,b)=>a+b)/samples.length).toFixed(2),p95Ms:+sorted[Math.floor(sorted.length*.95)].toFixed(2),maxMs:+sorted.at(-1).toFixed(2),framesOver33ms:samples.filter(n=>n>33.5).length});}};requestAnimationFrame(tick);}));
 await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
 const timings=await pending;const navigation=await page.evaluate(()=>({time:document.querySelector('#about').__aboutMotion.master.time(),y:Math.round(scrollY),error:document.querySelector('#error-log').textContent}));
 results.push({width,height,timings,navigation});console.log(JSON.stringify(results.at(-1)));await page.close();
}await writeFile('output/playwright/scroll-story/performance.json',JSON.stringify(results,null,2));await browser.close();

if(results.some(r=>r.navigation.error)) process.exitCode=1;
