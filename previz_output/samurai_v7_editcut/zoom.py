import cv2,numpy as np,sys
spec=sys.argv[1]  # "S03:3,4,5,6;S05:1.5,2.5,3.5,4.5"
rows=[]
for part in spec.split(';'):
    sid,ts=part.split(':');tk='t1'
    if '@' in sid: sid,tk=sid.split('@')
    c=cv2.VideoCapture(f'{sid}_{tk}.mp4');r=[]
    for t in map(float,ts.split(',')):
        c.set(1,int(t*24));ok,f=c.read();f=cv2.resize(f,(400,225));cv2.putText(f,f"{sid} {t}s",(4,18),0,0.6,(0,255,255),2);r.append(f)
    rows.append(np.hstack(r))
cv2.imwrite(sys.argv[2],np.vstack(rows))
