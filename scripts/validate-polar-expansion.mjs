import fs from 'node:fs';
import assert from 'node:assert/strict';
import polygonClipping from 'polygon-clipping';

const read=name=>JSON.parse(fs.readFileSync(name,'utf8'));
const baseline=read('references/polar-expansion-baseline.json');
const coasts=read('src/data/world/coastlines.json');
const politics=read('src/data/world/political-map.json');
const expansion=read('src/data/world/polar-expansion.json');
const repair=read('src/data/world/isthmus-repair.json');
const [x1,y1,x2,y2]=repair.bounds;
const repairPatch=[[[[x1,y1],[x2,y1],[x2,y2],[x1,y2],[x1,y1]]]];
const land=rings=>rings.map(r=>[[...r,r[0]]]);
function area(ring){return Math.abs(ring.reduce((a,p,i)=>{const q=ring[(i+1)%ring.length];return a+p[0]*q[1]-q[0]*p[1];},0))/2;}
const size=multi=>multi.reduce((a,poly)=>a+area(poly[0])-poly.slice(1).reduce((s,h)=>s+area(h),0),0);
for(const [id,rings] of Object.entries(baseline.coastlines)){
  if(!['eryndor','namaris'].includes(id)){
    if(['aetheria','drakmoria'].includes(id)){
      const before=polygonClipping.difference(land(rings),repairPatch),after=polygonClipping.difference(land(coasts[id]),repairPatch);
      assert(size(polygonClipping.xor(before,after))<1e-7,`${id}: coastline changed outside authorized isthmus repair`);
      for(const original of baseline.politicalMap.countries.filter(c=>c.continentId===id)){
        const current=politics.countries.find(c=>c.nationId===original.nationId);
        assert(size(polygonClipping.xor(polygonClipping.difference(original.geometry,repairPatch),polygonClipping.difference(current.geometry,repairPatch)))<1e-7,`${original.nationId}: territory changed outside isthmus repair`);
      }
    }else{
      assert.deepEqual(coasts[id],rings,`${id}: unrelated coastline changed`);
      for(const original of baseline.politicalMap.countries.filter(c=>c.continentId===id))assert.deepEqual(politics.countries.find(c=>c.nationId===original.nationId),original,`${original.nationId}: unrelated country changed`);
    }
  }else{
    assert(size(polygonClipping.difference(land(rings),land(coasts[id])))<1e-7,`${id}: original land lost`);
    assert(size(land(coasts[id]))>size(land(rings))*1.15,`${id}: no substantial extension`);
    assert.equal(politics.countries.filter(c=>c.continentId===id).length,id==='eryndor'?12:15);
  }
}
for(const [i,[id,rings]] of Object.entries(coasts).entries())for(const [otherId,otherRings] of Object.entries(coasts).slice(i+1))assert(size(polygonClipping.intersection(land(rings),land(otherRings)))<1e-7,`${id} overlaps ${otherId}`);
for(const patch of expansion.expansions){
  const regions=expansion.climateRegions.filter(r=>r.continentId===patch.continentId);
  const snow=regions.find(r=>r.climate==='snow');
  assert(Math.abs(size(snow.geometry)/size(patch.addedGeometry)-patch.snowShare)<.001);
  assert(size(polygonClipping.difference(patch.addedGeometry,polygonClipping.union(...regions.map(r=>r.geometry))))<1e-7);
}
console.log('Verified both land extensions, climate split, 27 redivided countries and preservation outside the authorized local isthmus repair.');
