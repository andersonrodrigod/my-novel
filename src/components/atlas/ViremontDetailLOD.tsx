import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { DoubleSide, MeshBasicMaterial, SRGBColorSpace } from 'three';
import detail from '../../data/viremont/detail-source.json';
import { surfacePatch } from '../../geography/surfacePatch';
import { mapToSphere, WORLD_RADIUS } from '../../geography/coordinates';

export function ViremontDetailLOD(){
  const texture=useTexture(detail.url);texture.colorSpace=SRGBColorSpace;texture.anisotropy=8;
  const geometry=useMemo(()=>surfacePatch(detail.bounds,WORLD_RADIUS+.003,96),[]);
  const material=useRef<MeshBasicMaterial>(null);const {camera}=useThree();
  const center=useMemo(()=>mapToSphere([.32,.39]),[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useFrame(()=>{if(material.current){const distance=camera.position.distanceTo(center);material.current.opacity=Math.max(0,Math.min(.92,(2.1-distance)/1.5));}});
  return <mesh geometry={geometry} raycast={()=>{}} renderOrder={1}><meshBasicMaterial ref={material} map={texture} side={DoubleSide} transparent opacity={0} depthWrite={false}/></mesh>;
}
