"""Source palette and WCAG 2 contrast checks for the scroll-story UI."""
from pathlib import Path
import re,json
allowed={'12172B','1B2347','E4EAF6','C9D3EE','F4A640','C2610F','FFD28A','F6F0E4','94470A'}
files=['src/style.css','components/ui/about-stage.css','components/ui/about-character.jsx','components/ui/about-stage.jsx','components/ui/about-motion.js','components/ui/use-hero-journey.ts','components/ui/flip-cards.tsx']
strays={f:sorted({x[:6].upper() for x in re.findall(r'#([\da-fA-F]{6}(?:[\da-fA-F]{2})?)\b',Path(f).read_text())}-allowed) for f in files}
def luminance(h):
 c=[int(h[i:i+2],16)/255 for i in (0,2,4)];c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c]
 return sum(a*b for a,b in zip(c,[.2126,.7152,.0722]))
def contrast(a,b):
 lo,hi=sorted([luminance(a),luminance(b)]);return (hi+.05)/(lo+.05)
pairs=[('body / cream','1B2347','F6F0E4',4.5),('body / mist','1B2347','E4EAF6',4.5),('labels / mist','94470A','E4EAF6',4.5),('labels / cream','94470A','F6F0E4',4.5),('large amber / mist','C2610F','E4EAF6',3),('large amber / cream','C2610F','F6F0E4',3),('large numbers / amber','94470A','F4A640',3),('card text / periwinkle','1B2347','C9D3EE',4.5),('card numbers / periwinkle','94470A','C9D3EE',3),('nav / midnight','F6F0E4','12172B',4.5)]
checks=[{'role':role,'foreground':'#'+a,'background':'#'+b,'ratio':round(contrast(a,b),2),'required':minimum,'pass':contrast(a,b)>=minimum} for role,a,b,minimum in pairs]
report={'sourceStrays':strays,'contrast':checks,'pass':not any(strays.values()) and all(c['pass'] for c in checks)}
Path('output/playwright/scroll-story/colors.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2));assert report['pass']
