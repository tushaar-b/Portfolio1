import React,{useId} from 'react';
export type JourneyVehicle = 'auto'|'scooter'|'car';

function Wheel({x,y,r=32,id}:{x:number;y:number;r?:number;id?:string}) {
  return <g id={id} transform={`translate(${x} ${y})`}><g className="ride-wheel" data-radius={r} data-pivot="0 0">
   <g transform={`scale(${r/32})`}>
    <circle r="32" fill="var(--ink)" />
    <circle r="24" fill="var(--ride-road)" stroke="var(--ride-cream)" strokeWidth="4" />
    {[0,60,120].map(a=><path key={a} d="M-21 0H21" transform={`rotate(${a})`} stroke="var(--ride-cream)" strokeWidth="3" />)}
    <circle r="6" fill="var(--ride-amber)" stroke="none" />
   </g></g></g>;
}

export function JourneyVehicleArt({vehicle}:{vehicle:JourneyVehicle}) {
  const headId=`ride-head-${useId().replace(/:/g,'')}`;
  return <svg viewBox={vehicle==='auto'?'0 0 360 224':vehicle==='car'?'35 20 360 260':'60 20 300 260'} aria-hidden="true" fill="var(--ink)" stroke="var(--ink)" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
    <defs><symbol id={headId} viewBox="0 0 600 400">
      <g fill="var(--skin)" stroke="var(--ink)" strokeWidth="12" strokeLinejoin="round">
        <path d="M190 222C160 204 155 254 190 252ZM410 222C440 204 445 254 410 252Z" />
        <path d="M190 130H410V270Q410 340 340 340H260Q190 340 190 270Z" />
        <path d="M185 106H415V116Q399 146 382 116Q366 146 349 116Q333 146 316 116Q300 146 284 116Q267 146 251 116Q234 146 218 116Q201 146 185 116Z" />
        <rect x="180" y="86" width="240" height="26" rx="8" fill="var(--ink)" />
        <circle cx="236" cy="237" r="26" fill="var(--white)" /><circle cx="362" cy="237" r="26" fill="var(--white)" />
        <circle cx="245" cy="238" r="8" fill="var(--ink)" stroke="none" /><circle cx="371" cy="238" r="8" fill="var(--ink)" stroke="none" />
        <path d="M299 244Q284 265 299 267M278 293H322L313 309H287Z" fill="none" strokeWidth="8" />
      </g>
    </symbol></defs>
    {vehicle==='auto'?<>
     <Wheel id="auto-wheel-rear" x={70} y={188} r={30}/><Wheel id="auto-wheel-front" x={292} y={194} r={24}/>
     <g className="auto-lean"><g className="auto-bob"><g className="auto-idle">
      <g id="auto-canopy">
       <path d="M26 144L19 39Q18 9 49 9H218Q238 9 250 28L259 38H231L212 32H43L45 142Z"/>
       <path d="M30 39H213L237 44" fill="none" stroke="var(--ride-amber)" strokeWidth="4"/>
      </g>
      <g id="auto-details">
       <path d="M67 112V145H151V116" fill="none" stroke="var(--ride-cream)"/>
       <rect x="54" y="140" width="105" height="14" rx="7"/>
       <path d="M185 115V151H217" fill="none" strokeWidth="12"/>
       <path d="M202 151L228 174H249" fill="none" strokeWidth="14"/>
       <path d="M24 183V207H40M28 194H14V201H5" fill="none"/>
      </g>
      <g id="auto-driver">
       <path d="M177 139L181 105Q195 97 207 110L221 144Z"/>
       <use href={`#${headId}`} x="122" y="21" width="145" height="97"/>
       <path d="M199 119L228 135L255 121" fill="none" strokeWidth="12"/>
       <circle cx="255" cy="121" r="7" fill="var(--skin)" strokeWidth="4"/>
       <g className="auto-wave"><path d="M185 119L211 132L244 123" fill="none" strokeWidth="12"/><path d="M240 125Q237 114 244 114L252 116Q260 119 252 126Z" fill="var(--skin)" strokeWidth="4"/></g>
      </g>
      <g id="auto-body">
       <path d="M24 145L178 153L244 146L265 102Q292 100 309 131L325 166L317 182H269Q259 165 251 181H111Q103 149 70 150Q37 151 32 180H23Z" fill="var(--ride-amber)"/>
       <path d="M29 147L179 157H245" fill="none"/>
       <path d="M41 120H164V151M42 121V146M162 122V151" fill="none"/>
       <path d="M26 157Q14 162 21 181H34Q39 162 49 160" fill="var(--ride-amber)"/>
       <path d="M267 181Q269 160 292 160Q314 160 320 181Z"/>
       <path d="M291 177L292 191" fill="none" strokeWidth="8"/>
       <path d="M240 45Q261 58 269 104L249 105L229 47Z" fill="var(--ride-cream)" strokeWidth="5"/>
       <path d="M241 59L256 88" fill="none" stroke="var(--ride-amber)" strokeWidth="3"/>
       <circle cx="307" cy="137" r="14" fill="var(--ride-amber)" strokeWidth="4"/><circle cx="307" cy="137" r="9" fill="var(--ride-cream)" stroke="none"/>
       <rect x="20" y="153" width="9" height="19" rx="3" fill="#ED7C36" strokeWidth="3"/>
       <rect x="27" y="177" width="22" height="13" rx="2" fill="var(--ride-cream)" strokeWidth="3"/>
       <path d="M32 181H44M32 185H44" strokeWidth="1"/>
      </g>
      <g id="auto-handlebar" fill="none"><path d="M267 142L256 117L242 115M251 119L261 115M258 112L269 83"/><circle cx="271" cy="77" r="9" fill="var(--ride-cream)" strokeWidth="4"/></g>
      <foreignObject x="5" y="201" width="1" height="1" overflow="visible"><div className="ride-puffs">{[0,1,2].map(i=><i key={i} style={{left:-i*9,top:i%2*5}}/>)}</div></foreignObject>
     </g></g></g>
    </>:<><Wheel x={105} y={232}/><Wheel x={315} y={232}/>
    {vehicle==='scooter'?<g>
      <path d="M75 211Q70 153 118 150H157L185 190H268L295 124Q326 119 337 157L349 215H304Q289 184 265 209H149Q128 180 105 201Z" />
      <path d="M92 170Q121 153 146 173L158 185H94Z" fill="var(--ride-amber)" stroke="none" />
      <path d="M180 199H274L303 132M296 132H332" fill="none" stroke="var(--ride-amber)" strokeWidth="6" />
      <path d="M283 122L298 112H329" fill="none" />
      <ellipse cx="334" cy="146" rx="12" ry="18" fill="var(--ride-cream)" />
      <rect x="145" y="161" width="97" height="15" rx="7" fill="var(--ride-cream)" />
      <path d="M203 165L239 202L260 207" fill="none" strokeWidth="18" />
      <path d="M246 204L270 207Q277 211 270 216H245Z" fill="var(--ride-cream)" />
      <path d="M155 159L165 127Q190 110 214 130L231 161Z" />
      <path d="M216 138L256 151L289 137M164 141L143 115" fill="none" strokeWidth="15" />
      <circle cx="293" cy="137" r="9" fill="var(--skin)" />
      <path d="M136 120L122 103L119 87Q119 81 124 84L129 96L128 73Q129 67 134 73L138 94L139 70Q142 65 146 72L147 94L152 78Q157 73 158 80L155 100L161 92Q167 89 167 97L153 119Z" fill="var(--skin)" strokeWidth="5" />
      <use href={`#${headId}`} x="65" y="-6" width="260" height="173" strokeWidth="0" />
    </g>:<g>
      <path d="M55 214V179Q56 157 91 151L133 89Q145 72 180 72H244Q269 74 287 103L319 151Q366 157 370 186V214H349Q338 178 315 184Q284 184 280 214H140Q132 178 105 184Q75 184 70 214Z" fill="var(--ink)" />
      <path d="M127 145L153 99Q163 90 185 91H235Q250 91 261 111L284 145Z" fill="var(--ride-road)" stroke="var(--ride-cream)" strokeWidth="3" />
      <use href={`#${headId}`} x="139" y="53" width="145" height="96" />
      <path d="M205 98V146M69 170H350" fill="none" stroke="var(--ride-amber)" strokeWidth="5" />
      <rect x="347" y="172" width="17" height="23" rx="7" fill="var(--ride-cream)" />
      <path d="M296 143L301 129L298 106Q298 100 303 104L308 119L311 97Q314 93 318 99L318 123L326 108Q331 105 332 111L326 133L315 147Z" fill="var(--skin)" strokeWidth="4" />
      <path d="M48 215H78M349 215H379" stroke="var(--ride-cream)" strokeWidth="7" />
    </g>}</>}
  </svg>;
}
