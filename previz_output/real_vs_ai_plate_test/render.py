import cv2,numpy as np,json
from analyze import track
W,H=1280,720;PW,PH=960,540
def frames(p):
    c=cv2.VideoCapture(p);out=[]
    while True:
        ok,f=c.read()
        if not ok:break
        out.append(f)
    return out
def planar_track(fr,quad0):
    g=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in fr];quads=[quad0.copy()];q=quad0.copy();lost=False;cnt=[]
    for t in range(1,len(fr)):
        if lost:quads.append(None);continue
        x,y,w,h=cv2.boundingRect(q.astype(np.float32));pad=int(max(w,h)*0.6)
        m=np.zeros_like(g[t-1]);cv2.rectangle(m,(max(0,x-pad),max(0,y-pad)),(min(W-1,x+w+pad),min(H-1,y+h+pad)),255,-1)
        p=cv2.goodFeaturesToTrack(g[t-1],400,0.005,5,mask=m)
        if p is None or len(p)<12:lost=True;quads.append(None);continue
        p1,fb,ok=track(g[t-1],g[t],p);ok&=fb<0.5
        if ok.sum()<10:lost=True;quads.append(None);continue
        Hm,inl=cv2.findHomography(p[ok],p1[ok],cv2.RANSAC,1.5)
        if Hm is None:lost=True;quads.append(None);continue
        q=cv2.perspectiveTransform(q.reshape(-1,1,2),Hm).reshape(-1,2)
        cx,cy=q.mean(0)
        if cy>H-20 or cx<0 or cx>W or cv2.contourArea(q.astype(np.float32))>W*H*0.25:lost=True;quads.append(None);continue
        quads.append(q.copy());cnt.append(int(inl.sum()))
    return quads
rng=np.random.default_rng(1)
def fireball(img,q,t):
    cx,cy=q.mean(0);s=np.linalg.norm(q[1]-q[0])  # ground width in px
    r=max(6,s*0.35);base=np.array([cx,cy])
    ov=np.zeros((H,W,3),np.float32)
    # ground glow (light falloff on ground)
    gl=np.zeros((H,W),np.float32);cv2.ellipse(gl,(int(cx),int(cy)),(int(r*3.2),int(r*1.1)),0,0,360,1,-1);gl=cv2.GaussianBlur(gl,(0,0),r*0.9)
    ov+=gl[...,None]*np.array([0.10,0.35,0.85],np.float32)*0.55
    # flame core: several flickering blobs rising
    for i in range(7):
        ph=t*0.35+i*0.9;ry=r*(0.6+0.5*np.sin(ph*1.7+i));
        bx=cx+np.sin(ph*2.3+i)*r*0.25;by=cy-r*0.9-i*r*0.18
        b=np.zeros((H,W),np.float32);cv2.ellipse(b,(int(bx),int(by)),(int(r*(0.75-i*0.06)),int(max(2,ry*1.3))),0,0,360,1,-1)
        b=cv2.GaussianBlur(b,(0,0),max(1,r*0.35))
        col=np.array([0.15,0.55+0.05*i,1.0],np.float32) if i>1 else np.array([0.75,0.95,1.0],np.float32)
        ov+=b[...,None]*col*(0.9-i*0.08)
    out=img.astype(np.float32)/255.;out=1-(1-out)*(1-np.clip(ov,0,1))  # screen blend
    return (np.clip(out,0,1)*255).astype(np.uint8)
