import json,subprocess,os
shots=json.load(open('shots.json'));ed=json.load(open('edit.json')) if os.path.exists('edit.json') else {}
ins=[];vf=[];af=[];n=0
for s in shots:
    e=ed.get(s['id'],{});take=e.get('take','t1');st=e.get('start',0.3);d=s['dur']
    ins+=['-i',f"{s['id']}_{take}.mp4"]
    vf.append(f"[{n}:v]trim=start={st}:duration={d},setpts=PTS-STARTPTS,fps=24,scale=1280:720,setsar=1[v{n}]")
    af.append(f"[{n}:a]atrim=start={st}:duration={d},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[a{n}]")
    n+=1
ins+=['-i','music_taiko_120bpm.wav']
grade="eq=contrast=1.06:saturation=0.92:gamma=0.97,colorbalance=rs=-0.03:bs=0.04:rh=0.04:bh=-0.02,crop=1280:536:0:92,pad=1280:720:0:92:black,noise=alls=4:allf=t"
fc=';'.join(vf+af)+';'+''.join(f'[v{i}]' for i in range(n))+f'concat=n={n}:v=1:a=0,{grade}[vout];'+''.join(f'[a{i}]' for i in range(n))+f'concat=n={n}:v=0:a=1,volume=0.35[sfx];[{n}:a]volume=1.0[mus];[mus][sfx]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[aout]'
cmd=['ffmpeg','-loglevel','error','-y']+ins+['-filter_complex',fc,'-map','[vout]','-map','[aout]','-c:v','libx264','-crf','18','-preset','medium','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','80_SAMURAI_V7_EDIT_CUT_MASTER.mp4']
subprocess.run(cmd,check=True);print('master ok')
