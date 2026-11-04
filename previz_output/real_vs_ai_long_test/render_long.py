import cv2,numpy as np
from PIL import Image,ImageDraw,ImageFont
D='/usr/share/fonts/truetype/dejavu/'
FB=ImageFont.truetype(D+'DejaVuSans-Bold.ttf',19);FS=ImageFont.truetype(D+'DejaVuSans.ttf',17)
FH=ImageFont.truetype(D+'DejaVuSans-Bold.ttf',24);FX=ImageFont.truetype(D+'DejaVuSans-Bold.ttf',30)
PW,PH=640,360
def load(paths):
    fr=[];bounds=[]
    for p in paths:
        c=cv2.VideoCapture(p)
        while True:
            ok,f=c.read()
            if not ok:break
            fr.append(cv2.resize(f,(PW,PH)))
        bounds.append(len(fr))
    return fr,bounds[:-1]
real,_=load(['real_32s.mp4']);A,ba=load([f'A_chain_{i}.mp4' for i in range(4)]);B,bb=load([f'B_anchor_{i}.mp4' for i in range(4)])
n=max(len(real),len(A),len(B));pad=lambda L:L+[L[-1]]*(n-len(L));real,A,B=pad(real),pad(A),pad(B)
cols=[(62,207,110),(255,176,32),(90,170,255)]
labels=['THẬT (Pexels, 1 shot liền 32s)','A: AI nối đuôi (khung cuối → khung đầu)','B: AI có neo (đầu + cuối từ video thật)']
vw=cv2.VideoWriter('long_raw.avi',cv2.VideoWriter_fourcc(*'MJPG'),24,(PW*3,PH+104))
for t in range(n):
    cv=np.zeros((PH+104,PW*3,3),np.uint8)
    for j,fr in enumerate((real,A,B)):cv[60:60+PH,j*PW:(j+1)*PW]=fr[t]
    im=Image.fromarray(cv2.cvtColor(cv,cv2.COLOR_BGR2RGB));d=ImageDraw.Draw(im)
    d.text((16,16),'Thử nghiệm 32 giây: 1 shot quay thật vs 4 shot Veo 3.1 (8 giây/shot) ghép lại',font=FH,fill=(255,255,255))
    for j in range(3):d.rectangle([j*PW,60,j*PW+PW,86],fill=(0,0,0));d.text((j*PW+8,63),labels[j],font=FB,fill=cols[j])
    for j,bs in ((1,ba),(2,bb)):
        for b in bs:
            if b-6<=t<=b+12:d.text((j*PW+PW//2-120,60+PH//2-18),'CHỖ NỐI SHOT',font=FX,fill=(255,70,70),stroke_width=3,stroke_fill=(0,0,0))
    y=60+PH+10;d.rectangle([20,y+8,PW*3-200,y+16],fill=(60,60,60));L=PW*3-220
    d.rectangle([20,y+8,20+L*t/(n-1),y+16],fill=(210,210,210))
    for b in ba:bx=20+L*b/(n-1);d.rectangle([bx-2,y+1,bx+2,y+23],fill=(255,70,70))
    d.text((PW*3-180,y+2),f'{t/24:5.1f}s / {n/24:.1f}s',font=FS,fill=(255,255,255))
    vw.write(cv2.cvtColor(np.array(im),cv2.COLOR_RGB2BGR))
vw.release();print('frames',n,'seams',ba,bb)
