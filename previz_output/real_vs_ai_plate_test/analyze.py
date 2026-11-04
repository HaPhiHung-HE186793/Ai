import cv2, numpy as np, json, sys
LK=dict(winSize=(21,21),maxLevel=4,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,30,0.01))
def load(p):
    c=cv2.VideoCapture(p);fr=[]
    while True:
        ok,f=c.read()
        if not ok:break
        fr.append(cv2.cvtColor(f,cv2.COLOR_BGR2GRAY))
    return fr
def track(g0,g1,p):
    p1,st,_=cv2.calcOpticalFlowPyrLK(g0,g1,p,None,**LK)
    p0b,st2,_=cv2.calcOpticalFlowPyrLK(g1,g0,p1,None,**LK)
    fb=np.linalg.norm((p-p0b).reshape(-1,2),axis=1)
    ok=(st.ravel()==1)&(st2.ravel()==1)
    return p1,fb,ok
def sampson(F,a,b):
    a=np.hstack([a,np.ones((len(a),1))]);b=np.hstack([b,np.ones((len(b),1))])
    Fa=a@F.T;Ftb=b@F
    num=np.sum(b*Fa,axis=1)**2;den=Fa[:,0]**2+Fa[:,1]**2+Ftb[:,0]**2+Ftb[:,1]**2
    return np.sqrt(num/den)
def analyze(path):
    fr=load(path);n=len(fr);res={'frames':n,'fb':[],'pairs':[],'life':[],'loop':[]}
    # 1) forward-backward error per consecutive frame
    for t in range(n-1):
        p=cv2.goodFeaturesToTrack(fr[t],1500,0.01,8)
        _,fb,ok=track(fr[t],fr[t+1],p);res['fb'].append(float(np.median(fb[ok])))
    # 2) epipolar consistency for pairs (t, t+k): chain KLT across k frames with FB<0.5 gate
    for t0 in range(0,n-17,4):
        p=cv2.goodFeaturesToTrack(fr[t0],1500,0.01,8);start=p.reshape(-1,2).copy();cur=p;alive=np.ones(len(p),bool)
        for k in range(1,17):
            nxt,fb,ok=track(fr[t0+k-1],fr[t0+k],cur);alive&=ok&(fb<0.5);cur=nxt
            if k in (2,4,8,12,16) and alive.sum()>40:
                a=start[alive];b=cur.reshape(-1,2)[alive]
                disp=float(np.median(np.linalg.norm(b-a,axis=1)))
                F,m=cv2.findFundamentalMat(a,b,cv2.FM_RANSAC,1.0,0.999)
                if F is None or F.shape!=(3,3):continue
                e=sampson(F,a,b)
                res['pairs'].append(dict(t=t0,k=k,disp=disp,n=int(alive.sum()),inl=float((e<1.0).mean()),med=float(np.median(e)),p90=float(np.percentile(e,90))))
    # 3) track lifetime: seeds every 24 frames, how many frames a point survives FB<0.5
    for t0 in range(0,n-48,24):
        p=cv2.goodFeaturesToTrack(fr[t0],800,0.01,8);cur=p;life=np.zeros(len(p));alive=np.ones(len(p),bool)
        for k in range(1,48):
            nxt,fb,ok=track(fr[t0+k-1],fr[t0+k],cur);alive&=ok&(fb<0.5);life[alive]+=1;cur=nxt
        res['life'].append(life.tolist())
    # 4) loop closure: track forward 24 frames then backward to start (all points, no gating)
    for t0 in range(0,n-24,24):
        p=cv2.goodFeaturesToTrack(fr[t0],800,0.01,8);cur=p;okall=np.ones(len(p),bool)
        for k in range(1,25):
            cur,_,ok=track(fr[t0+k-1],fr[t0+k],cur);okall&=ok
        for k in range(24,0,-1):
            cur,_,ok=track(fr[t0+k],fr[t0+k-1],cur);okall&=ok
        err=np.linalg.norm((cur-p).reshape(-1,2),axis=1)[okall]
        res['loop'].append(dict(t=t0,med=float(np.median(err)),frac_lt1=float((err<1).mean()),n=int(okall.sum())))
    return res
if __name__=="__main__":
  out={k:analyze(f'{k}_8s.mp4') for k in ('real','ai')}
  json.dump(out,open('metrics.json','w'))
  for k,r in out.items():
      P=r['pairs'];life=np.concatenate([np.array(l) for l in r['life']])
      print(f"== {k}: frames={r['frames']}")
      print(f"  FB error median (px): {np.median(r['fb']):.3f}")
      for kk in (4,8,16):
          q=[p for p in P if p['k']==kk]
          print(f"  k={kk:2d}: disp={np.median([p['disp'] for p in q]):6.1f}px  inlier<1px={np.mean([p['inl'] for p in q])*100:5.1f}%  sampson med={np.median([p['med'] for p in q]):.3f} p90={np.median([p['p90'] for p in q]):.2f}")
      print(f"  track survives 47 frames: {(life>=47).mean()*100:.1f}%  mean life={life.mean():.1f}")
      print(f"  loop closure 24f: med={np.median([l['med'] for l in r['loop']]):.2f}px  <1px={np.mean([l['frac_lt1'] for l in r['loop']])*100:.1f}%")
