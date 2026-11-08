import fs from 'node:fs';
import { PNG } from 'pngjs';

export function readArtwork(continentId){
  const filename=continentId==='drakmoria'?'elarion-terrain-drakmoria.png':continentId==='eryndor'?'elarion-terrain-eryndor-expanded.png':continentId==='namaris'?'elarion-terrain-namaris-expanded.png':['thalzor','solmeria'].includes(continentId)?'elarion-terrain-reference-rivers.png':'elarion-terrain-soft-rivers.png';
  const image=PNG.sync.read(fs.readFileSync(`public/assets/${filename}`));
  if(['aetheria','drakmoria'].includes(continentId)){
    const repair=JSON.parse(fs.readFileSync('src/data/world/isthmus-repair.json','utf8'));
    const patch=PNG.sync.read(fs.readFileSync(`public${repair.artwork}`));
    const [x1,y1,x2,y2]=repair.bounds;
    for(let y=Math.ceil(y1*image.height);y<Math.ceil(y2*image.height);y++)for(let x=Math.ceil(x1*image.width);x<Math.ceil(x2*image.width);x++){
      const i=(y*image.width+x)*4;image.data.set(patch.data.subarray(i,i+4),i);
    }
  }
  return image;
}
function pixel(image,x,y){const offset=(y*image.width+x)*4;return image.data.subarray(offset,offset+3);}
function flatPixel(r,g,b){return r>105&&g>95&&b<g*.94&&r>g*.77&&r<g*1.55;}
export function suitability(image,x,y){
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(!flatPixel(...pixel(image,x+dx,y+dy)))return 0;
  let flat=0,water=0,dark=0,total=0,sum=0,squares=0;
  for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){
    if(dx*dx+dy*dy>25)continue;
    const [r,g,b]=pixel(image,x+dx,y+dy);const light=(r+g+b)/3;
    flat+=flatPixel(r,g,b)?1:0;water+=(b>r*1.1&&b>g*.98)?1:0;dark+=light<65?1:0;
    sum+=light;squares+=light*light;total++;
  }
  const deviation=Math.sqrt(Math.max(0,squares/total-(sum/total)**2));
  return flat/total>=.78&&water===0&&dark/total<.025&&deviation<34?flat/total-deviation/180:0;
}
