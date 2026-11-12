// Node transport for validating the same job processor used by the browser worker.
import { parentPort } from 'node:worker_threads';
import { terrainTaskProcessor, terrainTransferables } from '../src/components/terrain/terrainTasks.ts';
let processJob;
parentPort.on('message',message=>{
 try{
  if(message.kind==='init'){processJob=terrainTaskProcessor(message);parentPort.postMessage({kind:'ready'});return;}
  const start=performance.now(),data=processJob(message.job);
  parentPort.postMessage({kind:'result',id:message.id,data,ms:performance.now()-start},terrainTransferables(data));
 }catch(error){parentPort.postMessage({kind:'error',id:message.id,message:error.message});}
});
