import fs from 'node:fs';
import assert from 'node:assert/strict';
import polygonClipping from 'polygon-clipping';

const baseline=JSON.parse(fs.readFileSync('references/polar-expansion-baseline.json','utf8'));
const proposed=JSON.parse(fs.readFileSync('references/polar-expansion-contours.json','utf8'));
const coasts=structuredClone(baseline.coastlines);
const land=rings=>rings.map(r=>[[...r,r[0]]]);
function area(ring){return Math.abs(ring.reduce((a,p,i)=>{const q=ring[(i+1)%ring.length];return a+p[0]*q[1]-q[0]*p[1];},0))/2;}
const size=multi=>multi.reduce((a,poly)=>a+area(poly[0])-poly.slice(1).reduce((s,h)=>s+area(h),0),0);
const round=multi=>multi.map(poly=>poly.map(r=>r.map(p=>p.map(v=>Number(v.toFixed(7))))));
const expansions=[],climateRegions=[];
for(const id of ['eryndor','namaris']){
  const original=land(coasts[id]);
  const otherLand=Object.entries(coasts).filter(([key])=>key!==id).flatMap(([,rings])=>land(rings));
  const paint=polygonClipping.difference(land(proposed[id]),otherLand);
  const combined=polygonClipping.union(original,paint).map(poly=>[poly[0],...poly.slice(1).filter(hole=>area(hole)>1e-10)]);
  const additions=polygonClipping.difference(combined,original);
  assert(size(additions)>size(original)*.15,`${id}: extension too small`);
  assert(combined.every(poly=>poly.length===1),'Unexpected enclosed coastline hole');
  coasts[id]=round(combined).map(poly=>poly[0]).sort((a,b)=>area(b)-area(a));
  // Split only the new land into a cold transition and a snowy extremity.
  let low=0,high=1;
  const northern=id==='eryndor',snowShare=northern?.5:.4;
  const rectangle=y=>northern?[[[[0,0],[1,0],[1,y],[0,y],[0,0]]]]:[[[[0,y],[1,y],[1,1],[0,1],[0,y]]]];
  for(let i=0;i<40;i++){
    const mid=(low+high)/2,share=size(polygonClipping.intersection(additions,rectangle(mid)))/size(additions);
    if(northern?share<snowShare:share>snowShare)low=mid;else high=mid;
  }
  const snow=polygonClipping.intersection(additions,rectangle((low+high)/2));
  const tundra=polygonClipping.difference(additions,snow);
  climateRegions.push({id:`${id}-expansion-snow`,continentId:id,climate:'snow',geometry:round(snow)},{id:`${id}-expansion-tundra`,continentId:id,climate:'tundra',geometry:round(tundra)});
  expansions.push({continentId:id,paintGeometry:round(paint),addedGeometry:round(additions),snowShare});
  console.log(`${id}: ${(size(combined)/size(original)*100-100).toFixed(1)}% added map area`);
}
for(const [id,rings] of Object.entries(baseline.coastlines))if(!['eryndor','namaris'].includes(id))assert.deepEqual(coasts[id],rings);
fs.writeFileSync('src/data/world/coastlines.json',JSON.stringify(coasts));
fs.writeFileSync('src/data/world/polar-expansion.json',JSON.stringify({schemaVersion:1,status:'proposed',expansions,climateRegions}));
console.log('Extended only Eryndor and Namaris; all other coastlines preserved.');
