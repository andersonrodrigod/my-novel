import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import pc from 'polygon-clipping';
import { pointInPolygon } from '../src/geography/coordinates.ts';
import { readArtwork, suitability } from './terrain-suitability.mjs';

const data=JSON.parse(fs.readFileSync('src/data/viremont/duchies.json','utf8'));
const world=JSON.parse(fs.readFileSync('src/data/world/political-map.json','utf8'));
const national=world.countries.find(c=>c.nationId==='aetheria-07');
const baseline=JSON.parse(fs.readFileSync('references/viremont-duchies-baseline.json','utf8'));
const editorial=fs.readFileSync('viremont_ducados_codex.md','utf8');
const owns=(point,geometry)=>geometry.some(p=>pointInPolygon(point,p[0])&&!p.slice(1).some(h=>pointInPolygon(point,h)));
const area=ring=>Math.abs(ring.reduce((sum,p,i)=>{const q=ring[(i+1)%ring.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
const size=multi=>multi.reduce((sum,p)=>sum+area(p[0])-p.slice(1).reduce((a,h)=>a+area(h),0),0);
assert.equal(data.duchies.length,6);assert.equal(new Set(data.duchies.map(d=>d.id)).size,6);
const expected=['nortar','valeris','selveria','erdel','montelur','thargrund'].map(id=>`viremont-${id}`);
assert.deepEqual(data.duchies.map(d=>d.id),expected);
for(const duchy of data.duchies){
  assert.equal(duchy.parentNationId,'aetheria-07');assert.equal(duchy.status,'provisional');assert.equal(duchy.geometry.length,1,`${duchy.id}: disconnected region`);
  assert(owns(duchy.labelAnchor,duchy.geometry),`${duchy.id}: label outside duchy`);
  assert(size(pc.difference(duchy.geometry,national.geometry))<1e-9,`${duchy.id}: outside Viremont`);
  assert(editorial.includes(`### 2.${duchy.editorialSection} Ducado de `));
  console.log(`${duchy.id}: ${(100*size(duchy.geometry)/size(national.geometry)).toFixed(1)}% of map-coordinate area`);
}
const united=pc.union(...data.duchies.map(d=>d.geometry));
assert(size(pc.xor(united,national.geometry))<1e-9,'Incomplete territorial coverage');
assert(Math.abs(data.duchies.reduce((sum,d)=>sum+size(d.geometry),0)-size(united))<1e-9,'Overlapping duchies');
assert.equal(data.duchies.find(d=>owns(national.citySite,d.geometry))?.id,'viremont-valeris','Existing city proposal not in Valeris');
const thargrund=data.duchies.find(d=>d.id==='viremont-thargrund'),image=readArtwork('aetheria');let openPatches=0;
for(let y=.395;y<.43;y+=.002)for(let x=.321;x<.356;x+=.002)if(owns([x,y],thargrund.geometry)&&suitability(image,Math.round(x*image.width),Math.round(y*image.height))>.5)openPatches++;
assert(openPatches>10,'Thargrund must include open foothill land, not only mountains');
assert(owns([.298,.354],data.duchies.find(d=>d.id==='viremont-selveria').geometry),'Selvéria lost its requested western river approach');
for(let y=.29;y<.49;y+=.004)for(let x=.25;x<.39;x+=.004){const point=[x,y],matches=data.duchies.filter(d=>owns(point,d.geometry));if(!owns(point,national.geometry))assert.equal(matches.length,0,'Neighbor selected as a duchy');}
for(const [file,hash] of Object.entries(baseline)){
  const source=fs.readFileSync(file);
  // Editorial approval freezes content, independently of checkout line endings.
  const content=file==='viremont_ducados_codex.md'?source.toString('utf8').replace(/\r\n/g,'\n'):source;
  assert.equal(crypto.createHash('sha256').update(content).digest('hex'),hash,`${file}: protected geography, source art or editorial changed`);
}
console.log('Verified six connected asymmetric duchies, containment, coverage, city ownership, neighbor exclusion and unchanged global geography/artwork/editorial.');
