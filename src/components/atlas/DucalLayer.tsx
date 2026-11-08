import { Html, Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import { DoubleSide, Vector3 } from 'three';
import { duchies } from '../../data/viremont/duchies';
import { mapToSphere, WORLD_RADIUS } from '../../geography/coordinates';
import { surfacePatch } from '../../geography/surfacePatch';
import { makeDuchyTexture, VIREMONT_BOUNDS } from '../../rendering/duchyTexture';
import type { Duchy } from '../../types/geography';
import { countryTerritories } from '../../data/world/politicalMap';

export function DucalLayer({selected,hover,visible,onSelect}:{selected:Duchy|null;hover:Duchy|null;visible:boolean;onSelect:(duchy:Duchy)=>void}){
  const geometry=useMemo(()=>surfacePatch(VIREMONT_BOUNDS,WORLD_RADIUS+.006,64),[]);
  const texture=useMemo(()=>makeDuchyTexture(selected?.id??null,hover?.id??null),[selected?.id,hover?.id]);
  const nationalLines=useMemo(()=>countryTerritories.find(c=>c.nationId==='aetheria-07')!.geometry.map(poly=>poly[0].flatMap((p,i,ring)=>{
    if(i===ring.length-1)return [mapToSphere(p,WORLD_RADIUS+.009)];const next=ring[i+1];
    return Array.from({length:12},(_,j)=>mapToSphere([p[0]+(next[0]-p[0])*j/12,p[1]+(next[1]-p[1])*j/12],WORLD_RADIUS+.009));
  })),[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);useEffect(()=>()=>texture.dispose(),[texture]);
  if(!visible)return null;
  return <>
    <mesh geometry={geometry} raycast={()=>{}} renderOrder={3}><meshBasicMaterial side={DoubleSide} map={texture} transparent depthWrite={false}/></mesh>
    {nationalLines.map((points,i)=><Line key={i} points={points} color="#8f4d39" lineWidth={2.5} raycast={()=>{}}/>)}
    {duchies.filter(d=>!selected||d.id===selected.id).map(duchy=><DucalLabel key={duchy.id} duchy={duchy} onSelect={onSelect}/>)}
  </>;
}
function DucalLabel({duchy,onSelect}:{duchy:Duchy;onSelect:(duchy:Duchy)=>void}){
  const {camera,size}=useThree();const [visible,setVisible]=useState(true);
  const position=useMemo(()=>mapToSphere(duchy.labelAnchor,WORLD_RADIUS+.03),[duchy]);
  useFrame(()=>{const projected=position.clone().project(camera);const facing=position.dot(camera.position.clone().sub(position))>0;const next=facing&&Math.abs(projected.x)<.98&&Math.abs(projected.y)<.96&&size.width>0;if(next!==visible)setVisible(next);});
  return <Html position={position} center style={{display:visible?'block':'none'}}><button className="duchy-map-label" style={{borderColor:duchy.color}} onPointerDown={e=>e.stopPropagation()} onClick={()=>onSelect(duchy)}>{duchy.name.replace('Ducado de ','')}</button></Html>;
}
export function lookingAtViremont(cameraPosition:Vector3){
  return cameraPosition.length()<4.3&&cameraPosition.clone().normalize().dot(mapToSphere([.32,.39]).normalize())>.96;
}
