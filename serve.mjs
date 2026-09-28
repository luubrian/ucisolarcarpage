import http from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = 4321;
const TYPES = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.otf':'font/otf','.ttf':'font/ttf','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime','.pdf':'application/pdf'};
http.createServer(async (req,res)=>{
  try{
    let p = decodeURIComponent(req.url.split('?')[0]);
    if(p==='/'||p==='') p='/index.html';
    else if(p.endsWith('/')) p=p+'index.html';           // /about-us/ -> /about-us/index.html
    else if(!extname(p)) p=p+'/index.html';               // /about-us  -> /about-us/index.html (clean URL)
    const file = normalize(join(ROOT, p));
    const st = await stat(file);
    const type = TYPES[extname(file).toLowerCase()]||'application/octet-stream';
    const range = req.headers.range;
    if(range){
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m && m[1] ? parseInt(m[1],10) : 0;
      let end   = m && m[2] ? parseInt(m[2],10) : st.size-1;
      if(isNaN(start)) start=0;
      if(isNaN(end) || end>=st.size) end=st.size-1;
      res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${st.size}`,'Content-Length':end-start+1});
      createReadStream(file,{start,end}).pipe(res);
    } else {
      res.writeHead(200,{'Content-Type':type,'Content-Length':st.size,'Accept-Ranges':'bytes'});
      createReadStream(file).pipe(res);
    }
  }catch(e){ res.writeHead(404); res.end('404'); }
}).listen(PORT,()=>console.log('serving on http://localhost:'+PORT));
