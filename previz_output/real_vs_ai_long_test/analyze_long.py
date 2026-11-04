import cv2,numpy as np,json
def load(paths,size=(1280,720)):
    fr=[]
    for p in paths:
        c=cv2.VideoCapture(p)
        while True:
            ok,f=c.read()
            if not ok:break
            fr.append(cv2.resize(f,size))
    return fr
segs=lambda pre:[f'{pre}_{i}.mp4' for i in range(4)]
sift=cv2.SIFT_create(1500);bf=cv2.BFMatcher()
def feats(f):return sift.detectAndCompute(cv2.cvtColor(cv2.resize(f,(640,360)),cv2.COLOR_BGR2GRAY),None)
def inliers(fa,fb):
    ka,da=fa;kb,db=fb
    if da is None or db is None or len(ka)<20 or len(kb)<20:return 0
    g=[p[0] for p in bf.knnMatch(da,db,k=2) if len(p)==2 and p[0].distance<0.75*p[1].distance]
    if len(g)<15:return 0
    a=np.float32([ka[x.queryIdx].pt for x in g]);b=np.float32([kb[x.trainIdx].pt for x in g])
    F,mk=cv2.findFundamentalMat(a,b,cv2.FM_RANSAC,1.5,0.999)
    return int(mk.sum()) if mk is not None else 0
def flowmag(fr):
    out=[0.0];prev=cv2.cvtColor(cv2.resize(fr[0],(320,180)),cv2.COLOR_BGR2GRAY)
    for i in range(1,len(fr)):
        cur=cv2.cvtColor(cv2.resize(fr[i],(320,180)),cv2.COLOR_BGR2GRAY)
        f=cv2.calcOpticalFlowFarneback(prev,cur,None,0.5,3,15,3,5,1.2,0);out.append(float(np.median(np.linalg.norm(f,axis=2)))*4);prev=cur
    return out
def stats(f):
    hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV);g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY)
    return float(hsv[...,2].mean()),float(hsv[...,1].mean()),float(cv2.Laplacian(g,cv2.CV_64F).var())
real=load(['real_32s.mp4']);A=load(segs('A_chain'));B=load(segs('B_anchor'))
bA=np.cumsum([len(load([p],(64,36))) for p in segs('A_chain')])[:-1].tolist();bB=np.cumsum([len(load([p],(64,36))) for p in segs('B_anchor')])[:-1].tolist()
print('frames',len(real),len(A),len(B),'seams',bA,bB)
rf=[feats(real[min(len(real)-1,int(s*24))]) for s in range(33)]
res={'real':{},'A':{'seam_frames':bA},'B':{'seam_frames':bB}}
for name,fr in (('A',A),('B',B)):
    res[name]['same_place']=[max(inliers(feats(fr[min(len(fr)-1,s*24)]),rf[j]) for j in range(max(0,s-4),min(33,s+5))) for s in range(len(fr)//24+1)]
res['real']['same_place']=[max(inliers(rf[s],rf[j]) for j in range(max(0,s-4),min(33,s+5)) if j!=s) for s in range(33)]
for name,fr in (('real',real),('A',A),('B',B)):
    res[name]['flow']=flowmag(fr);st=[stats(fr[i]) for i in range(0,len(fr),12)]
    res[name]['bright']=[x[0] for x in st];res[name]['sat']=[x[1] for x in st];res[name]['sharp']=[x[2] for x in st]
res['B']['last_vs_target_psnr']=[float(cv2.PSNR(load([f'B_anchor_{i}.mp4'])[-1],cv2.resize(cv2.imread(f'real_k{8*i+8}.jpg'),(1280,720)))) for i in range(4)]
json.dump(res,open('long_metrics.json','w'))
for n in ('real','A','B'):
    r=res[n];f=np.array(r['flow'])
    print(f"== {n}: same_place/4s",[int(np.mean(r['same_place'][i:i+4])) for i in range(0,len(r['same_place']),4)],'sat/8s',[round(float(np.mean(r['sat'][i:i+16])),1) for i in range(0,len(r['sat']),16)],'median speed',round(float(np.median(f[1:])),2))
    for b in r.get('seam_frames',[]):print(f"   seam {b}: speed before {np.mean(f[b-6:b]):.2f} at {f[b]:.2f} after {np.mean(f[b+1:b+13]):.2f}")
print('B last-frame PSNR vs target',[round(x,1) for x in res['B']['last_vs_target_psnr']])
