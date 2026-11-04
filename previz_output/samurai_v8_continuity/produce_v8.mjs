import fs from 'fs';
const BRIDGE='http://localhost:4321/api/flow';
const STYLE=' Cinematic photoreal film still, night, heavy rain, Kyoto temple courtyard, teal-blue moonlight with warm amber lantern light, anamorphic 35mm film look, 16:9.';
const PREFIX='Use reference image 1 as the exact same location, lighting, character scale and positions: the samurai KENJI is on the LEFT facing RIGHT, the mecha-dragon is on the RIGHT in front of the red torii gate facing LEFT, the dragon is about 1.3 times the height of the torii. ';
const MASTER_PROMPT='Wide side-view establishing shot of a rainy Kyoto temple courtyard at night, the camera placed at the side so the action runs left-right across the frame. On the LEFT third: KENJI the samurai stands full body facing RIGHT with both hands empty and relaxed at his sides; his katana is fully sheathed inside its black scabbard at his left hip, no blade visible; dark cloak. On the RIGHT third: the colossal biomechanical mecha-dragon KURORYU stands in front of a huge red torii gate facing LEFT toward Kenji; the dragon is about 1.3 times the height of the torii gate, wings folded, amber chest core glowing. Stone lanterns along the courtyard, wet stone pavement reflections, heavy rain, mist.';
const v7=JSON.parse(fs.readFileSync('../samurai_v7_editcut/state.json'));
async function call(method,args,timeoutMs,retries=3){
  for(let a=1;a<=retries;a++){
    try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),timeoutMs);
      const r=await fetch(BRIDGE,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({method,args}),signal:ctl.signal});
      clearTimeout(t);const j=await r.json();if(!j.ok)throw new Error(j.error);return j.data;}
    catch(e){console.log(`  retry ${a}/${retries} ${method}: ${e.message}`);if(a===retries)throw e;await new Promise(r=>setTimeout(r,8000));}
  }
}
const state=fs.existsSync('state.json')?JSON.parse(fs.readFileSync('state.json')):{anchors:{...v7.anchors},shots:{}};
const save=()=>fs.writeFileSync('state.json',JSON.stringify(state,null,2));
const stage=process.argv[2];const only=process.argv[3]&&process.argv[3]!=='all'?process.argv[3].split(','):null;const take=process.argv[4]||'t1';
async function img(prompt,refs,file){
  const d=await call('generate.image',[{prompt:prompt.slice(0,3800),modelDisplayName:'🍌 Nano Banana Pro',aspectRatio:'16:9',count:1,referenceImageMediaIds:refs}],150000);
  fs.writeFileSync(file,Buffer.from(d.base64,'base64'));return d.mediaId;
}
if(stage==='master'){
  state.anchors.master=await img(MASTER_PROMPT+STYLE,[state.anchors.kenji,state.anchors.dragon,state.anchors.env],`master_${take}.png`);save();console.log('master',state.anchors.master);
}
const shots=JSON.parse(fs.readFileSync(process.env.SHOTS||'shots_v8.json'));
for(const s of shots){
  if(only&&!only.includes(s.id))continue;
  const key=`${s.id}_${take}`;state.shots[key]=state.shots[key]||{};const st=state.shots[key];
  if(stage==='frames'&&!st.img){
    console.log('img',key);const pre=s.refs[0]==='master'?PREFIX:'';
    st.img=await img(pre+s.img+STYLE,s.refs.map(r=>state.anchors[r]),`${key}_start.png`);save();
  }
  if(stage==='videos'){
    if(!st.img&&process.env.REUSE_IMG&&state.shots[`${s.id}_t1`]?.img){st.img=state.shots[`${s.id}_t1`].img;save();}
    if(!st.vid){
      console.log('vid',key);const t0=Date.now();
      const d=await call('generate.video',[{prompt:(s.vid+' Photoreal cinematic, heavy rain, night.').slice(0,3800),modelDisplayName:'Veo 3.1 - Lite',aspectRatio:'16:9',durationSeconds:8,resolution:'720p',firstFrameImageMediaId:st.img}],300000);
      fs.writeFileSync(`${key}.mp4`,Buffer.from(d.base64,'base64'));st.vid=d.mediaId;save();console.log(`  ok ${key} ${((Date.now()-t0)/1000)|0}s`);
    }
  }
}
console.log('STAGE DONE',stage);
