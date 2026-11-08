import fs from 'node:fs';
import assert from 'node:assert/strict';
import pc from 'polygon-clipping';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const baseline=read('references/isthmus-repair-baseline.json');
const coasts=read('src/data/world/coastlines.json'),politics=read('src/data/world/political-map.json'),repair=read('src/data/world/isthmus-repair.json');
const land=rings=>rings.map(r=>[[...r,r[0]]]);
const area=ring=>Math.abs(ring.reduce((a,p,i)=>{const q=ring[(i+1)%ring.length];return a+p[0]*q[1]-q[0]*p[1];},0))/2;
const size=multi=>multi.reduce((a,p)=>a+area(p[0])-p.slice(1).reduce((s,h)=>s+area(h),0),0);
const [x1,y1,x2,y2]=repair.bounds,patch=[[[[x1,y1],[x2,y1],[x2,y2],[x1,y2],[x1,y1]]]];
function inside([x,y],ring){let v=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
const owns=(p,c)=>c.geometry.some(poly=>inside(p,poly[0])&&!poly.slice(1).some(hole=>inside(p,hole)));
for(const [id,rings] of Object.entries(coasts)){
  if(!['aetheria','drakmoria'].includes(id))assert.deepEqual(rings,baseline.coastlines[id]);
  else assert(size(pc.xor(pc.difference(land(rings),patch),pc.difference(land(baseline.coastlines[id]),patch)))<1e-7,`${id}: nonlocal coast change`);
}
for(const country of politics.countries){
  const original=baseline.politicalMap.countries.find(c=>c.nationId===country.nationId);
  assert(size(pc.xor(pc.difference(country.geometry,patch),pc.difference(original.geometry,patch)))<1e-7,`${country.nationId}: nonlocal country change`);
}
const physicalLand=pc.union(land(coasts.aetheria),land(coasts.drakmoria));
assert(physicalLand.some(poly=>inside([.22,.515],poly[0])&&inside([.275,.47],poly[0])),'The two land masses are not continuously connected');
const stream=repair.tributary,source=politics.countries.find(c=>c.nationId===stream.sourceNationId),destination=politics.countries.find(c=>c.nationId===stream.destinationNationId);
assert(owns(stream.path[0],source),'Mountain source is outside Brenkar');
assert(owns(stream.path.at(-1),destination),'River mouth is outside Mazdrin');
assert(inside(stream.path.at(-1),repair.lake.outline),'Tributary does not enter the lake');
console.log('Verified continuous land connection, Brenkar-to-Mazdrin lake inflow, and preservation of all geography outside the local repair.');
