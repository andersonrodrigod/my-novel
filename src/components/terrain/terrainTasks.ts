import type { BufferGeometry } from 'three';
import { TerrainField } from '../../geography/terrain/TerrainField.ts';
import { createLocalVegetation, createRegionalVegetation } from '../../geography/terrain/vegetation.ts';
import { bankGeometry, terrainGeometry, waterGeometry } from './terrainGeometry.ts';
import type { GeometryData, TerrainJob, TerrainJobData, TerrainWorkerInput } from './terrainProtocol.ts';

export function geometryData(geometry:BufferGeometry):GeometryData{
 const attributes:GeometryData['attributes']={};
 for(const [name,attribute] of Object.entries(geometry.attributes))attributes[name]={array:attribute.array as Float32Array,itemSize:attribute.itemSize};
 return {attributes,index:geometry.index?.array as Uint16Array|Uint32Array??null};
}
export function terrainTaskProcessor(init:Extract<TerrainWorkerInput,{kind:'init'}>){
 const field=new TerrainField(init.manifest,init.buffer,init.hydrology);
 return (job:TerrainJob):TerrainJobData=>{
  if(job.kind==='regional')return createRegionalVegetation(field,init.city);
  if(job.kind==='local')return createLocalVegetation(field,job.anchor,init.city);
  const geometry=job.kind==='mesh'?terrainGeometry(field,job.x,job.z,job.width,job.depth,job.resolution):job.kind==='water'?waterGeometry(field):bankGeometry(field);
  const data=geometryData(geometry);geometry.dispose();return data;
 };
}
export function terrainTransferables(data:TerrainJobData):ArrayBuffer[]{
 if(Array.isArray(data))return [];
 return [...Object.values(data.attributes).map(a=>a.array.buffer as ArrayBuffer),...(data.index?[data.index.buffer as ArrayBuffer]:[])];
}
