import React from 'react';
import './night-scenery.css';
import { mobileMode } from '../../src/mobile-mode';

export function NightStars({count=25,twinkle=false}:{count?:number;twinkle?:boolean}){
 if(mobileMode)twinkle=false;
 return <>{Array.from({length:count},(_,i)=><circle key={i} className={twinkle?'night-star-twinkle':undefined} style={twinkle?{animationDelay:`-${(i*17.31)%13}s`,animationDuration:`${5+(i*3.7)%6}s`}:undefined} cx={`${(i*37.7)%99}%`} cy={`${10+(i*13)%30}%`} r={i%3===0?1.4:.8} fill="var(--ride-cream)" opacity=".4"/>)}</>;
}
export function NightCloud(props:React.SVGProps<SVGSVGElement>){
 if(mobileMode)return null;
 return <svg viewBox="0 0 180 60" {...props}><path d="M18 46Q0 42 12 28Q21 19 39 24Q38 0 65 4Q89 1 100 25Q132 9 147 31Q177 32 165 46Z" fill="var(--about-skin)" opacity=".1"/></svg>;
}
export function NightLamp(){
 return <g fill="none" stroke="var(--ride-cream)" strokeWidth="2"><path d="M0 0V-137Q0-155 21-155H34"/><path d="M25-155Q34-174 43-155Z" fill="var(--ride-amber)" stroke="none"/></g>;
}
export function NightHills(props:React.SVGProps<SVGPathElement>){return <path {...props} fill="var(--ride-road)"/>;}
export function NightRoad({href,width=78}:{href:string;width?:number}){
 return <><use href={href} fill="none" stroke="var(--ride-cream)" strokeWidth={width+4} strokeOpacity=".45"/><use href={href} fill="none" stroke="var(--ride-road)" strokeWidth={width}/><use href={href} fill="none" stroke="var(--ride-cream)" strokeWidth="2" strokeDasharray="26 30" strokeOpacity=".6"/></>;
}
export function NightFinish(){return <div className="night-finish film-overlay" aria-hidden="true"><div className="film-grain"/><div className="film-vignette"/></div>;}
