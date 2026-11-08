import fs from 'node:fs';
import crypto from 'node:crypto';
import { PNG } from 'pngjs';
import { readArtwork } from './terrain-suitability.mjs';

// Keep the original pixels; color-bucket tracing manufactured distracting dots.
// The local tile avoids global mip-level loss, but adds no geographic detail.
const bounds=[.255,.30,.382,.483],image=readArtwork('aetheria');
const x0=Math.floor(bounds[0]*image.width),y0=Math.floor(bounds[1]*image.height);
const width=Math.ceil((bounds[2]-bounds[0])*image.width),height=Math.ceil((bounds[3]-bounds[1])*image.height);
const crop=new PNG({width,height});
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const source=((y+y0)*image.width+x+x0)*4;
  image.data.copy(crop.data,(y*width+x)*4,source,source+4);
}
const nation=JSON.parse(fs.readFileSync('src/data/world/political-map.json','utf8')).countries.find(c=>c.nationId==='aetheria-07');
const clip=nation.geometry.flatMap(p=>p.map(r=>r.map(([x,y],i)=>`${i?'L':'M'}${(x*image.width-x0).toFixed(3)},${(y*image.height-y0).toFixed(3)}`).join('')+'Z')).join('');
const data=PNG.sync.write(crop).toString('base64');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><title>Viremont — recorte da pintura original, sem geografia adicional</title><defs><clipPath id="country"><path d="${clip}"/></clipPath></defs><image width="${width}" height="${height}" href="data:image/png;base64,${data}" clip-path="url(#country)"/></svg>`;
fs.mkdirSync('public/assets/viremont',{recursive:true});fs.writeFileSync('public/assets/viremont/terrain-detail.svg',svg);
const version=crypto.createHash('sha256').update(svg).digest('hex').slice(0,12);
fs.writeFileSync('src/data/viremont/detail-source.json',JSON.stringify({bounds:[x0/image.width,y0/image.height,(x0+width)/image.width,(y0+height)/image.height],url:`/assets/viremont/terrain-detail.svg?v=${version}`,sourceResolution:[width,height],renderResolution:[2048,2048],method:'Local tile of original illustration, clipped to Viremont; no added detail, hydrology or terrain',status:'provisional'}));
console.log(`Saved local tile from ${width}x${height} original pixels; no source artwork modified.`);
