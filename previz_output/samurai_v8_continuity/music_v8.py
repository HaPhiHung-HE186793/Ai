import numpy as np,wave
SR=48000;T=30.5;N=int(SR*T);L=np.zeros(N);rng=np.random.default_rng(7)
def add(sig,t0,g=1.0):
    i=int(t0*SR);j=min(N,i+len(sig));L[i:j]+=sig[:j-i]*g
def lp(x,k):return np.convolve(x,np.ones(k)/k,'same')
def taiko(f0=110,f1=55,dec=0.35,noise=0.25,dur=1.2):
    t=np.arange(int(SR*dur))/SR;f=f1+(f0-f1)*np.exp(-t*18);ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/dec)+0.35*np.sin(2*np.pi*180*t)*np.exp(-t/0.08)+lp(rng.standard_normal(len(t)),6)*np.exp(-t/0.025)*noise
def boom(dur=3.0):
    t=np.arange(int(SR*dur))/SR;f=30+60*np.exp(-t*6)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/1.1)*1.2+lp(rng.standard_normal(len(t)),60)*np.exp(-t/0.6)*1.5
def whoosh(dur=0.6):
    t=np.arange(int(SR*dur))/SR;e=np.sin(np.pi*t/dur)**2*(t/dur);n=rng.standard_normal(len(t));return (n-lp(n,30))*e*0.5
t=np.arange(N)/SR;B=0.5
drone=(np.sin(2*np.pi*55*t)+0.6*np.sin(2*np.pi*82.41*t)+0.3*np.sin(2*np.pi*110*t+np.sin(2*np.pi*0.3*t)))
env=np.interp(t,[0,2,5.5,15,18.5,19.9,20,23,26,30.5],[0.0,0.25,0.35,0.4,0.5,0.1,0.35,0.3,0.25,0.0]);L+=lp(drone,40)*env*0.35
for b in np.arange(2.0,3.5,0.75):add(taiko(90,50,0.25,0.1),b,0.35)
for b in np.arange(3.5,5.5,B):add(taiko(70,40,0.45,0.15),b,0.55+0.1*(b-3.5))          # tremor
add(boom(3.0),5.5,0.9);add(taiko(120,45,0.6,0.4),5.5,0.9)                                # reveal
for b in np.arange(8.0,15.0,B):add(taiko(115,55,0.3,0.3),b,0.55*(1.0 if round((b-8)/B)%2==0 else 0.55))
for c in (8.0,9.5,11.0,13.0):add(taiko(130,50,0.5,0.4),c,0.6)
add(boom(1.5),13.0,0.5)                                                                   # fire
for k,b in enumerate(np.arange(15.0,18.5,B/2)):add(taiko(120,60,0.22,0.35),b,0.3+0.03*k) # run + leap
add(whoosh(0.8),19.2,0.7)                                                                 # hang time then slash
add(taiko(140,40,0.8,0.6),20.0,1.0);add(boom(2.0),20.0,0.5)                               # slash
add(taiko(150,60,0.4,0.6),21.5,0.8)                                                       # core crack
for b in np.arange(22.0,23.0,B/2):add(taiko(140,70,0.15,0.4),b,0.35)
add(boom(3.5),23.0,1.1);add(taiko(80,30,1.0,0.5),23.0,0.9)                                # collapse
add(taiko(90,45,0.8,0.2),25.5,0.35);add(taiko(80,40,0.9,0.2),27.5,0.4);add(taiko(70,35,1.5,0.2),29.0,0.45)
L*=np.interp(t,[0,0.3,29.6,30.5],[0,1,1,0]);L=np.tanh(L*1.3)/np.tanh(1.3);L/=np.abs(L).max()*1.12
st=np.stack([L,np.roll(L,int(SR*0.008))],1)
w=wave.open('music_taiko_v8.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype(np.int16).tobytes());w.close();print('music ok')
