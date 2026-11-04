import fs from 'fs';
const BRIDGE='http://localhost:4321/api/flow';
const STYLE=' Cinematic photoreal film still, night, heavy rain, Kyoto temple courtyard, teal-blue moonlight with warm amber lantern light, anamorphic 35mm film look, 16:9.';
const A='/mnt/data/backup/project_personal/AI/previz_output/samurai_30s_run/';
const ANCH={kenji:A+'01_anchor_samurai_kenji_sheet.png',dragon:A+'02_anchor_mecha_dragon_sheet.png',env:A+'03_anchor_kyoto_rain_temple_plate.png'};
async function call(method,args,timeoutMs,retries=3){
  for(let a=1;a<=retries;a++){
    try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),timeoutMs);
      const r=await fetch(BRIDGE,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({method,args}),signal:ctl.signal});
      clearTimeout(t);const j=await r.json();if(!j.ok)throw new Error(j.error);return j.data;}
    catch(e){console.log(`  retry ${a}/${retries} ${method}: ${e.message}`);if(a===retries)throw e;await new Promise(r=>setTimeout(r,8000));}
  }
}
const state=fs.existsSync('state.json')?JSON.parse(fs.readFileSync('state.json')):{anchors:{},shots:{}};
const save=()=>fs.writeFileSync('state.json',JSON.stringify(state,null,2));
for(const [k,f] of Object.entries(ANCH)){
  if(!state.anchors[k]){const d=await call('upload',[{base64:fs.readFileSync(f).toString('base64'),mimeType:'image/png',name:`anchor_${k}.png`}],95000);state.anchors[k]=d.mediaId;save();console.log('anchor',k,d.mediaId);}
}
const shots=JSON.parse(fs.readFileSync(process.env.SHOTS||'shots.json'));
const only=process.argv[2]?process.argv[2].split(','):null;
const take=process.argv[3]||'t1';
for(const s of shots){
  if(only&&!only.includes(s.id))continue;
  const key=`${s.id}_${take}`;state.shots[key]=state.shots[key]||{};const st=state.shots[key];
  if(!st.img&&process.env.REUSE_IMG&&state.shots[`${s.id}_t1`]?.img){st.img=state.shots[`${s.id}_t1`].img;save();}
  if(!st.img){
    console.log(`img ${key}`);
    const d=await call('generate.image',[{prompt:(s.img+STYLE).slice(0,3800),modelDisplayName:'🍌 Nano Banana Pro',aspectRatio:'16:9',count:1,referenceImageMediaIds:s.refs.map(r=>state.anchors[r])}],150000);
    fs.writeFileSync(`${key}_start.png`,Buffer.from(d.base64,'base64'));st.img=d.mediaId;save();
  }
  if(!st.vid){
    console.log(`vid ${key}`);const t0=Date.now();
    const d=await call('generate.video',[{prompt:(s.vid+' Photoreal cinematic, heavy rain, night.').slice(0,3800),modelDisplayName:'Veo 3.1 - Lite',aspectRatio:'16:9',durationSeconds:8,resolution:'720p',firstFrameImageMediaId:st.img}],300000);
    fs.writeFileSync(`${key}.mp4`,Buffer.from(d.base64,'base64'));st.vid=d.mediaId;save();console.log(`  ok ${key} ${((Date.now()-t0)/1000)|0}s`);
  }
}
console.log('ALL DONE');
