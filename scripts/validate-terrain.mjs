import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { TerrainField } from '../src/geography/terrain/TerrainField.ts';
import { terrainGeometry, waterGeometry } from '../src/components/terrain/terrainGeometry.ts';
import { pointInPolygon } from '../src/geography/coordinates.ts';

const manifest=JSON.parse(fs.readFileSync('src/data/terrain/viremont.json','utf8'));
const buffer=fs.readFileSync('public/assets/terrain/viremont-field.bin');
assert.equal(crypto.createHash('sha256').update(buffer).digest('hex').slice(0,12),manifest.version);
const field=new TerrainField(manifest,buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength));
const duchies=JSON.parse(fs.readFileSync('src/data/viremont/duchies.json','utf8')).duchies;
assert.equal(duchies.length,6);assert.equal(manifest.physicalScale,null);
for(const duchy of duchies){
 const points=duchy.geometry.flat(2);let low=Infinity,high=-Infinity,open=0;
 for(const point of [...points,duchy.labelAnchor]){
  const [x,z]=field.toLocal(point),back=field.toMap(x,z);
  assert.ok(Math.abs(back[0]-point[0])<1e-12&&Math.abs(back[1]-point[1])<1e-12,'Map/local coordinates drifted');
  assert.ok(Math.abs(x)<=manifest.width/2&&Math.abs(z)<=manifest.height/2,'Duchy outside heightfield');
 }
 const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
 for(let y=minY;y<=maxY;y+=(maxY-minY)/25)for(let x=minX;x<=maxX;x+=(maxX-minX)/25){
  if(!duchy.geometry.some(poly=>pointInPolygon([x,y],poly[0])))continue;
  const [a,b]=field.toLocal([x,y]),h=field.elevation(a,b);assert.ok(Number.isFinite(h));low=Math.min(low,h);high=Math.max(high,h);
  if(field.slope(a,b)<.45&&field.sample(a,b,'water')<.01)open++;
 }
 assert.ok(high-low>5,'No real elevation variation');assert.ok(open>5,'No ground exploration space');
 console.log(`${duchy.id}: accessible ground and relief ${low.toFixed(1)}–${high.toFixed(1)} internal units`);
}
// Neighboring tessellations must agree on shared geographic samples.
const left=terrainGeometry(field,-1000,-500,500,500,16),right=terrainGeometry(field,-500,-500,500,500,64);
for(let row=0;row<=16;row++){
 const a=(row*17+16)*3,b=(row*4*65)*3,ap=left.getAttribute('position'),bp=right.getAttribute('position');
 for(let k=0;k<3;k++)assert.ok(Math.abs(ap.array[a+k]-bp.array[b+k])<1e-4,'Tile edge moved between detail levels');
}
for(const geometry of [left,right]){for(const value of geometry.getAttribute('normal').array)assert.ok(Number.isFinite(value));geometry.dispose();}
const hydro=JSON.parse(fs.readFileSync('src/data/terrain/hydrology-draft.json','utf8'));
assert.equal(hydro.status,'draft-needs-review');assert.equal(hydro.flowDirection,null);assert.ok(hydro.features.length>0);
const water=waterGeometry(field,hydro.features),waterVertices=water.getAttribute('position');
for(let i=0;i<waterVertices.count;i++)assert.ok(Math.abs(waterVertices.getY(i)-(manifest.waterLevel+.35))<.001,'Water surface left its registered level');
assert.ok(waterVertices.count>0);water.dispose();
const city=JSON.parse(fs.readFileSync('src/data/world/political-map.json','utf8')).countries.find(c=>c.nationId==='aetheria-07').citySite;
const [cx,cz]=field.toLocal(city);assert.ok(field.sample(cx,cz,'water')<.1,'Existing city location became water');
console.log('Verified terrain binary, all six duchies, map registration, shared LOD edges, finite normals and city preservation. Water footprints remain explicitly provisional.');
