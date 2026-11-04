import cv2,numpy as np,json,os,sys
shots=json.load(open('shots.json'));take=sys.argv[1] if len(sys.argv)>1 else 't1'
ids=sys.argv[2].split(',') if len(sys.argv)>2 else [s['id'] for s in shots]
rows=[]
for s in shots:
    if s['id'] not in ids:continue
    p=f"{s['id']}_{take}.mp4"
    if not os.path.exists(p):continue
    c=cv2.VideoCapture(p);r=[]
    for t in np.arange(0,8,0.5):
        c.set(1,int(t*24));ok,f=c.read()
        if not ok:break
        f=cv2.resize(f,(192,108));cv2.putText(f,f"{s['id']} {t:.1f}",(3,13),0,0.4,(0,255,255),1);r.append(f)
    while len(r)<16:r.append(np.zeros((108,192,3),np.uint8))
    rows.append(np.hstack(r))
cv2.imwrite(f'qc_{take}.jpg',np.vstack(rows));print(len(rows),'rows')
