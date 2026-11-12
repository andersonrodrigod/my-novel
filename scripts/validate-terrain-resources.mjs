import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { Worker } from 'node:worker_threads';
import { TerrainField } from '../src/geography/terrain/TerrainField.ts';
import { createRegionalVegetation,createLocalVegetation } from '../src/geography/terrain/vegetation.ts';
import { TerrainResources } from '../src/components/terrain/terrainResources.ts';
import { terrainGeometry,waterGeometry,bankGeometry } from '../src/components/terrain/terrainGeometry.ts';
import { waterFootprint } from '../src/geography/terrain/waterFootprint.ts';
import polygonClipping from 'polygon-clipping';

const manifest=JSON.parse(fs.readFileSync('src/data/terrain/viremont.json'));
const buffer=fs.readFileSync('public/assets/terrain/viremont-field.bin');
const data=buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength);
const hydrology=JSON.parse(fs.readFileSync('src/data/terrain/hydrology-source.json'));
const field=new TerrainField(manifest,data,hydrology);
const city=field.toLocal(JSON.parse(fs.readFileSync('src/data/world/political-map.json')).countries.find(c=>c.nationId==='aetheria-07').citySite);
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const regional=createRegionalVegetation(field,city);
for(const run of JSON.parse(fs.readFileSync('references/terrain-performance-baseline.json')).runs){
 const trees=run.close?regional.concat(createLocalVegetation(field,run.anchor,city)):regional;
 assert.equal(hash(trees),run.hash,'Vegetation changed while splitting the reusable and local layers');
}
console.log('Regional/local vegetation reproduces all five original position/species hashes.');

const thread=new Worker(new URL('./terrain-worker-test.mjs',import.meta.url),{execArgv:['--experimental-strip-types']});
const sent=[];
const port={onmessage:null,onerror:null,postMessage(message,transfer){if(message.kind==='job')sent.push(message.job.key);thread.postMessage(message,transfer);},terminate(){thread.terminate();}};
thread.on('message',data=>port.onmessage?.({data}));thread.on('error',error=>port.onerror?.({message:error.message}));
const resources=new TerrainResources(port,{kind:'init',manifest,buffer:data.slice(0),hydrology,city},180000);
try{
 const job={kind:'mesh',key:'test:32',x:-1000,z:-500,width:500,depth:500,resolution:32};
 const [a,b]=await Promise.all([resources.request(job).promise,resources.request(job).promise]);
 assert.equal(sent.filter(key=>key===job.key).length,1,'Duplicate worker task');
 assert.equal(a.value,b.value,'Duplicate cached geometry');
 const sync=terrainGeometry(field,job.x,job.z,job.width,job.depth,job.resolution);
 for(const name of Object.keys(sync.attributes))assert.deepEqual(a.value.getAttribute(name).array,sync.getAttribute(name).array,`${name}: worker changed mesh`);
 assert.deepEqual(a.value.index.array,sync.index.array);sync.dispose();
 let disposed=0;a.value.addEventListener('dispose',()=>disposed++);
 a.release();const cached=await resources.request(job).promise;assert.equal(cached.value,b.value);cached.release();
 const sharedJob={...job,key:'shared-canceled',resolution:16};
 const canceledShared=resources.request(sharedJob),survivor=resources.request(sharedJob);canceledShared.cancel();
 const survivingLease=await survivor.promise;survivingLease.release();assert.equal(sent.filter(key=>key===sharedJob.key).length,1);
 resources.setActive(false);const canceled=resources.request({...job,key:'canceled'});canceled.cancel();
 assert.equal(resources.stats().pending,0,'Canceled queued task retained');
 const paused=resources.request({...job,key:'paused'});assert.ok(!sent.includes('paused'));resources.setActive(true);
 const resumed=await paused.promise;resumed.release();
 const large=await resources.request({...job,key:'test:128',resolution:128}).promise;
 assert.equal(disposed,0,'Active geometry was evicted');
 b.release();assert.equal(disposed,1,'Inactive geometry was not evicted under memory pressure');
 large.release();assert.ok(resources.stats().geometryBytes<=180000,'Cache exceeds budget without active leases');
 console.log('Real worker transfer, mesh equality, request deduplication, cancellation, pause/resume and reference-safe cache eviction passed.');
}finally{resources.dispose();}

const failingPort={onmessage:null,onerror:null,postMessage(message){queueMicrotask(()=>this.onmessage?.({data:message.kind==='init'?{kind:'ready'}:{kind:'error',id:message.id,message:'Expected worker failure'}}));},terminate(){}};
const failedResources=new TerrainResources(failingPort,{kind:'init',manifest,buffer:data.slice(0),hydrology,city});
await assert.rejects(failedResources.request({kind:'regional',key:'error-check'}).promise,/Expected worker failure/);failedResources.dispose();
console.log('Worker failures reject pending consumers rather than hanging the loader.');

const area=polygons=>polygons.reduce((total,polygon)=>total+polygon.reduce((sum,ring,index)=>{
 let value=0;for(let i=1;i<ring.length;i++)value+=ring[i-1][0]*ring[i][1]-ring[i][0]*ring[i-1][1];return sum+(index?-1:1)*Math.abs(value/2);
},0),0);
const shape=waterFootprint(field),water=waterGeometry(field),position=water.getAttribute('position'),ix=water.index.array;
const depths=water.getAttribute('waterDepth');
let triangleArea=0;
for(let i=0;i<ix.length;i+=3){const [a,b,c]=[ix[i],ix[i+1],ix[i+2]];triangleArea+=Math.abs((position.getX(b)-position.getX(a))*(position.getZ(c)-position.getZ(a))-(position.getZ(b)-position.getZ(a))*(position.getX(c)-position.getX(a)))/2;
 for(const [u,v] of [[a,b],[b,c],[c,a]]){
  const span=Math.hypot(position.getX(u)-position.getX(v),position.getZ(u)-position.getZ(v));
  assert.ok(Math.abs(depths.getX(u)-depths.getX(v))<=span/40+.025,'Abrupt depth-color jump at a confluence');
 }
}
assert.ok(Math.abs(triangleArea-area(shape.water))/area(shape.water)<1e-6,'Water triangle coverage overlaps or leaves gaps');
assert.ok(area(polygonClipping.intersection(shape.water,shape.banks))<.001,'Banks cross the unified water');
for(const course of hydrology.courses.filter(c=>c.joins)){
 const [x,z]=field.toLocal(course.points.at(-1)),px=x+.731,pz=z+1.173;let covers=0;
 for(let i=0;i<ix.length;i+=3){
  const [a,b,c]=[ix[i],ix[i+1],ix[i+2]],ax=position.getX(a),az=position.getZ(a),bx=position.getX(b),bz=position.getZ(b),cx=position.getX(c),cz=position.getZ(c);
  const cross=(x1,z1,x2,z2)=>(x1-px)*(z2-pz)-(z1-pz)*(x2-px),v=[cross(ax,az,bx,bz),cross(bx,bz,cx,cz),cross(cx,cz,ax,az)];
  if(v.every(n=>n>0)||v.every(n=>n<0))covers++;
 }
 assert.equal(covers,1,`${course.id}: confluence has a second water layer or a gap`);
}
const banks=bankGeometry(field);banks.dispose();water.dispose();
console.log('Unified water covers its polygon once, banks remain outside, and every tributary/lake junction has one surface.');
