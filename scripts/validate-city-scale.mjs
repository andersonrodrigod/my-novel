import fs from 'node:fs';
import assert from 'node:assert/strict';
import { TerrainField } from '../src/geography/terrain/TerrainField.ts';
import { cityScale } from '../src/geography/terrain/cityScale.ts';
import { pointInPolygon } from '../src/geography/coordinates.ts';

const preview=JSON.parse(fs.readFileSync('src/data/terrain/city-scale-preview.json'));
const manifest=JSON.parse(fs.readFileSync('src/data/terrain/viremont.json'));
const bytes=fs.readFileSync('public/assets/terrain/viremont-field.bin');
const field=new TerrainField(manifest,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),JSON.parse(fs.readFileSync('src/data/terrain/hydrology-source.json')));
const duchy=JSON.parse(fs.readFileSync('src/data/viremont/duchies.json')).duchies.find(d=>d.id===preview.duchyId);
assert.equal(preview.status,'illustrative-proposal');assert.equal(preview.physicalScale,null);
let previous=0;
for(const share of preview.areaShares){
 const city=cityScale(field,duchy,preview.center,share,preview.aspect);
 assert.ok(Math.abs(city.cityArea/city.duchyArea-share)<1e-12,'Preview percent does not match its footprint');
 assert.ok(city.cityArea>previous);previous=city.cityArea;
 for(const [x,z] of [city.center,...city.ring]){
  const point=field.toMap(x,z);
  assert.ok(duchy.geometry.some(p=>pointInPolygon(point,p[0])&&!p.slice(1).some(h=>pointInPolygon(point,h))),'City preview leaves Valeris');
  assert.ok(field.hydrology.sample(x,z).distance>30,'City preview overlaps water');
  assert.ok(field.slope(x,z)<.12,'City preview is not on open flat ground');
 }
 console.log(`${share*100}%: exact area ratio, inside Valeris, on dry flat ground.`);
}
assert.equal(preview.comparisonMarquesadoShare/preview.defaultAreaShare,200);
