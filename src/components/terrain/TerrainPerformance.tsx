import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { resetTerrainTimings, terrainTimings, type TerrainProfileOptions } from './terrainMetrics';

export interface TerrainPerformanceReport {
 durationMs:number;frames:number;fps:number;frameMs:{median:number;p95:number;max:number};
 renderCpuMs:{median:number;p95:number};drawCalls:number;triangles:number;geometries:number;textures:number;
 viewport:{width:number;height:number;dpr:number};visibility:string;options:TerrainProfileOptions;
 timings:ReturnType<typeof terrainTimings>;
}
const summary=(values:number[])=>{const a=values.slice().sort((x,y)=>x-y);return {median:+(a[Math.floor(a.length*.5)]??0).toFixed(2),p95:+(a[Math.floor(a.length*.95)]??0).toFixed(2),max:+(a.at(-1)??0).toFixed(2)};};

/** Opt-in local diagnostics: frame intervals and CPU submission, not GPU execution time. */
export function TerrainPerformanceSampler({run,options,onReport}:{run:number;options:TerrainProfileOptions;onReport:(report:TerrainPerformanceReport)=>void}){
 const {gl,size}=useThree();
 const session=useRef<{start:number;last:number;frames:number[];cpu:number[];options:TerrainProfileOptions}|null>(null);
 useEffect(()=>{
  const original=gl.render;
  gl.render=function(...args){const start=performance.now();original.apply(this,args);const s=session.current;if(s&&performance.now()-s.start>500)s.cpu.push(performance.now()-start);};
  return()=>{gl.render=original;};
 },[gl]);
 useEffect(()=>{if(!run)return;resetTerrainTimings();const now=performance.now();session.current={start:now,last:now,frames:[],cpu:[],options:{...options}};},[run]);
 useFrame(()=>{
  const s=session.current;if(!s)return;
  const now=performance.now(),elapsed=now-s.start,interval=now-s.last;s.last=now;
  if(elapsed>500)s.frames.push(interval);
  if(elapsed<8500)return;
  session.current=null;
  const duration=s.frames.reduce((a,b)=>a+b,0);
  onReport({durationMs:+elapsed.toFixed(1),frames:s.frames.length,fps:+(s.frames.length*1000/duration).toFixed(1),frameMs:summary(s.frames),renderCpuMs:summary(s.cpu),drawCalls:gl.info.render.calls,triangles:gl.info.render.triangles,geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,viewport:{width:size.width,height:size.height,dpr:gl.getPixelRatio()},visibility:document.visibilityState,options:s.options,timings:terrainTimings()});
 },-100);
 return null;
}

export function TerrainPerformancePanel({options,onOptions,onStart,onJunction,measuring,report}:{options:TerrainProfileOptions;onOptions:(options:TerrainProfileOptions)=>void;onStart:()=>void;onJunction:()=>void;measuring:boolean;report:TerrainPerformanceReport|null}){
 const [open,setOpen]=useState(true);
 if(!open)return null;
 return <aside style={{position:'absolute',right:80,bottom:100,zIndex:20,width:315,maxHeight:'65vh',overflow:'auto',padding:12,background:'#102b27f5',color:'#fff2d3',font:'12px monospace',border:'1px solid #d9b666'}}>
  <strong>Diagnóstico local · 8 segundos</strong>
  <button aria-label="Fechar diagnóstico" onClick={()=>setOpen(false)} style={{float:'right'}}>×</button>
  {([['trees','Vegetação'],['water','Água'],['backdrop','Cenário de fundo'],['animateWater','Animar água']] as const).map(([key,label])=><label key={key} style={{display:'block'}}><input type="checkbox" checked={options[key]} disabled={measuring} onChange={e=>onOptions({...options,[key]:e.target.checked})}/>{label}</label>)}
  <button disabled={measuring} onClick={onStart}>Medir desempenho</button>
  <button disabled={measuring} onClick={onJunction}>Ver confluência</button>
  <p role="status">{measuring?'Medindo desempenho…':report?'Medição concluída':'Pronto para medir'}</p>
  {report&&<pre data-testid="terrain-performance-report" style={{whiteSpace:'pre-wrap',fontSize:10}}>{JSON.stringify(report,null,2)}</pre>}
 </aside>;
}
