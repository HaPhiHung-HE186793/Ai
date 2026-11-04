import json,cv2,numpy as np,os,sys
from PIL import Image,ImageDraw,ImageFont
D='/usr/share/fonts/truetype/dejavu/';FB=ImageFont.truetype(D+'DejaVuSans-Bold.ttf',17);FS=ImageFont.truetype(D+'DejaVuSans.ttf',14)
shots=json.load(open('shots_v8.json'));take=sys.argv[1] if len(sys.argv)>1 else 't1';W,H=420,236
cells=[]
for s in shots:
    p=f"{s['id']}_{take}_start.png"
    im=cv2.resize(cv2.imread(p),(W,H)) if os.path.exists(p) else np.zeros((H,W,3),np.uint8)
    c=np.zeros((H+44,W,3),np.uint8);c[:H]=im;pi=Image.fromarray(cv2.cvtColor(c,cv2.COLOR_BGR2RGB));d=ImageDraw.Draw(pi)
    d.text((6,4),f"{s['id']}  {s['dur']}s",font=FB,fill=(255,230,0),stroke_width=2,stroke_fill=(0,0,0));d.text((6,H+4),s['state'],font=FS,fill=(230,230,230))
    cells.append(cv2.cvtColor(np.array(pi),cv2.COLOR_RGB2BGR))
rows=[np.hstack(cells[i:i+4]) for i in range(0,16,4)]
cv2.imwrite(f'storyboard_{take}.jpg',np.vstack(rows));print('board ok')
