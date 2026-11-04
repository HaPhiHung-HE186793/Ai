import cv2,numpy as np,json
shots=json.load(open('shots_v8.json'));c=cv2.VideoCapture('90_SAMURAI_V8_CONTINUITY_MASTER.mp4');fr=[]
while True:
    ok,f=c.read()
    if not ok:break
    fr.append(f[92:628])
t=0;cuts=[]
for s in shots:t+=s['dur'];cuts.append(int(round(t*24)))
rows=[]
for i,cf in enumerate(cuts[:-1]):
    a=cv2.resize(fr[cf-2],(400,168));b=cv2.resize(fr[min(len(fr)-1,cf+1)],(400,168))
    cv2.putText(a,f"{shots[i]['id']} cuoi",(4,16),0,0.5,(0,255,255),1);cv2.putText(b,f"{shots[i+1]['id']} dau",(4,16),0,0.5,(0,255,255),1)
    rows.append(np.hstack([a,b,np.zeros((168,8,3),np.uint8)]))
rows.append(np.zeros_like(rows[0]))
cv2.imwrite('cuts_check_v8.jpg',np.vstack([np.hstack(rows[i:i+3]) for i in range(0,len(rows)-len(rows)%3,3)]));print('ok')
