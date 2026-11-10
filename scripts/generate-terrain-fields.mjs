import fs from 'node:fs';
import crypto from 'node:crypto';
import pc from 'polygon-clipping';
import { readArtwork } from './terrain-suitability.mjs';

// A separate, provisional height interpretation. Source artwork/political data are read-only.
const bounds=[.245,.285,.395,.505],size=257,width=8192,maxHeight=1400;
const source=readArtwork('aetheria'),height=width*(bounds[3]-bounds[1])/(2*(bounds[2]-bounds[0])*Math.cos((.5-.395)*Math.PI));
const water=new Uint8Array(size*size),forest=new Uint8Array(size*size);
const pixel=(u,v)=>{const x=Math.max(0,Math.min(source.width-1,Math.round(u*source.width))),y=Math.max(0,Math.min(source.height-1,Math.round(v*source.height)));return [...source.data.subarray((y*source.width+x)*4,(y*source.width+x)*4+3)];};
const at=(x,y)=>y*size+x;
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const u=bounds[0]+x/(size-1)*(bounds[2]-bounds[0]),v=bounds[1]+y/(size-1)*(bounds[3]-bounds[1]);
 let greens=0,blues=0;
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
  const [r,g,b]=pixel(u+dx/source.width*.55,v+dy/source.height*.55);
  greens+=g>r*1.07&&g>b*1.15&&r<120&&g<180?1:0;
  blues+=b>r*1.17&&b>g*1.025&&b>65?1:0;
 }
 // Snow/blue shadows on the painted southern range are not river channels.
 const mountainShadow=u>.321&&v>.405;
 water[at(x,y)]=!mountainShadow&&blues>=4?255:0;forest[at(x,y)]=Math.round(greens/9*255);
}
const distance=new Float32Array(size*size).fill(1000);
for(let i=0;i<water.length;i++)if(water[i])distance[i]=0;
for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=at(x,y);if(x)distance[i]=Math.min(distance[i],distance[i-1]+1);if(y)distance[i]=Math.min(distance[i],distance[i-size]+1);}
for(let y=size-1;y>=0;y--)for(let x=size-1;x>=0;x--){const i=at(x,y);if(x<size-1)distance[i]=Math.min(distance[i],distance[i+1]+1);if(y<size-1)distance[i]=Math.min(distance[i],distance[i+size]+1);}
const peaks=[
 [.338,.430,840,.008,.010],[.350,.440,1220,.008,.014],[.363,.451,1180,.009,.013],
 [.342,.466,890,.010,.008],[.329,.449,610,.006,.012],[.369,.426,660,.006,.009],
 [.274,.318,520,.008,.006],[.291,.293,640,.013,.005],[.368,.319,450,.012,.006],
 [.373,.378,260,.006,.013],[.285,.442,170,.010,.014]
];
const hash=(x,y)=>{const a=Math.sin(x*127.1+y*311.7)*43758.5453;return a-Math.floor(a);};
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),a=x-ix,b=y-iy,s=a*a*(3-2*a),t=b*b*(3-2*b);return (hash(ix,iy)*(1-s)+hash(ix+1,iy)*s)*(1-t)+(hash(ix,iy+1)*(1-s)+hash(ix+1,iy+1)*s)*t;}
const bytes=Buffer.alloc(size*size*4);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const u=bounds[0]+x/(size-1)*(bounds[2]-bounds[0]),v=bounds[1]+y/(size-1)*(bounds[3]-bounds[1]);
 let mountain=0;for(const [px,py,h,sx,sy] of peaks)mountain=Math.max(mountain,h*Math.exp(-(((u-px)/sx)**2+((v-py)/sy)**2)*.7));
 const ridge=1-Math.abs(noise(u*430,v*430)*2-1);
 mountain*=.68+.22*ridge+.10*noise(u*900,v*900);
 const d=distance[at(x,y)],influence=Math.min(1,Math.max(0,(d-2)/5));
 let h=55+20*noise(u*150,v*150)+28*noise(u*350,v*350)+mountain;
 // A bank buffer keeps coarse triangles from forming dams over narrow painted channels.
 h=d<2?46+d*3:54+(h-54)*influence;
 const i=at(x,y)*4;bytes.writeUInt16LE(Math.round(Math.min(maxHeight,h)/maxHeight*65535),i);bytes[i+2]=forest[at(x,y)];bytes[i+3]=water[at(x,y)];
}
// Vector footprints from the same water mask. Row runs retain topology and source registration.
const strips=[];
for(let y=0;y<size-1;y++)for(let x=0;x<size-1;x++)if(water[at(x,y)]){
 const start=x;while(x<size-2&&water[at(x+1,y)])x++;
 const u=bounds[0]+start/(size-1)*(bounds[2]-bounds[0]),v=bounds[1]+y/(size-1)*(bounds[3]-bounds[1]);
 const r=bounds[0]+(x+1)/(size-1)*(bounds[2]-bounds[0]),b=bounds[1]+(y+1)/(size-1)*(bounds[3]-bounds[1]);
 strips.push([[[u,v],[r,v],[r,b],[u,b],[u,v]]]);
}
const patches=[];for(let i=0;i<strips.length;i+=200)patches.push(pc.union(...strips.slice(i,i+200)));
const footprints=pc.union(...patches);
const version=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12);
fs.mkdirSync('public/assets/terrain',{recursive:true});
fs.writeFileSync('public/assets/terrain/viremont-field.bin',bytes);
fs.writeFileSync('src/data/terrain/viremont.json',JSON.stringify({version,bounds,size,width,height,maxHeight,waterLevel:54,url:`/assets/terrain/viremont-field.bin?v=${version}`,encoding:'uint16le-height,uint8-forest,uint8-water',sourceResolution:[source.width,source.height],status:'provisional',heightBasis:'Authored ridge constraints following painted mountains; not measured elevation',waterBasis:'Reviewed-color extraction draft; river direction and real elevations unknown',coordinateSystem:'elarion-normalized-uv',physicalScale:null,seed:82511}));
fs.writeFileSync('src/data/terrain/hydrology-draft.json',JSON.stringify({status:'draft-needs-review',source:'active-aetheria-artwork',coordinateSystem:'elarion-normalized-uv',flowDirection:null,sourcePixelTolerance:2,features:footprints.map((p,i)=>({id:`viremont-water-draft-${String(i+1).padStart(3,'0')}`,kind:'painted-water-footprint',geometry:[p],names:[],flowDirection:null}))}));
console.log(`Saved shared ${size}² height/forest/water field and ${footprints.length} draft water footprints. No global geography changed.`);
