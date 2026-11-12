import fs from 'node:fs';
import crypto from 'node:crypto';
import { TerrainHydrology } from '../src/geography/terrain/hydrology.ts';
import { RidgeField } from '../src/geography/terrain/ridgeField.ts';
import { readArtwork } from './terrain-suitability.mjs';

// Shared local terrain. Global artwork and political polygons are read-only.
const bounds=[.245,.285,.395,.505],size=513,width=8192,maxHeight=1400;
const source=readArtwork('aetheria'),height=width*(bounds[3]-bounds[1])/(2*(bounds[2]-bounds[0])*Math.cos((.5-.395)*Math.PI));
const authored=JSON.parse(fs.readFileSync('src/data/terrain/hydrology-source.json','utf8'));
const network=new TerrainHydrology(authored,{bounds,width,height});
const ridgeSource=JSON.parse(fs.readFileSync('src/data/terrain/ridge-source.json','utf8'));
const ridges=new RidgeField(ridgeSource,{bounds,width,height});
const pixel=(u,v)=>{const x=Math.max(0,Math.min(source.width-1,Math.round(u*source.width))),y=Math.max(0,Math.min(source.height-1,Math.round(v*source.height)));return [...source.data.subarray((y*source.width+x)*4,(y*source.width+x)*4+3)];};
const hash=(x,y)=>{const a=Math.sin(x*127.1+y*311.7)*43758.5453;return a-Math.floor(a);};
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),a=x-ix,b=y-iy,s=a*a*(3-2*a),t=b*b*(3-2*b);return (hash(ix,iy)*(1-s)+hash(ix+1,iy)*s)*(1-t)+(hash(ix,iy+1)*(1-s)+hash(ix+1,iy+1)*s)*t;}
const bytes=Buffer.alloc(size*size*4);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const u=bounds[0]+x/(size-1)*(bounds[2]-bounds[0]),v=bounds[1]+y/(size-1)*(bounds[3]-bounds[1]);
 const lx=(x/(size-1)-.5)*width,lz=(y/(size-1)-.5)*height;
 const mountain=ridges.height(lx,lz);
 const rolling=(noise(lx/700,lz/700)-.35)*55+(noise(lx/340+17,lz/340)-.4)*24;
 const h=Math.max(18,160-(v-.30)*650+18*noise(u*120,v*120)+12*noise(u*280,v*280)+rolling+mountain);
 const [r,g,b]=pixel(u,v),painted=g>r*1.04&&g>b*1.15&&r<145?1:0;
 let forest=(painted*.65+noise(u*230,v*230)*.45)*Math.min(1,Math.max(0,(730-h)/220));
 const water=network.sample(lx,lz);
 if(water.distance<40)forest*=Math.max(0,water.distance/40);
 for(const plain of network.plains){const d=Math.hypot(lx-plain.x,lz-plain.z)/plain.source.radius;if(d<1)forest*=Math.max(.03,d*d);}
 const i=(y*size+x)*4;bytes.writeUInt16LE(Math.round(Math.min(maxHeight,h)/maxHeight*65535),i);
 bytes[i+2]=Math.round(Math.max(0,Math.min(1,forest))*255);bytes[i+3]=water.distance<0?255:0;
}
const version=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12);
fs.mkdirSync('public/assets/terrain',{recursive:true});
fs.writeFileSync('public/assets/terrain/viremont-field.bin',bytes);
fs.writeFileSync('src/data/terrain/viremont.json',JSON.stringify({version,bounds,size,width,height,maxHeight,waterLevel:54,url:`/assets/terrain/viremont-field.bin?v=${version}`,encoding:'uint16le-height,uint8-forest,uint8-water',sourceResolution:[source.width,source.height],status:'provisional',heightBasis:'ridge-source.json: connected crest networks, branching spurs, talus and valley incisions; illustrative elevations',waterBasis:'hydrology-source.json: authored courses with shared junction elevations and a mountain spring; no flow simulation',coordinateSystem:'elarion-normalized-uv',physicalScale:null,seed:82511}));
console.log(`Saved shared ${size}² terrain, ${authored.courses.length} watercourses, ${authored.lakes.length} lowland lakes and ${authored.plains.length} open terraces. Global geography unchanged.`);
