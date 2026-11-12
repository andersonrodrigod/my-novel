import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { BufferGeometry } from 'three';
import type { PaintedTree } from '../../geography/terrain/vegetation';
import type { TerrainJob } from './terrainProtocol';
import { type ResourceLease, type TerrainResources } from './terrainResources';

/** Hold the current lease until the next complete resource is ready to be displayed. */
export function useTerrainResource<T extends BufferGeometry|PaintedTree[]>(resources:TerrainResources,job:TerrainJob,priority=0,fallback?:TerrainJob){
 const [lease,setLease]=useState<ResourceLease<T>|null>(null),[error,setError]=useState<Error|null>(null);
 const current=useRef<ResourceLease<T>|null>(null);
 const owned=useRef(new Set<ResourceLease<T>>());
 useLayoutEffect(()=>{for(const value of owned.current)if(value!==lease){value.release();owned.current.delete(value);}},[lease]);
 useEffect(()=>()=>{for(const value of owned.current)value.release();owned.current.clear();},[]);
 useEffect(()=>{
  let alive=true;
  const request=resources.request<T>(job,priority);
  request.promise.then(value=>{if(!alive){value.release();return;}owned.current.add(value);current.current=value;setLease(value);}).catch(value=>{if(alive)setError(value);});
  return()=>{alive=false;request.cancel();};
 },[resources,job.key]);
 useEffect(()=>{
  if(!fallback)return;let alive=true;
  const request=resources.request<T>(fallback,1000000+priority);
  request.promise.then(value=>{if(!alive||current.current){value.release();return;}owned.current.add(value);current.current=value;setLease(value);}).catch(value=>{if(alive)setError(value);});
  return()=>{alive=false;request.cancel();};
 },[resources,fallback?.key]);
 if(error&&!lease)throw error;
 return lease?.value??null;
}
