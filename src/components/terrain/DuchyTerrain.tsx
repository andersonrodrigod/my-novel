import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls, useTexture } from '@react-three/drei';
import { BackSide, type BufferGeometry, MeshStandardMaterial, MOUSE, Object3D, PerspectiveCamera, RepeatWrapping, SRGBColorSpace, TOUCH, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Duchy, Point } from '../../types/geography';
import { duchies } from '../../data/viremont/duchies';
import manifest from '../../data/terrain/viremont.json';
import hydrology from '../../data/terrain/hydrology-source.json';
import type { HydrologySource } from '../../geography/terrain/hydrology';
import { clamp, TerrainField } from '../../geography/terrain/TerrainField';
import { pointInPolygon } from '../../geography/coordinates';
import { getTerrainResources, type TerrainResources } from './terrainResources';
import { useTerrainResource } from './useTerrainResource';
import { countryTerritories } from '../../data/world/politicalMap';
import { TerrainVegetation } from './TerrainVegetation';
import { TerrainWater } from './TerrainWater';
import { TerrainDetails } from './TerrainDetails';
import { atlasMaterial } from './atlasMaterial';
import { fullTerrainProfile, terrainProfileEnabled, type TerrainProfileOptions } from './terrainMetrics';
import { TerrainPerformancePanel, TerrainPerformanceSampler, type TerrainPerformanceReport } from './TerrainPerformance';
import { CityScalePanel, CityScalePreview, cityPreviewCenter, defaultCityShare } from './CityScalePreview';

type Command={id:number;type:'panorama'|'aerial'|'ground'|'in'|'out'|'junction'|'city'};
const icon:Record<string,string>={'viremont-nortar':'♧','viremont-valeris':'≋','viremont-selveria':'♠','viremont-erdel':'❧','viremont-montelur':'♧','viremont-thargrund':'⚒'};
let fieldPromise:Promise<TerrainField>|null=null;
function loadField(){return fieldPromise??=fetch(manifest.url).then(r=>{if(!r.ok)throw new Error('Não foi possível carregar o terreno');return r.arrayBuffer();}).then(async buffer=>{
 const field=new TerrainField(manifest,buffer,hydrology as HydrologySource),resources=sharedResources(field);
 // Prepare a complete coarse landscape off-thread before revealing the canvas.
 const leases=await Promise.all(Array.from({length:144},(_,i)=>{const x=i%12,z=Math.floor(i/12),w=manifest.width/12,d=manifest.height/12;return resources.request<BufferGeometry>({kind:'mesh',key:`tile:${x}:${z}:8`,x:-manifest.width/2+x*w,z:-manifest.height/2+z*d,width:w,depth:d,resolution:8},1000000).promise;}));
 leases.forEach(lease=>lease.release());return field;
}).catch(error=>{fieldPromise=null;throw error;});}
function sharedResources(field:TerrainField){return getTerrainResources(field,hydrology as HydrologySource,field.toLocal(countryTerritories.find(c=>c.nationId==='aetheria-07')!.citySite));}

function Tile({field,resources,x,z,material}:{field:TerrainField;resources:TerrainResources;x:number;z:number;material:MeshStandardMaterial}){
 const {width,height}=field.manifest,count=12,w=width/count,d=height/count,x0=-width/2+x*w,z0=-height/2+z*d;
 const outside=x<0||z<0||x>=count||z>=count;
 const [resolution,setResolution]=useState(outside?8:32),last=useRef(0);
 useFrame(({camera,clock})=>{if(outside||clock.elapsedTime-last.current<.4)return;last.current=clock.elapsedTime;
  const dx=Math.max(0,Math.abs(camera.position.x-(x0+w/2))-w/2),dz=Math.max(0,Math.abs(camera.position.z-(z0+d/2))-d/2),dy=Math.max(0,camera.position.y-field.elevation(camera.position.x,camera.position.z));
  const distance=Math.hypot(dx,dz,dy),margin=resolution===128?1.2:1;
  const next=distance<550*margin?128:distance<1600*(resolution===64?1.2:1)?64:32;if(next!==resolution)setResolution(next);
 });
 const geometry=useTerrainResource<BufferGeometry>(resources,{kind:'mesh',key:`tile:${x}:${z}:${resolution}`,x:x0,z:z0,width:w,depth:d,resolution},resolution*100,{kind:'mesh',key:`tile:${x}:${z}:8`,x:x0,z:z0,width:w,depth:d,resolution:8});
 return geometry?<mesh geometry={geometry} material={material} receiveShadow dispose={null}/>:null;
}
function BackdropPatch({resources,material,x,z,width,depth,resolution,index}:{resources:TerrainResources;material:MeshStandardMaterial;x:number;z:number;width:number;depth:number;resolution:number;index:number}){
 const geometry=useTerrainResource<BufferGeometry>(resources,{kind:'mesh',key:`backdrop:${index}:${resolution}`,x,z,width,depth,resolution},1,{kind:'mesh',key:`backdrop:${index}:8`,x,z,width,depth,resolution:8});
 return geometry?<mesh geometry={geometry} material={material} raycast={()=>{}} dispose={null}/>:null;
}
function Backdrop({field,resources,material}:{field:TerrainField;resources:TerrainResources;material:MeshStandardMaterial}){
 const {width:w,height:h}=field.manifest,pw=w*10/12,ph=h*10/12;
 const patches=[[-w/2-pw,-h/2-ph,w+pw*2,ph,64],[-w/2-pw,h/2,w+pw*2,ph,64],[-w/2-pw,-h/2,pw,h,32],[w/2,-h/2,pw,h,32]];
 return <>{patches.map(([x,z,width,depth,resolution],index)=><BackdropPatch key={index} {...{resources,material,x,z,width,depth,resolution,index}}/>)}</>;
}

