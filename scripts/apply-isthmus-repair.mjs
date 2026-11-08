import fs from 'node:fs';
import assert from 'node:assert/strict';
import { Delaunay } from 'd3-delaunay';
import pc from 'polygon-clipping';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const baseline=read('references/isthmus-repair-baseline.json');
const repair=read('src/data/world/isthmus-repair.json');
const contours=read('references/isthmus-repair-contours.json');
const coasts=structuredClone(baseline.coastlines),politics=structuredClone(baseline.politicalMap);
const [x1,y1,x2,y2]=repair.bounds;
const patch=[[[[x1,y1],[x2,y1],[x2,y2],[x1,y2],[x1,y1]]]];
const land=rings=>rings.map(r=>[[...r,r[0]]]);
const round=multi=>multi.map(poly=>poly.map(r=>r.map(p=>p.map(v=>Number(v.toFixed(7))))));
const area=ring=>Math.abs(ring.reduce((sum,p,i)=>{const q=ring[(i+1)%ring.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
// Preserve the existing continental seam while widening the physical land around it.
const drakSide=[[[[0,0],[.0336,0],[.5136,1],[0,1],[0,0]]]];
const visibleLand=pc.intersection(land(contours),patch);
for(const id of ['aetheria','drakmoria']){
  const partition=id==='drakmoria'?pc.intersection(visibleLand,drakSide):pc.difference(visibleLand,drakSide);
  const revised=pc.union(pc.difference(land(coasts[id]),patch),partition).map(poly=>[poly[0],...poly.slice(1).filter(r=>area(r)>1e-9)]);
  assert(revised.every(poly=>poly.length===1),'Unexpected large enclosed shoreline hole');
  coasts[id]=round(revised).map(poly=>poly[0]).sort((a,b)=>area(b)-area(a));
  const members=politics.countries.filter(c=>c.continentId===id);
  const clipped=members.map(country=>pc.intersection(country.geometry,revised));
  const additions=pc.difference(revised,pc.union(...clipped));
  const scaleX=2*Math.cos((.5-(y1+y2)/2)*Math.PI);
  const cells=Delaunay.from(members.map(c=>[c.citySite[0]*scaleX,c.citySite[1]])).voronoi([0,0,scaleX,1]);
  members.forEach((country,i)=>{
    const cell=[cells.cellPolygon(i).map(([x,y])=>[x/scaleX,y])];
    const extra=pc.intersection(additions,cell);
    country.geometry=round(extra.length?pc.union(clipped[i],extra):clipped[i]);
    assert(country.geometry.length,`${country.nationId}: empty country after coast repair`);
  });
}
for(const id of Object.keys(coasts))if(!['aetheria','drakmoria'].includes(id))assert.deepEqual(coasts[id],baseline.coastlines[id]);
fs.writeFileSync('src/data/world/coastlines.json',JSON.stringify(coasts));
fs.writeFileSync('src/data/world/political-map.json',JSON.stringify(politics));
console.log('Repaired the local isthmus shoreline and adjacent countries; preserved all territory outside the patch.');
