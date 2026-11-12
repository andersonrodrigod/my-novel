export const terrainProfileEnabled=typeof window!=='undefined'&&new URLSearchParams(window.location.search).has('terrainProfile');
export interface TerrainTiming {label:string;ms:number;count?:number;}
let timings:TerrainTiming[]=[];
export function resetTerrainTimings(){timings=[];}
export function terrainTimings(){return timings.slice();}
export function recordTerrainTiming(label:string,ms:number,count?:number){if(terrainProfileEnabled)timings.push({label,ms:+ms.toFixed(2),...(count===undefined?{}:{count})});}
export function timeTerrain<T>(label:string,fn:()=>T):T{
 if(!terrainProfileEnabled)return fn();
 const start=performance.now(),result=fn();
 timings.push({label,ms:+(performance.now()-start).toFixed(2),...(Array.isArray(result)?{count:result.length}:{})});
 return result;
}
export interface TerrainProfileOptions {trees:boolean;water:boolean;backdrop:boolean;animateWater:boolean;}
export const fullTerrainProfile:TerrainProfileOptions={trees:true,water:true,backdrop:true,animateWater:true};