def points_overlay(fr):
    g=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in fr];out=[];pts=None;age=None;stats=[]
    for t in range(len(fr)):
        img=fr[t].copy()
        if t>0 and pts is not None and len(pts):
            p1,fb,ok=track(g[t-1],g[t],pts);ok&=fb<0.5;pts=p1[ok];age=age[ok]+1
        if pts is None or len(pts)<300 or t%12==0:
            m=np.full(g[t].shape,255,np.uint8)
            if pts is not None:
                for x,y in pts.reshape(-1,2):cv2.circle(m,(int(x),int(y)),8,0,-1)
            n=cv2.goodFeaturesToTrack(g[t],600 if pts is None else max(0,600-len(pts)),0.01,8,mask=m)
            if n is not None:
                pts=n if pts is None else np.vstack([pts,n]);age=np.zeros(len(n)) if age is None else np.concatenate([age,np.zeros(len(n))])
        for (x,y),a in zip(pts.reshape(-1,2),age):
            c=(0,220,0) if a>=24 else ((0,220,255) if a>=8 else (60,60,255))
            cv2.circle(img,(int(x),int(y)),3,c,-1)
        stats.append(int((age>=24).sum()))
        out.append(img)
    return out,stats
real=frames('real_8s.mp4');ai=frames('ai_8s.mp4')
n=max(len(real),len(ai));real+= [real[-1]]*(n-len(real));ai+=[ai[-1]]*(n-len(ai))
quad=np.array([[640,520],[760,520],[790,560],[610,560]],np.float32)
qr=planar_track(real,quad);qa=planar_track(ai,quad)
pr,sr=points_overlay(real);pa,sa=points_overlay(ai)
from PIL import Image,ImageDraw,ImageFont
FB=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',24)
FS=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',21)
FH=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',28)
def _txt(im,items):
    p=Image.fromarray(cv2.cvtColor(im,cv2.COLOR_BGR2RGB));d=ImageDraw.Draw(p)
    for xy,t,f,c in items:d.text(xy,t,font=f,fill=c,stroke_width=2,stroke_fill=(0,0,0))
    return cv2.cvtColor(np.array(p),cv2.COLOR_RGB2BGR)
def panel(img,label,sub,col):
    im=cv2.resize(img,(PW,PH));cv2.rectangle(im,(0,0),(PW,44),(0,0,0),-1)
    items=[((12,9),label,FB,col[::-1])]
    if sub:items.append(((12,PH-34),sub,FS,(255,255,255)))
    return _txt(im,items)
def header(txt):
    b=np.zeros((70,PW*2,3),np.uint8);return _txt(b,[((20,18),txt,FH,(255,255,255))])
vw=cv2.VideoWriter('cmp_raw.avi',cv2.VideoWriter_fourcc(*'MJPG'),24,(PW*2,PH+70))
# PART 1: tracking points
for t in range(n):
    L=panel(pr[t],'THẬT (Pexels, quay bằng máy thật)',f'Điểm bám >1 giây (xanh): {sr[t]}',(0,255,0))
    R=panel(pa[t],'AI (Veo 3.1 Lite, cùng khung hình đầu)',f'Điểm bám >1 giây (xanh): {sa[t]}',(0,200,255))
    vw.write(np.vstack([header('PHẦN 1 — Tracking: xanh = bám ổn định >1s · vàng = 1/3–1s · đỏ = mới/ngắn'),np.hstack([L,R])]))
# PART 2: fireball composite
for t in range(n):
    a=real[t] if qr[t] is None else fireball(real[t],qr[t],t)
    b=ai[t] if qa[t] is None else fireball(ai[t],qa[t],t)
    L=panel(a,'THẬT + quả cầu lửa (planar track)','' if qr[t] is not None else 'Tracker đã dừng (mất điểm bám hoặc ra khỏi khung)',(0,255,0))
    R=panel(b,'AI + quả cầu lửa (planar track)','' if qa[t] is not None else 'Tracker đã dừng (mất điểm bám hoặc ra khỏi khung)',(0,200,255))
    vw.write(np.vstack([header('PHẦN 2 — Bài tập: ghép quả cầu lửa bám vào mặt đường trước cổng torii'),np.hstack([L,R])]))
vw.release()
json.dump(dict(real_alive=sr,ai_alive=sa,real_quad_frames=sum(q is not None for q in qr),ai_quad_frames=sum(q is not None for q in qa)),open('render_stats.json','w'))
print('real quad frames',sum(q is not None for q in qr),'ai quad frames',sum(q is not None for q in qa))
print('long-lived pts median real',int(np.median(sr[30:])),'ai',int(np.median(sa[30:])))
