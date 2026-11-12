import { terrainTaskProcessor, terrainTransferables } from './terrainTasks';
import type { TerrainWorkerInput, TerrainWorkerOutput } from './terrainProtocol';

const scope=self as unknown as {onmessage:((event:MessageEvent<TerrainWorkerInput>)=>void)|null;postMessage:(value:TerrainWorkerOutput,transfer?:Transferable[])=>void};
let processJob:ReturnType<typeof terrainTaskProcessor>|null=null;
scope.onmessage=({data})=>{
 try{
  if(data.kind==='init'){processJob=terrainTaskProcessor(data);scope.postMessage({kind:'ready'});return;}
  if(!processJob)throw new Error('Terrain worker not initialized');
  const start=performance.now(),result=processJob(data.job);
  scope.postMessage({kind:'result',id:data.id,data:result,ms:performance.now()-start},terrainTransferables(result));
 }catch(error){scope.postMessage({kind:'error',...data.kind==='job'?{id:data.id}:{},message:error instanceof Error?error.message:String(error)});}
};
