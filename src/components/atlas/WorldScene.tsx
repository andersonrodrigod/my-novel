import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls, useTexture } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CanvasTexture, MOUSE, TOUCH, SRGBColorSpace, Vector3 } from 'three';
import { continents, oceans } from '../../data/world/continents';
import { mapToSphere, pointInPolygon, WORLD_RADIUS } from '../../geography/coordinates';
import { loadTerrainSymbols, makeMapTexture } from '../../rendering/mapTexture';
import type { Continent, Duchy, GeographicFocus, LayerKey, Point } from '../../types/geography';
import type { Nation } from '../../types/geography';
import { countryAt } from '../../data/world/politicalMap';
import { nations } from '../../data/world/nations';
import { PoliticalLayer } from './PoliticalLayer';
import polarExpansion from '../../data/world/polar-expansion.json';
import isthmusRepair from '../../data/world/isthmus-repair.json';
import { duchyAt, duchyFocus, viremontFocus } from '../../data/viremont/duchies';
import { DucalLayer, lookingAtViremont } from './DucalLayer';
import { ViremontDetailLOD } from './ViremontDetailLOD';

export type AtlasView='map'|'globe';
interface Props { selected:Continent|null; onSelect:(continent:Continent|null)=>void; layers:Record<LayerKey,boolean>; focusSignal:number; view:AtlasView; illustrated:boolean; nation:Nation|null; onNationSelect:(nation:Nation)=>void; duchy:Duchy|null; onDuchySelect:(duchy:Duchy)=>void; }
const mapPosition=([x,y]:Point)=>new Vector3((x-.5)*6,(.5-y)*4,.02);

