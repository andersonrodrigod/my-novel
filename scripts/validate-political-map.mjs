import fs from 'node:fs';
import assert from 'node:assert/strict';
import polygonClipping from 'polygon-clipping';
import { nations } from '../src/data/world/nations.ts';
import { readArtwork, suitability } from './terrain-suitability.mjs';

const source=JSON.parse(fs.readFileSync('src/data/world/political-map.json','utf8'));
const coasts=JSON.parse(fs.readFileSync('src/data/world/coastlines.json','utf8'));
const images=new Map(Object.keys(coasts).map(id=>[id,readArtwork(id)]));
function area(ring){return Math.abs(ring.reduce((a,p,i)=>{const q=ring[(i+1)%ring.length];return a+p[0]*q[1]-q[0]*p[1];},0))/2;}
const size=multi=>multi.reduce((a,poly)=>a+area(poly[0])-poly.slice(1).reduce((sum,hole)=>sum+area(hole),0),0);
function inside([x,y],ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
const owns=(p,c)=>c.geometry.some(poly=>inside(p,poly[0])&&!poly.slice(1).some(hole=>inside(p,hole)));
assert.equal(source.countries.length,94);
assert.equal(new Set(source.countries.map(c=>c.nationId)).size,94);
for(const country of source.countries){
  assert(nations.some(n=>n.id===country.nationId&&n.continentId===country.continentId));
  assert(owns(country.citySite,country),`${country.nationId}: city outside its own territory`);
  for(let i=0;i<32;i++){
    const angle=i*Math.PI/16;
    assert(owns([country.citySite[0]+Math.cos(angle)*5/1536,country.citySite[1]+Math.sin(angle)*5/1024],country),`${country.nationId}: insufficient city clearance`);
  }
  assert(country.siteSuitability>.5);
  const image=images.get(country.continentId);
  assert(suitability(image,Math.round(country.citySite[0]*image.width),Math.round(country.citySite[1]*image.height))>.5,`${country.nationId}: city site no longer matches open terrain`);
}
for(const [id,rings] of Object.entries(coasts)){
  const countries=source.countries.filter(c=>c.continentId===id);
  assert.equal(countries.length,nations.filter(n=>n.continentId===id).length);
  const land=rings.map(r=>[[...r,r[0]]]);
  const territories=polygonClipping.union(...countries.map(c=>c.geometry));
  const missing=size(polygonClipping.difference(land,territories));
  const extra=size(polygonClipping.difference(territories,land));
  const overlapping=countries.reduce((a,c)=>a+size(c.geometry),0)-size(territories);
  assert(missing<1e-7&&extra<1e-7&&overlapping<1e-7,`${id}: coverage or overlap failure`);
}
console.log('Validated 94 unique countries, counts, land coverage, no overlaps, and 94 city clearances.');
