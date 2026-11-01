import{createRequire}from'node:module';import{readdir}from'node:fs/promises';import path from'node:path';
const require=createRequire(import.meta.url);
let runtime=process.env.PLAYWRIGHT_MODULE;
if(!runtime){try{runtime=require.resolve('playwright');}catch{
 const cache=path.join(process.env.HOME,'.npm/_npx');
 for(const folder of await readdir(cache)){try{runtime=require.resolve(path.join(cache,folder,'node_modules/playwright'));break;}catch{}}
}}
if(!runtime)throw Error('Install Playwright or set PLAYWRIGHT_MODULE to its installed index.js.');
export const {chromium}=require(runtime);
