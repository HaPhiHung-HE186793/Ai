import cv2,numpy as np,json
from analyze import load,track
W,H=1280,720
def run(path,f):
    fr=load(path);n=len(fr);K=np.array([[f,0,W/2],[0,f,H/2],[0,0,1.]]);rows=[]
    for t0 in range(0,n-72,8):
        p=cv2.goodFeaturesToTrack(fr[t0],2500,0.01,7);cur=p;alive=np.ones(len(p),bool);hist=[p.reshape(-1,2).copy()];al=[alive.copy()]
        for k in range(1,73):
            cur,fb,ok=track(fr[t0+k-1],fr[t0+k],cur);alive=alive&ok&(fb<0.5);hist.append(cur.reshape(-1,2).copy());al.append(alive.copy())
        # init pair: first k where median disp >= 15px
        ki=None
        for k in range(4,40):
            m=al[k]
            if m.sum()>80 and np.median(np.linalg.norm(hist[k][m]-hist[0][m],axis=1))>=15: ki=k;break
        if ki is None:continue
        m=al[ki];a=hist[0][m];b=hist[ki][m]
        E,em=cv2.findEssentialMat(a,b,K,cv2.RANSAC,0.999,1.0)
        if E is None or E.shape!=(3,3):continue
        _,R,t,pm=cv2.recoverPose(E,a,b,K,mask=em.copy())
        P0=K@np.hstack([np.eye(3),np.zeros((3,1))]);P1=K@np.hstack([R,t])
        X=cv2.triangulatePoints(P0,P1,a.T,b.T);X=(X[:3]/X[3]).T
        good=(pm.ravel()>0)&(X[:,2]>0)
        idx=np.where(m)[0][good];X=X[good]
        for k in range(ki+4,73,4):
            okk=al[k][idx]
            if okk.sum()<30:break
            pts=hist[k][idx][okk]
            disp=float(np.median(np.linalg.norm(pts-hist[0][idx][okk],axis=1)))
            r=cv2.solvePnPRansac(X[okk],pts,K,None,reprojectionError=2.0,iterationsCount=300)
            if not r[0]:continue
            proj,_=cv2.projectPoints(X[okk],r[1],r[2],K,None);e=np.linalg.norm(proj.reshape(-1,2)-pts,axis=1)
            rows.append(dict(t=t0,k=k,disp=disp,n=int(okk.sum()),inl=float((e<2).mean()),med=float(np.median(e))))
    return rows
out={}
bins=[(20,40),(40,60),(60,90),(90,130),(130,200)]
for name in ('real','ai'):
    res={}
    for f in (600,800,1000,1300):
        rows=run(f'{name}_8s.mp4',f);res[f]=rows
    # pick focal with lowest overall median reproj (fair: each clip gets its best lens guess)
    bf=min(res,key=lambda f:np.median([r['med'] for r in res[f]]))
    rows=res[bf];out[name]=dict(f=bf,rows=rows)
    print(f"== {name} best focal guess={bf}px")
    for lo,hi in bins:
        q=[r for r in rows if lo<=r['disp']<hi]
        if q:print(f"  image travel {lo:3d}-{hi:3d}px: reproj med={np.median([r['med'] for r in q]):6.2f}px  inlier<2px={np.mean([r['inl'] for r in q])*100:5.1f}%  points={int(np.mean([r['n'] for r in q]))} samples={len(q)}")
json.dump(out,open('solve2.json','w'))