function Landscape({field,resources,profile}:{field:TerrainField;resources:TerrainResources;profile:TerrainProfileOptions}){
 const source=useTexture(['/assets/terrain/atlas-grass.webp','/assets/terrain/atlas-rock.webp']);
 const textures=useMemo(()=>source.map(s=>{const t=s.clone();t.wrapS=t.wrapT=RepeatWrapping;t.colorSpace=SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;return t;}),[source[0],source[1]]);
 const material=useMemo(()=>atlasMaterial(textures[0],textures[1]),[textures]);
 useEffect(()=>()=>{material.dispose();textures.forEach(t=>t.dispose());},[material,textures]);
 return <>
  <group visible={profile.backdrop}><Backdrop field={field} resources={resources} material={material}/></group>
  {Array.from({length:144},(_,i)=><Tile key={i} field={field} resources={resources} x={i%12} z={Math.floor(i/12)} material={material}/>)}
  <group visible={profile.water}><TerrainWater resources={resources} animated={profile.animateWater}/></group>
 </>;
}
function Borders({field,duchy}:{field:TerrainField;duchy:Duchy}){
 const paths=useMemo(()=>duchy.geometry.flatMap(poly=>poly.map(ring=>ring.flatMap((p,i)=>{
  if(i===ring.length-1){const [x,z]=field.toLocal(p);return [new Vector3(x,field.surface(x,z)+4,z)];}
  const q=ring[i+1],a=field.toLocal(p),b=field.toLocal(q),steps=Math.max(2,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/18));
  return Array.from({length:steps},(_,j)=>{const [x,z]=field.toLocal([p[0]+(q[0]-p[0])*j/steps,p[1]+(q[1]-p[1])*j/steps]);return new Vector3(x,field.surface(x,z)+4,z);});
 }))),[field,duchy]);
 return <>{paths.map((points,i)=><Line key={i} points={points} color="#f4d58b" lineWidth={1.5} transparent opacity={.8} raycast={()=>{}}/>)}</>;
}
function localFocus(field:TerrainField,duchy:Duchy){
 const points=duchy.geometry.flat(2).map(p=>field.toLocal(p)),xs=points.map(p=>p[0]),zs=points.map(p=>p[1]);
 const span=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs));
 const original=field.toLocal(duchy.labelAnchor);let landing=original,best=Infinity;
 // Look for an accessible spot in the same immutable territory; do not relocate any city/feature.
 for(let z=Math.min(...zs);z<=Math.max(...zs);z+=70)for(let x=Math.min(...xs);x<=Math.max(...xs);x+=70){
  const p=field.toMap(x,z);if(!duchy.geometry.some(poly=>pointInPolygon(p,poly[0])&&!poly.slice(1).some(hole=>pointInPolygon(p,hole))))continue;
  if(field.sample(x,z,'water')>.01||field.slope(x,z)>.45)continue;
  const score=Math.hypot(x-original[0],z-original[1])*.12+field.elevation(x,z)+field.sample(x,z,'forest')*100;if(score<best){best=score;landing=[x,z];}
 }
 return {span,landing};
}
function Navigation({field,duchy,command,onAnchor}:{field:TerrainField;duchy:Duchy;command:Command;onAnchor:(point:Point,close:boolean)=>void}){
 const controls=useRef<OrbitControlsImpl>(null),{camera}=useThree(),destination=useRef<Vector3|null>(null),destinationTarget=useRef(new Vector3()),last=useRef(0);
 const focus=useMemo(()=>localFocus(field,duchy),[field,duchy]);
 const place=(type:Command['type'])=>{
  if(!controls.current)return;
  if(type==='in'||type==='out'){
   const t=controls.current.target.clone();destinationTarget.current.copy(t);destination.current=t.clone().add(camera.position.clone().sub(t).multiplyScalar(type==='in'?.55:1.8));return;
  }
  const panorama=type==='panorama';
  const join=hydrology.courses.find(c=>c.joins==='viremont-main-river')!.points.at(-1)!;
  const point=type==='city'?cityPreviewCenter:type==='junction'?[join[0],join[1]] as Point:panorama&&duchy.id==='viremont-valeris'?[.320,.400] as Point:duchy.labelAnchor;
  const [x,z]=type==='ground'?focus.landing:field.toLocal(point),y=field.surface(x,z),span=panorama?Math.max(3800,focus.span*1.55):focus.span;
  destinationTarget.current.set(x,y+3,z+(type==='city'?60:0));
  const position=type==='city'?new Vector3(x-70,y+430,z+470):type==='junction'?new Vector3(x-80,y+360,z+480):type==='ground'?new Vector3(x-35,y+25,z+150):type==='aerial'?new Vector3(x,y+span*1.35,z+span*.16):new Vector3(x-span*.23,y+span*.86,z+span*1.15);
  if(!panorama){position.x=clamp(position.x,-field.manifest.width*.47,field.manifest.width*.47);position.z=clamp(position.z,-field.manifest.height*.47,field.manifest.height*.47);}
  position.y=Math.max(position.y,field.surface(position.x,position.z)+(type==='ground'?8:45));destination.current=position;
 };
 useEffect(()=>{place('panorama');},[focus]);
 useEffect(()=>{place(command.type);},[command.id]);
 useFrame((_,delta)=>{
  const c=controls.current;if(!c)return;
  if(destination.current){const t=1-Math.exp(-3*delta);camera.position.lerp(destination.current,t);c.target.lerp(destinationTarget.current,t);if(camera.position.distanceTo(destination.current)<.4&&c.target.distanceTo(destinationTarget.current)<.4)destination.current=null;}
  const {width,height}=field.manifest;c.target.x=clamp(c.target.x,-width*.48,width*.48);c.target.z=clamp(c.target.z,-height*.48,height*.48);c.target.y=field.surface(c.target.x,c.target.z)+3;
  camera.position.y=Math.max(camera.position.y,field.surface(camera.position.x,camera.position.z)+6);
  const near=Math.max(.15,camera.position.distanceTo(c.target)*.0008);if(camera instanceof PerspectiveCamera&&Math.abs(camera.near-near)>near*.2){camera.near=near;camera.updateProjectionMatrix();}
  c.update();last.current+=delta;if(last.current>.6){last.current=0;onAnchor(field.toMap(c.target.x,c.target.z),camera.position.distanceTo(c.target)<1200);}
 });
 return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.09} screenSpacePanning={false} minDistance={4} maxDistance={18000} minPolarAngle={.06} maxPolarAngle={Math.PI*.485} zoomSpeed={.85} rotateSpeed={.55} panSpeed={.75} mouseButtons={{LEFT:MOUSE.ROTATE,MIDDLE:MOUSE.DOLLY,RIGHT:MOUSE.PAN}} touches={{ONE:TOUCH.ROTATE,TWO:TOUCH.DOLLY_PAN}} onStart={()=>{destination.current=null;}}/>;
}
function TerrainWorld({field,duchy,command,borders,onAnchor,profile,cityShare,onCityFocus}:{field:TerrainField;duchy:Duchy;command:Command;borders:boolean;onAnchor:(point:Point,close:boolean)=>void;profile:TerrainProfileOptions;cityShare:number;onCityFocus:()=>void}){
 const resources=useMemo(()=>sharedResources(field),[field]);
 const [anchor,setAnchor]=useState<Point>(duchy.labelAnchor),[close,setClose]=useState(false);
 const [anchorX,anchorZ]=field.toLocal(anchor),cellX=Math.round(anchorX/256),cellZ=Math.round(anchorZ/256);
 const gridAnchor=useMemo(()=>[cellX*256,cellZ*256] as [number,number],[cellX,cellZ]);
 const sunTarget=useMemo(()=>new Object3D(),[]);sunTarget.position.set(gridAnchor[0],0,gridAnchor[1]);
 return <>
  <color attach="background" args={['#c8c3a4']}/><fogExp2 attach="fog" args={['#c8c3a4',.00005]}/>
  <mesh raycast={()=>{}}><sphereGeometry args={[32000,32,24]}/><shaderMaterial side={BackSide} depthWrite={false} vertexShader="varying float skyHeight; void main(){skyHeight=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}" fragmentShader="varying float skyHeight; void main(){float t=pow(clamp(skyHeight*1.5+0.08,0.0,1.0),0.65);gl_FragColor=vec4(mix(vec3(0.70,0.79,0.76),vec3(0.20,0.43,0.59),t),1.0);}"/></mesh>
  <hemisphereLight args={['#f0e7c5','#536644',.85]}/><primitive object={sunTarget}/><directionalLight castShadow position={[gridAnchor[0]-2600,4000,gridAnchor[1]-2400]} target={sunTarget} intensity={2.3} color="#fff0c5" shadow-mapSize={[2048,2048]} shadow-camera-left={-1000} shadow-camera-right={1000} shadow-camera-top={1000} shadow-camera-bottom={-1000} shadow-camera-near={100} shadow-camera-far={8000} shadow-bias={-.00025} shadow-normalBias={1.5}/>
  <Suspense fallback={null}><Landscape field={field} resources={resources} profile={profile}/></Suspense><group visible={profile.trees}><TerrainVegetation resources={resources} anchor={gridAnchor} close={close}/></group><TerrainDetails field={field}/>
  {borders&&<Borders field={field} duchy={duchy}/>}
  {duchy.id==='viremont-valeris'&&<CityScalePreview field={field} duchy={duchy} share={cityShare} onFocus={onCityFocus}/>}
  <Navigation field={field} duchy={duchy} command={command} onAnchor={(p,c)=>{setAnchor(p);setClose(c);onAnchor(p,c);}}/>
 </>;
}
function MiniMap({duchy,anchor,onCenter}:{duchy:Duchy;anchor:Point;onCenter:()=>void}){
 const b=[.255,.30,.382,.483],project=([u,v]:Point)=>[(u-b[0])/(b[2]-b[0])*156,(v-b[1])/(b[3]-b[1])*156];
 return <button className="terrain-minimap" onClick={onCenter} aria-label="Enquadrar ducado no terreno"><span>VIREMONT</span><svg viewBox="0 0 156 156" aria-hidden="true">{duchies.map(d=><path key={d.id} d={d.geometry.flatMap(p=>p.map(r=>r.map((p,i)=>`${i?'L':'M'}${project(p).join(',')}`).join('')+'Z')).join('')} fill={d.color} fillOpacity={d.id===duchy.id?.8:.18} stroke={d.id===duchy.id?'#f8df9c':'#a8aa82'} strokeWidth={d.id===duchy.id?1.8:.7}/>)}{hydrology.courses.map(c=><polyline key={c.id} points={c.points.map(p=>project([p[0],p[1]]).join(',')).join(' ')} fill="none" stroke="#80bbb6" strokeWidth={c.kind==='river'?1.4:.65}/>)}{hydrology.lakes.map(l=><ellipse key={l.id} cx={project([l.center[0],l.center[1]])[0]} cy={project([l.center[0],l.center[1]])[1]} rx={l.radii[0]/(b[2]-b[0])*156} ry={l.radii[1]/(b[3]-b[1])*156} fill="#80bbb6"/>)}<circle cx={project(anchor)[0]} cy={project(anchor)[1]} r={3} fill="#fff5ce" stroke="#684b24"/></svg><small>Enquadrar território ↗</small></button>;
}
class TerrainBoundary extends Component<{children:ReactNode;onAtlas:()=>void},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="terrain-loading" role="alert">A exploração não pôde ser aberta.<button onClick={this.props.onAtlas}>Voltar ao atlas</button></div>:this.props.children;}
}
export default function DuchyTerrain({duchy,onAtlas,focusSignal,active,onDuchySelect,onInfo}:{duchy:Duchy;onAtlas:()=>void;focusSignal:number;active:boolean;onDuchySelect:(duchy:Duchy)=>void;onInfo:()=>void}){
 const [cityShare,setCityShare]=useState(defaultCityShare),[cityPanelOpen,setCityPanelOpen]=useState(true);
 const [profile,setProfile]=useState(fullTerrainProfile),[profileRun,setProfileRun]=useState(0),[measuring,setMeasuring]=useState(false),[report,setReport]=useState<TerrainPerformanceReport|null>(null);
 const [field,setField]=useState<TerrainField|null>(null),[error,setError]=useState(''),[command,setCommand]=useState<Command>({id:0,type:'panorama'}),[borders,setBorders]=useState(true),[anchor,setAnchor]=useState<Point>(duchy.labelAnchor),[near,setNear]=useState(false);
 useEffect(()=>{let active=true;loadField().then(f=>{if(active)setField(f);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 useEffect(()=>{if(field)sharedResources(field).setActive(active);},[field,active]);
 const action=(type:Command['type'])=>setCommand(c=>({id:c.id+1,type}));
 const focusCity=()=>{setCityPanelOpen(true);action('city');};
 useEffect(()=>{action('panorama');},[focusSignal]);
 const cameraPosition=useMemo(()=>field?(()=>{const [x,z]=field.toLocal(duchy.labelAnchor);return [x,field.surface(x,z)+1800,z+2700] as [number,number,number];})():[0,3000,4000] as [number,number,number],[field]);
 const cameraSettings=useMemo(()=>({position:cameraPosition,fov:42,near:.2,far:60000}),[cameraPosition]);
 return <div className="terrain-experience" data-duchy={duchy.id} aria-hidden={!active} style={{visibility:active?'visible':'hidden',pointerEvents:active?'auto':'none'}}>
  {field?<TerrainBoundary onAtlas={onAtlas}><Canvas shadows frameloop={active?'always':'never'} camera={cameraSettings} dpr={[1,1.5]} gl={{antialias:true}}><TerrainWorld field={field} duchy={duchy} command={command} borders={borders} profile={profile} cityShare={cityShare} onCityFocus={focusCity} onAnchor={(p,c)=>{setAnchor(p);setNear(c);}}/>{terrainProfileEnabled&&<TerrainPerformanceSampler run={profileRun} options={profile} onReport={value=>{setReport(value);setMeasuring(false);}}/>}</Canvas></TerrainBoundary>:<div className="terrain-loading" role="status">{error||'Preparando a paisagem…'}{error&&<button onClick={onAtlas}>Voltar ao atlas</button>}</div>}
  {duchy.id==='viremont-valeris'&&cityPanelOpen&&<CityScalePanel share={cityShare} onShare={setCityShare} onFocus={focusCity} onClose={()=>setCityPanelOpen(false)}/>}
  {terrainProfileEnabled&&<TerrainPerformancePanel options={profile} onOptions={setProfile} measuring={measuring} report={report} onJunction={()=>action('junction')} onStart={()=>{setReport(null);setMeasuring(true);setProfileRun(v=>v+1);}}/>}
  <div className="terrain-title"><span className="terrain-crest" style={{borderColor:duchy.color}}>{icon[duchy.id]}</span><div><span className="terrain-eyebrow">REINO DE VIREMONT · EXPLORAR TERRITÓRIO</span><h2>{duchy.name}</h2><p>{duchy.description}</p></div></div>
  <div className="terrain-top-actions"><button onClick={onAtlas}>← Ver no globo</button><button onClick={onInfo}>Informações do ducado</button><button aria-pressed={borders} onClick={()=>setBorders(v=>!v)}>◇ Fronteira</button></div>
  <label className="terrain-duchy-picker"><span>EXPLORAR DUCADO</span><select aria-label="Escolher ducado" value={duchy.id} onChange={e=>{const d=duchies.find(d=>d.id===e.target.value);if(d)onDuchySelect(d);}}>{duchies.map(d=><option key={d.id} value={d.id}>{d.name.replace('Ducado de ','')}</option>)}</select></label>
  <MiniMap duchy={duchy} anchor={anchor} onCenter={()=>action('panorama')}/>
  <div className="terrain-view-controls" aria-label="Controles do terreno"><button onClick={()=>action('panorama')}>◈ Panorama</button><button onClick={()=>action('aerial')}>⌖ Vista aérea</button><button className="ground-button" onClick={()=>action('ground')}>↓ Explorar de perto</button>{duchy.id==='viremont-valeris'&&<button onClick={focusCity}>♜ Cidade murada</button>}</div>
  <div className="terrain-zoom"><button aria-label="Aproximar terreno" onClick={()=>action('in')}>+</button><button aria-label="Afastar terreno" onClick={()=>action('out')}>−</button></div>
  <div className="terrain-footnote"><span>{near?'EXPLORAÇÃO PRÓXIMA':'PAISAGEM REGIONAL'}</span> Arraste para olhar · botão direito para mover · roda para aproximar <small>Relevo ilustrativo proposto · sem escala física definida</small></div>
 </div>;
}