function Navigation({selected,focusSignal,view,focus}:Pick<Props,'selected'|'focusSignal'|'view'>&{focus:GeographicFocus|null}){
  const controls=useRef<OrbitControlsImpl>(null);
  const {camera,size}=useThree();
  const destination=useRef<Vector3|null>(null),target=useRef(new Vector3()),up=useRef(new Vector3(0,1,0));
  useEffect(()=>{
    if(focus){
      const center=mapToSphere(focus.center),extent=focus.extent??[.05,.05];
      const latitude=(.5-focus.center[1])*Math.PI,width=extent[0]*Math.PI*2*WORLD_RADIUS*Math.cos(latitude),height=extent[1]*Math.PI*WORLD_RADIUS;
      const distance=Math.max(.42,Math.max(height/2,width/(2*(size.width/size.height)))/Math.tan(42*Math.PI/360)*1.3);
      target.current.copy(center);destination.current=center.clone().normalize().multiplyScalar(WORLD_RADIUS+distance);
      up.current.copy(mapToSphere([focus.center[0],focus.center[1]-.001]).sub(center).normalize());
    }else if(view==='globe'){target.current.set(0,0,0);destination.current=selected?mapToSphere(selected.center).normalize().multiplyScalar(6.7):new Vector3(8,.5,0);up.current.set(0,1,0);}
    else{const center=selected?mapPosition(selected.center):new Vector3();target.current.set(center.x,center.y,0);const distance=selected?4.6:Math.max(6.9,8.6/(size.width/size.height));destination.current=new Vector3(center.x,center.y,distance);}
  },[selected,focusSignal,view,focus,size.width,size.height]);
  const minimumDistance=focus?.level==='duchy' ? .24 : focus?.level==='nation' ? .55 : view==='map' ? 2.2 : 3.5;
  useFrame((_,delta)=>{
    if(controls.current)controls.current.minDistance=destination.current ? .18 : minimumDistance;
    if(destination.current&&controls.current){const t=1-Math.exp(-5*delta);camera.position.lerp(destination.current,t);camera.up.lerp(up.current,t).normalize();controls.current.target.lerp(target.current,t);controls.current.update();if(camera.position.distanceTo(destination.current)<.01){destination.current=null;}}
  });
  return <OrbitControls ref={controls} enableRotate={!focus&&view==='globe'} enablePan={!!focus||view==='map'} enableDamping dampingFactor={.08} minDistance={.18} maxDistance={14} mouseButtons={{LEFT:focus?MOUSE.PAN:MOUSE.ROTATE,MIDDLE:MOUSE.DOLLY,RIGHT:MOUSE.PAN}} touches={{ONE:focus?TOUCH.PAN:TOUCH.ROTATE,TWO:TOUCH.DOLLY_PAN}} rotateSpeed={.55} zoomSpeed={.65} onStart={()=>{destination.current=null;}}/>;
}
function IllustrationMaterial(){
  const [base,edited,namaris,drakmoria,eryndorExpanded,namarisExpanded,isthmus]=useTexture(['/assets/elarion-terrain-soft-rivers.png','/assets/elarion-terrain-reference-rivers.png','/assets/elarion-terrain-namaris.png','/assets/elarion-terrain-drakmoria.png','/assets/elarion-terrain-eryndor-expanded.png','/assets/elarion-terrain-namaris-expanded.png',isthmusRepair.artwork]);
  const texture=useMemo(()=>{
    const baseImage=base.image as HTMLImageElement,editedImage=edited.image as HTMLImageElement,namarisImage=namaris.image as HTMLImageElement;
    const regionImages:Record<string,HTMLImageElement>={thalzor:editedImage,solmeria:editedImage,namaris:namarisImage,drakmoria:drakmoria.image as HTMLImageElement};
    const canvas=document.createElement('canvas');canvas.width=baseImage.width;canvas.height=baseImage.height;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D indisponível');
    ctx.drawImage(baseImage,0,0);
    // Each regional edit is clipped to its stable geographic polygons.
    for(const continent of continents.filter(c=>c.id in regionImages)){
      ctx.save();ctx.beginPath();
      for(const ring of [continent.outline,...(continent.islands??[])]){
        ring.forEach(([x,y],i)=>{i?ctx.lineTo(x*canvas.width,y*canvas.height):ctx.moveTo(x*canvas.width,y*canvas.height);});ctx.closePath();
      }
      ctx.clip();ctx.drawImage(regionImages[continent.id],0,0,canvas.width,canvas.height);ctx.restore();
    }
    const expandedImages:Record<string,HTMLImageElement>={eryndor:eryndorExpanded.image as HTMLImageElement,namaris:namarisExpanded.image as HTMLImageElement};
    for(const expansion of polarExpansion.expansions){
      ctx.save();ctx.beginPath();
      for(const polygon of expansion.paintGeometry)for(const ring of polygon){
        ring.forEach(([x,y],i)=>{i?ctx.lineTo(x*canvas.width,y*canvas.height):ctx.moveTo(x*canvas.width,y*canvas.height);});ctx.closePath();
      }
      ctx.clip('evenodd');ctx.drawImage(expandedImages[expansion.continentId],0,0,canvas.width,canvas.height);ctx.restore();
    }
    const [left,top,right,bottom]=isthmusRepair.bounds;
    ctx.save();ctx.beginPath();ctx.rect(left*canvas.width,top*canvas.height,(right-left)*canvas.width,(bottom-top)*canvas.height);ctx.clip();
    ctx.drawImage(isthmus.image as HTMLImageElement,0,0,canvas.width,canvas.height);ctx.restore();
    const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;map.anisotropy=8;return map;
  },[base,edited,namaris,drakmoria,eryndorExpanded,namarisExpanded,isthmus]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <meshBasicMaterial map={texture}/>;
}
function GeographicMaterial({layers}:Pick<Props,'layers'>){
  const [ready,setReady]=useState(false);useEffect(()=>{let active=true;loadTerrainSymbols().then(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
  const texture=useMemo(()=>makeMapTexture(layers),[layers,ready]);useEffect(()=>()=>texture.dispose(),[texture]);return <meshBasicMaterial map={texture}/>;
}
function Label({position,children,view}:{position:Point;children:React.ReactNode;view:AtlasView}){
  const {camera}=useThree();const [visible,setVisible]=useState(true);
  const point=useMemo(()=>view==='map'?mapPosition(position):mapToSphere(position,WORLD_RADIUS+.04),[position,view]);
  useFrame(()=>{const next=view==='map'||point.dot(camera.position.clone().sub(point))>0;if(next!==visible)setVisible(next);});
  return <Html position={point} center style={{pointerEvents:'none',display:visible?'block':'none'}}>{children}</Html>;
}
function AtlasSurface({onSelect,layers,selected,view,illustrated,nation,onNationSelect,duchy,onDuchySelect}:Props){
  const [hovered,setHovered]=useState<Continent|null>(null);
  const [hoveredDuchy,setHoveredDuchy]=useState<Duchy|null>(null);
  const [nearViremont,setNearViremont]=useState(false);const {camera}=useThree();
  useFrame(()=>{const next=lookingAtViremont(camera.position);if(next!==nearViremont)setNearViremont(next);});
  const atViremont=nation?.id==='aetheria-07'||nearViremont;
  const showDuchies=layers.duchies&&atViremont;
  const pick=(event:ThreeEvent<PointerEvent|MouseEvent>)=>{if(!event.uv)return null;const p:Point=[event.uv.x,1-event.uv.y];return continents.find(c=>[c.outline,...(c.islands??[])].some(ring=>pointInPolygon(p,ring)))??null;};
  const active=hovered??selected;
  return <>
    <mesh onPointerMove={e=>{const c=pick(e);setHovered(c);setHoveredDuchy(showDuchies&&e.uv?duchyAt([e.uv.x,1-e.uv.y])??null:null);document.body.style.cursor=c?'pointer':'grab';}} onPointerOut={()=>{setHovered(null);setHoveredDuchy(null);document.body.style.cursor='auto';}} onClick={e=>{if(e.delta>4)return;e.stopPropagation();const district=showDuchies&&e.uv?duchyAt([e.uv.x,1-e.uv.y]):null;if(district){onDuchySelect(district);return;}const country=layers.countries&&e.uv?countryAt([e.uv.x,1-e.uv.y]):null;if(country){onNationSelect(nations.find(n=>n.id===country.nationId)!);}else onSelect(pick(e));}}>
      {view==='globe'?<sphereGeometry args={[WORLD_RADIUS,192,128]}/>:<planeGeometry args={[6,4]}/>}
      {illustrated?<IllustrationMaterial/>:<GeographicMaterial layers={layers}/>}
    </mesh>
    {illustrated&&atViremont&&<Suspense fallback={null}><ViremontDetailLOD/></Suspense>}
    <DucalLayer selected={duchy} hover={hoveredDuchy} visible={showDuchies} onSelect={onDuchySelect}/>
    {(active||layers.borders)&&continents.filter(c=>layers.borders||c.id===active?.id).map(c=><Line key={c.id} points={[...c.outline,c.outline[0]].map(p=>view==='globe'?mapToSphere(p,WORLD_RADIUS+.008):mapPosition(p))} color="#f8d790" transparent opacity={active?.id === c.id ? 0.85 : 0.55} lineWidth={active?.id===c.id?1.5:.8}/>)}
    {view==='globe'&&<PoliticalLayer selected={selected} layers={layers} nation={nation} onSelect={onNationSelect}/>}
    {layers.names&&nation?.id!=='aetheria-07'&&continents.filter(c=>!nation||c.id!==nation.continentId).map(c=><Label key={c.id} position={c.center} view={view}><span className={`map-label ${selected?.id===c.id?'active':''}`}>{c.name}</span></Label>)}
    {layers.names&&nation?.id!=='aetheria-07'&&oceans.map(o=><Label key={o.name} position={o.position} view={view}><span className="ocean-label">{o.name}</span></Label>)}
  </>;
}
export function WorldScene(props:Props){
  const focus=useMemo(()=>props.duchy?duchyFocus(props.duchy):props.nation?.id==='aetheria-07'?viremontFocus:null,[props.duchy,props.nation?.id]);
  return <Canvas key={props.view} camera={{position:props.view==='globe'?[8,.5,0]:[0,0,7],fov:42,near:.01,far:100}} dpr={[1,2]} gl={{antialias:true,alpha:true}}><Suspense fallback={null}><AtlasSurface {...props}/></Suspense><Navigation selected={props.selected} focusSignal={props.focusSignal} view={props.view} focus={focus}/></Canvas>;
}

