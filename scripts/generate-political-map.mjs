import fs from 'node:fs';
import { Delaunay } from 'd3-delaunay';
import polygonClipping from 'polygon-clipping';
import { nations } from '../src/data/world/nations.ts';
import { readArtwork, suitability } from './terrain-suitability.mjs';

const coastlines=JSON.parse(fs.readFileSync('src/data/world/coastlines.json','utf8'));
const seed=78431;
let state=seed;
const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
function contains([x,y],ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function area(ring){let a=0;for(let i=0;i<ring.length;i++){const b=ring[(i+1)%ring.length];a+=ring[i][0]*b[1]-b[0]*ring[i][1];}return Math.abs(a)/2;}
const requested=new Set(process.argv.slice(2));
for(const id of requested)if(!(id in coastlines))throw new Error(`Unknown continent: ${id}`);
const previous=JSON.parse(fs.readFileSync('src/data/world/political-map.json','utf8'));
const entries=requested.size?previous.countries.filter(country=>!requested.has(country.continentId)):[];
for(const [continentId,rings] of Object.entries(coastlines)){
  if(requested.size&&!requested.has(continentId))continue;
  if(requested.size)state=seed+[...continentId].reduce((sum,c)=>sum+c.charCodeAt(0)*31,0);
  const image=readArtwork(continentId);
  const all=rings.flat(),minX=Math.min(...all.map(p=>p[0])),maxX=Math.max(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),maxY=Math.max(...all.map(p=>p[1]));
  const scaleX=2*Math.cos(((minY+maxY)/2-.5)*Math.PI);
  const project=([x,y])=>[x*scaleX,y],unproject=([x,y])=>[x/scaleX,y];
  const candidates=[];
  for(let y=Math.max(6,Math.ceil(minY*image.height));y<Math.min(image.height-6,maxY*image.height);y+=3){
    for(let x=Math.max(6,Math.ceil(minX*image.width));x<Math.min(image.width-6,maxX*image.width);x+=3){
      const p=[x/image.width,y/image.height];if(!rings.some(r=>contains(p,r)))continue;
      // Reserve the surrounding patch on land as well as the city center itself.
      if(!Array.from({length:32},(_,i)=>i*Math.PI/16).every(angle=>rings.some(r=>contains([(x+Math.cos(angle)*5)/image.width,(y+Math.sin(angle)*5)/image.height],r))))continue;
      const score=suitability(image,x,y);if(score)candidates.push({point:p,projected:project(p),score});
    }
  }
  const members=nations.filter(n=>n.continentId===continentId);
  if(candidates.length<members.length)throw new Error(`${continentId}: insufficient suitable city sites (${candidates.length})`);
  const selected=[candidates[Math.floor(random()*candidates.length)]];
  while(selected.length<members.length){
    let best=null,bestScore=-1;
    for(const candidate of candidates){const distance=Math.min(...selected.map(s=>(candidate.projected[0]-s.projected[0])**2+(candidate.projected[1]-s.projected[1])**2));const score=distance*(.7+.3*candidate.score)*(.9+random()*.2);if(score>bestScore){best=candidate;bestScore=score;}}
    selected.push(best);
  }
  const voronoi=Delaunay.from(selected.map(s=>s.projected)).voronoi([minX*scaleX-.01,minY-.01,maxX*scaleX+.01,maxY+.01]);
  const land=rings.map(r=>[[...r.map(project),project(r[0])]]);
  members.forEach((nation,i)=>{
    const cell=voronoi.cellPolygon(i);const clipped=polygonClipping.intersection([cell],land);
    const geometry=clipped.map(poly=>poly.map(ring=>ring.map(p=>unproject(p).map(v=>Number(v.toFixed(7))))));
    const citySite=selected[i].point.map(v=>Number(v.toFixed(7)));
    if(!geometry.some(poly=>contains(citySite,poly[0])&&!poly.slice(1).some(hole=>contains(citySite,hole))))throw new Error(`${nation.name}: city not in own country`);
    const countryArea=geometry.reduce((sum,poly)=>sum+area(poly[0])-poly.slice(1).reduce((a,h)=>a+area(h),0),0);
    if(countryArea<.000025)throw new Error(`${nation.name}: territory too small`);
    entries.push({nationId:nation.id,continentId,citySite,cityClearance:5/image.width,siteSuitability:Number(selected[i].score.toFixed(3)),geometry});
  });
  console.log(`${continentId}: ${members.length} countries; ${candidates.length} suitable candidate sites`);
}
entries.sort((a,b)=>nations.findIndex(n=>n.id===a.nationId)-nations.findIndex(n=>n.id===b.nationId));
fs.writeFileSync('src/data/world/political-map.json',JSON.stringify({schemaVersion:1,seed,status:'proposed',method:'Seeded Voronoi cells clipped to persistent land polygons, anchored at open-terrain city sites',siteCheck:'11px patch, >=78% grass/sand colors, no water, <2.5% dark cover; illustrative suitability only, not a terrain survey',countries:entries}));
console.log(`Saved ${entries.length} proposed countries and city sites.`);
