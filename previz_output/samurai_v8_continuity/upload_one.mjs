import fs from 'fs';
const [file,key]=process.argv.slice(2);
const r=await fetch('http://localhost:4321/api/flow',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({method:'upload',args:[{base64:fs.readFileSync(file).toString('base64'),mimeType:'image/png',name:file}]})});
const j=await r.json();if(!j.ok)throw new Error(j.error);
const st=JSON.parse(fs.readFileSync('state.json'));st.shots[key]={...(st.shots[key]||{}),img:j.data.mediaId};fs.writeFileSync('state.json',JSON.stringify(st,null,2));console.log('uploaded',key,j.data.mediaId);
