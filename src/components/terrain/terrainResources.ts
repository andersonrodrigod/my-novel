import { BufferAttribute, BufferGeometry } from 'three';
import type { TerrainField } from '../../geography/terrain/TerrainField';
import type { HydrologySource } from '../../geography/terrain/hydrology';
import type { PaintedTree } from '../../geography/terrain/vegetation';
import type { GeometryData, TerrainJob, TerrainWorkerInput, TerrainWorkerOutput } from './terrainProtocol';
import { recordTerrainTiming } from './terrainMetrics.ts';

export interface TerrainWorkerPort {
 postMessage(message:TerrainWorkerInput,transfer?:Transferable[]):void;
 onmessage:((event:MessageEvent<TerrainWorkerOutput>)=>void)|null;
 onerror:((event:{message:string})=>void)|null;
 terminate():void;
}
export interface ResourceLease<T>{value:T;release:()=>void;}
export interface ResourceRequest<T>{promise:Promise<ResourceLease<T>>;cancel:()=>void;}
type Value=BufferGeometry|PaintedTree[];
interface Entry {key:string;value:Value;kind:TerrainJob['kind'];refs:number;bytes:number;used:number;}
interface Waiter {resolve:(lease:ResourceLease<Value>)=>void;reject:(error:Error)=>void;}
interface Pending {id:number;job:TerrainJob;priority:number;waiters:Set<Waiter>;}

/** One worker and a bounded, reference-counted geometry cache per shared height field. */
export class TerrainResources {
 private readonly cache=new Map<string,Entry>();
 private readonly jobs=new Map<string,Pending>();
 private running:Pending|null=null;
 private ready=false;
 private active=true;
 private failure:Error|null=null;
 private sequence=0;
 private serial=0;
 private bytes=0;
 private readonly port:TerrainWorkerPort;
 private readonly budget:number;
 constructor(port:TerrainWorkerPort,init:Extract<TerrainWorkerInput,{kind:'init'}>,budget=48*1024*1024){
  this.port=port;this.budget=budget;
  port.onmessage=event=>this.receive(event.data);
  port.onerror=event=>this.fail(new Error(event.message||'Falha no processamento do terreno'));
  port.postMessage(init,[init.buffer]);
 }
 setActive(active:boolean){this.active=active;this.pump();}
 request<T extends Value>(job:TerrainJob,priority=0):ResourceRequest<T>{
  let waiter:Waiter|undefined,pending:Pending|undefined;
  const promise=new Promise<ResourceLease<Value>>((resolve,reject)=>{
   if(this.failure){reject(this.failure);return;}
   const hit=this.cache.get(job.key);
   if(hit){recordTerrainTiming(`${job.kind}.cache.hit`,0);resolve(this.lease(hit));return;}
   pending=this.jobs.get(job.key);
   if(!pending){pending={id:++this.serial,job,priority,waiters:new Set()};this.jobs.set(job.key,pending);}
   pending.priority=Math.max(pending.priority,priority);waiter={resolve,reject};pending.waiters.add(waiter);this.pump();
  });
  return {promise:promise as Promise<ResourceLease<T>>,cancel:()=>{
   if(!pending||!waiter)return;
   pending.waiters.delete(waiter);
   if(!pending.waiters.size&&this.running!==pending)this.jobs.delete(job.key);
  }};
 }
 stats(){return {cached:this.cache.size,geometryBytes:this.bytes,pending:this.jobs.size,active:this.active};}
 dispose(){this.fail(new Error('Processamento do terreno encerrado'));this.port.terminate();for(const e of this.cache.values())if(e.value instanceof BufferGeometry)e.value.dispose();this.cache.clear();this.bytes=0;}
 private lease(entry:Entry):ResourceLease<Value>{
  entry.refs++;entry.used=++this.sequence;let released=false;
  return {value:entry.value,release:()=>{if(released)return;released=true;entry.refs--;this.collect();}};
 }
 private pump(){
  if(!this.ready||!this.active||this.running||this.failure)return;
  const next=[...this.jobs.values()].filter(job=>job.waiters.size).sort((a,b)=>b.priority-a.priority||a.id-b.id)[0];
  if(!next)return;this.running=next;this.port.postMessage({kind:'job',id:next.id,job:next.job});
 }
 private receive(message:TerrainWorkerOutput){
  if(message.kind==='ready'){this.ready=true;this.pump();return;}
  if(message.kind==='error'){this.fail(new Error(message.message));return;}
  const pending=this.running;if(!pending||pending.id!==message.id)return;
  const data=message.data;let value:Value,bytes=0;
  if(Array.isArray(data))value=data;
  else{
   value=new BufferGeometry();
   for(const [name,{array,itemSize}] of Object.entries((data as GeometryData).attributes)){value.setAttribute(name,new BufferAttribute(array,itemSize));bytes+=array.byteLength;}
   if(data.index){value.setIndex(new BufferAttribute(data.index,1));bytes+=data.index.byteLength;}
   value.computeBoundingSphere();
  }
  const entry:Entry={key:pending.job.key,kind:pending.job.kind,value,bytes,refs:0,used:++this.sequence};
  this.cache.set(entry.key,entry);this.bytes+=bytes;
  recordTerrainTiming(`${pending.job.kind==='mesh'?`terrain.worker.${pending.job.resolution}`:`${pending.job.kind}.worker`}`,message.ms,Array.isArray(value)?value.length:undefined);
  this.jobs.delete(entry.key);this.running=null;
  for(const waiter of pending.waiters)waiter.resolve(this.lease(entry));
  this.collect();this.pump();
 }
 private collect(){
  let locals=[...this.cache.values()].filter(e=>e.kind==='local').length;
  for(const entry of [...this.cache.values()].sort((a,b)=>a.used-b.used)){
   if(entry.refs||!(entry.bytes>0&&this.bytes>this.budget||entry.kind==='local'&&locals>12))continue;
   this.cache.delete(entry.key);this.bytes-=entry.bytes;
   if(entry.kind==='local')locals--;
   if(entry.value instanceof BufferGeometry)entry.value.dispose();
  }
 }
 private fail(error:Error){this.failure=error;for(const job of this.jobs.values())for(const waiter of job.waiters)waiter.reject(error);this.jobs.clear();this.running=null;}
}

const resources=new WeakMap<TerrainField,TerrainResources>();
export function getTerrainResources(field:TerrainField,hydrology:HydrologySource,city:[number,number]){
 let result=resources.get(field);
 if(!result){
  const buffer=field.bytes.slice().buffer;
  result=new TerrainResources(new Worker(new URL('./terrainWorker.ts',import.meta.url),{type:'module'}) as unknown as TerrainWorkerPort,{kind:'init',manifest:field.manifest,buffer,hydrology,city});
  resources.set(field,result);
 }
 return result;
}
