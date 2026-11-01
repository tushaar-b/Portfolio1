from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import sys
phase=sys.argv[1] if len(sys.argv)>1 else 'before'
base=Path('output/playwright/scroll-story')/phase
for folder in base.iterdir():
 if not folder.is_dir(): continue
 for direction in ['forward','reverse']:
  images=sorted(folder.glob(f'{direction}-*.png'))
  if not images: continue
  w,h=294,195
  sheet=Image.new('RGB',(w*5,h*8),'#E4EAF6');draw=ImageDraw.Draw(sheet)
  for i,p in enumerate(images):
   im=Image.open(p).convert('RGB');im.thumbnail((w-8,h-24))
   x=(i%5)*w;y=(i//5)*h
   sheet.paste(im,(x+(w-im.width)//2,y+21));draw.text((x+5,y+4),p.stem,fill='#12172B')
  sheet.save(base/f'{folder.name}-{direction}-contact.jpg',quality=90)
