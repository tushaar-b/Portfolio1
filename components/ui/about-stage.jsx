import React from 'react';
import { AboutCharacter } from './about-character';
import './about-stage.css';

const skills = ['Next.js & React', 'FastAPI & Node.js', 'Machine Learning & XAI', 'Supabase & SQL', 'Arduino / RPi', 'Data Structures & Algo', 'UI/UX & Figma'];
export function AboutStage() {
  return <section id="about" className="about-sequence" aria-labelledby="about-heading">
    <div className="about-viewport">
      <div className="about-iris" aria-hidden="true"><div className="about-iris-ring"/><div className="about-amber-field"/></div>
      <div className="about-stage-arch" aria-hidden="true"/>
      <div className="about-theatre">
        <div className="about-ray-window"><div className="about-rays" aria-hidden="true">{Array.from({length:13},(_,i)=><i key={i} style={{'--ray':`${i*27.692}deg`}}/>)}</div></div>
        <div className="about-ground" aria-hidden="true"/>
        <button className="about-character-button" aria-label="Say ta-da with Tushaar" type="button"><div className="about-character-camera"><div className="about-character-hop"><AboutCharacter/></div></div></button>
        <div className="about-bubble" aria-hidden="true"><svg viewBox="0 0 600 250" preserveAspectRatio="none"><path d="M90 5 H510 Q595 5 595 75 Q595 145 510 145 H470 L410 245 L430 145 H90 Q5 145 5 75 Q5 5 90 5Z"/></svg><div className="about-bubble-letters"><span>ABOUT ME</span></div></div>
        <span className="about-stage-caption" aria-hidden="true">A LITTLE CURIOSITY GOES A LONG WAY.</span>
        <div className="about-confetti" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i}/>)}</div>
      </div>
      <div className="about-curtains" aria-hidden="true">{Array.from({length:5},(_,i)=><i key={i}/>)}</div>
      <div className="about-story-viewport"><article className="about-story">
        <h2 id="about-heading" className="about-sr-only">About me</h2>
        <div className="about-beat about-beat-a">
          <div className="about-eyebrow">CSE (DATA SCIENCE) @ VIT <i aria-hidden="true"/></div>
          <p className="about-quote">I bridge web engineering, applied <em>AI</em> and things you can <em>touch.</em></p>
          <div className="about-paragraphs"><p>I like making ideas useful. Sometimes that means a thoughtful interface; sometimes it's a model that explains its decisions, or a small device that responds to the world. I build to connect those pieces, and learn by putting them into people's hands.</p></div>
        </div>
        <div className="about-beat about-beat-b">
        <div className="about-medallions" aria-label="Experience at a glance">{[[2,'ND YEAR','B.TECH CSE-DS'],[3,'+ STACKS','TECH EXPERTISE'],[10,'+ SHIPPED','BUILT AND SHIPPED']].map(([n,s,l],i)=><div className="about-medallion" key={n} tabIndex="0" style={{'--coin-offset':`${i===1?16:0}px`}}><div><span className="about-count" data-value={n}>{n}</span><span className="about-stat-suffix">{s}</span></div><span className="about-stat-label">{l}</span></div>)}</div>
        <ul className="about-stickers" aria-label="Skills">{skills.map((skill,i)=><li key={skill}><button type="button" className={`about-sticker about-sticker-${i%3}`} style={{'--sticker-rotation':`${[-2,2,-1,3,-3,1,-2][i]}deg`}}>{skill}</button></li>)}</ul>
        <div className="about-ticket"><span>TOP FINALIST<br/><strong>SIH & VINHACK</strong></span><span className="about-stamp" aria-hidden="true">IDEAS INTO<br/>REALITY ↗</span></div>
        </div>
      </article></div>
      <div className="about-exit" aria-hidden="true"/>
      <div className="about-scroll-cue" aria-hidden="true">KEEP SCROLLING <span>↓</span></div>
    </div>
  </section>;
}
