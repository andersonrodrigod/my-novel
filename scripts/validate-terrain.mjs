import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { TerrainField } from '../src/geography/terrain/TerrainField.ts';
import { terrainGeometry, waterGeometry, bankGeometry } from '../src/components/terrain/terrainGeometry.ts';
import { pointInPolygon } from '../src/geography/coordinates.ts';

const manifest=JSON.parse(fs.readFileSync('src/data/terrain/viremont.json','utf8'));
const buffer=fs.readFileSync('public/assets/terrain/viremont-field.bin');
assert.equal(crypto.createHash('sha256').update(buffer).digest('hex').slice(0,12),manifest.version);
const hydro=JSON.parse(fs.readFileSync('src/data/terrain/hydrology-source.json','utf8'));
const field=new TerrainField(manifest,buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),hydro);
const ridgeSource=JSON.parse(fs.readFileSync('src/data/terrain/ridge-source.json','utf8'));
const spine=ridgeSource.ridges.find(r=>r.id==='thargrund-main-spine');
assert.ok(spine,'Missing connected mountain spine');
// The generated field must retain high saddles between adjacent high crests,
// rather than reverting to isolated peaks with a flat gap between them.
for(let i=1;i<spine.points.length;i++){
 const a=spine.points[i-1],b=spine.points[i],saddleFloor=Math.min(a[2],b[2])*.45;
 if(saddleFloor<225)continue;
 for(const t of [.25,.5,.75]){
  const [x,z]=field.toLocal([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
  assert.ok(field.elevation(x,z)>saddleFloor,'Mountain spine lost its connecting saddle');
 }
}
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
assert.equal(hydro.status,'illustrative-proposal');assert.equal(hydro.physicalScale,null);
assert.equal(new Set(hydro.courses.map(c=>c.id)).size,hydro.courses.length);
assert.equal(hydro.lakes.length,6);assert.equal(hydro.courses.filter(c=>c.kind==='spring').length,1);
assert.equal(new Set(hydro.lakes.map(l=>l.duchyId)).size,6);
const owns=(p,d)=>d.geometry.some(poly=>pointInPolygon(p,poly[0])&&!poly.slice(1).some(h=>pointInPolygon(p,h)));
for(const lake of hydro.lakes){
 const duchy=duchies.find(d=>d.id===lake.duchyId);assert.ok(duchy&&owns(lake.center,duchy),`${lake.id}: lake outside its duchy`);
 assert.ok(lake.level<160,`${lake.id}: lake must remain in a lowland/foothill valley`);
 assert.equal(hydro.courses.find(c=>c.id===lake.inlet)?.joins,lake.id);
 assert.deepEqual(hydro.courses.find(c=>c.id===lake.outlet)?.points[0].slice(0,3),[...lake.center,lake.level]);
 const [x,z]=field.toLocal(lake.center);assert.ok(field.elevation(x,z)<lake.level-5,'Lake bed must be below water');
 const localLake=field.hydrology.lakes.find(l=>l.site.id===lake.id);
 for(const id of [lake.inlet,lake.outlet])for(const p of field.hydrology.courses.find(c=>c.source.id===id).stations){
  if(Math.hypot((p.x-x)/localLake.rx,(p.z-z)/localLake.rz)<.85)assert.ok(Math.abs(p.level-lake.level)<.1,`${id}: stream suspended above/below lake surface`);
 }
}
for(const course of hydro.courses){
 assert.ok(course.points.length>1);
 for(let i=1;i<course.points.length;i++)assert.ok(course.points[i][2]<=course.points[i-1][2],`${course.id}: uphill water profile`);
 if(!course.joins)continue;
 const end=course.points.at(-1).slice(0,3),lake=hydro.lakes.find(l=>l.id===course.joins),river=hydro.courses.find(c=>c.id===course.joins);
 assert.ok(lake||river,`${course.id}: missing drainage destination`);
 if(lake)assert.deepEqual(end,[...lake.center,lake.level]);
 if(river)assert.ok(river.points.some(p=>p.slice(0,3).every((v,i)=>v===end[i])),`${course.id}: disconnected or inconsistent river junction`);
}
const spring=hydro.courses.find(c=>c.kind==='spring');assert.ok(spring.points[0][2]>400,'Mountain feature must be an elevated spring');
for(const plain of hydro.plains){
 const duchy=duchies.find(d=>d.id===plain.duchyId);assert.ok(duchy&&owns(plain.center,duchy),`${plain.id}: open ground outside duchy`);
 const [x,z]=field.toLocal(plain.center);assert.ok(field.slope(x,z)<.12,`${plain.id}: planned open ground is too steep`);
 assert.ok(field.hydrology.sample(x,z).distance>30,`${plain.id}: open ground flooded`);
}
const water=waterGeometry(field),waterVertices=water.getAttribute('position');
assert.ok(waterVertices.count>0);let buried=0,deep=0;
// Sample the actual coarsest tile triangle, not just the exact height function.
// Otherwise a smooth channel can still be covered by alternating terrain cells.
const coarseHeight=(x,z)=>{
 const sx=manifest.width/(12*32),sz=manifest.height/(12*32);
 const gx=(x+manifest.width/2)/sx,gz=(z+manifest.height/2)/sz,ix=Math.floor(gx),iz=Math.floor(gz),u=gx-ix,v=gz-iz;
 const x0=ix*sx-manifest.width/2,z0=iz*sz-manifest.height/2;
 const a=field.elevation(x0,z0),b=field.elevation(x0+sx,z0),c=field.elevation(x0,z0+sz),d=field.elevation(x0+sx,z0+sz);
 return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
};
let coveredEdges=0,edgeSamples=0;
for(let i=0;i<waterVertices.count;i++){
 const x=waterVertices.getX(i),z=waterVertices.getZ(i),y=waterVertices.getY(i);
 assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(z));
 if(water.getAttribute('waterDepth').getX(i)>.35){deep++;if(field.elevation(x,z)>y+.3)buried++;}
 edgeSamples++;if(coarseHeight(x,z)>y+.3)coveredEdges++;
}
assert.ok(coveredEdges/edgeSamples<.01,`Coarse terrain covers ${coveredEdges}/${edgeSamples} water samples`);
console.log(`Coarse terrain water clearance: ${edgeSamples-coveredEdges}/${edgeSamples} shoreline/interior samples clear`);
assert.ok(buried/deep<.01,'Terrain blocks the water surface');water.dispose();
const banks=bankGeometry(field);assert.ok(banks.getAttribute('position').count>0);banks.dispose();
const city=JSON.parse(fs.readFileSync('src/data/world/political-map.json','utf8')).countries.find(c=>c.nationId==='aetheria-07').citySite;
const [cx,cz]=field.toLocal(city);assert.ok(field.sample(cx,cz,'water')<.1,'Existing city location became water');
console.log('Verified all six duchies, connected mountain saddles, shared LODs, connected downhill watercourses, lowland lakes, mountain spring, dry open ground, water clearance and city preservation. Local elevations remain illustrative.');
