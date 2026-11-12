import { useEffect, useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3 } from 'three';
import type { Duchy, Point } from '../../types/geography';
import type { TerrainField } from '../../geography/terrain/TerrainField';
import { cityScale, formatCityShare } from '../../geography/terrain/cityScale';
import preview from '../../data/terrain/city-scale-preview.json';
import { WalledCityIcon } from './WalledCityIcon';

export function CityScalePreview({field,duchy,share,onFocus}:{field:TerrainField;duchy:Duchy;share:number;onFocus:()=>void}){
 const proposal=useMemo(()=>cityScale(field,duchy,preview.center as [number,number],share,preview.aspect),[field,duchy,share]);
 const geometry=useMemo(()=>{
  const g=new BufferGeometry(),points=[proposal.center,...proposal.ring],indices:number[]=[];
  for(let i=0;i<proposal.ring.length;i++)indices.push(0,i+1,(i+1)%proposal.ring.length+1);
  g.setAttribute('position',new Float32BufferAttribute(points.flatMap(([x,z])=>[x,field.elevation(x,z)+.5,z]),3));g.setIndex(indices);return g;
 },[field,proposal]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 const border=useMemo(()=>[...proposal.ring,proposal.ring[0]].map(([x,z])=>new Vector3(x,field.elevation(x,z)+.9,z)),[field,proposal]);
 const [x,z]=proposal.center;
 return <>
  <mesh geometry={geometry} raycast={()=>{}}><meshBasicMaterial color="#e1b96b" transparent opacity={.3} side={DoubleSide} depthWrite={false}/></mesh>
  <Line points={border} color="#ffdf8e" lineWidth={2} raycast={()=>{}}/>
  <Html position={[x,field.elevation(x,z)+2,z]} center zIndexRange={[1,0]}>
   <button className="terrain-city-marker" onClick={onFocus} aria-label="Ver proporção da cidade murada">
    <WalledCityIcon/><span>Cidade murada</span><small>estudo · {formatCityShare(share)} de Valeris</small>
   </button>
  </Html>
 </>;
}

export function CityScalePanel({share,onShare,onFocus,onClose}:{share:number;onShare:(value:number)=>void;onFocus:()=>void;onClose:()=>void}){
 return <aside className="terrain-city-scale" aria-label="Estudo de proporção da cidade">
  <button className="city-scale-close" onClick={onClose} aria-label="Fechar estudo da cidade">×</button>
  <p className="city-scale-eyebrow">ESTUDO DE PROPORÇÃO · VALERIS</p>
  <h3>Cidade murada</h3>
  <p>Compare a área urbana dentro das muralhas.</p>
  <div className="city-scale-options">{preview.areaShares.map(value=><button key={value} aria-pressed={share===value} onClick={()=>onShare(value)}>{formatCityShare(value)}</button>)}</div>
  <div className="city-scale-ratio"><strong>{formatCityShare(share)}</strong><span>da área de Valeris no mapa<br/>≈ 1 parte em {Math.round(1/share).toLocaleString('pt-BR')}</span></div>
  <p className="city-scale-key"><i/> O contorno dourado mede a área proposta. O ícone é ampliado para leitura.</p>
  <button className="city-scale-focus" onClick={onFocus}>Ver área de perto ↗</button>
  <details><summary>Como usar para dividir as terras</summary><p>Um marquesado de 10% teria cerca de {(preview.comparisonMarquesadoShare/share).toLocaleString('pt-BR',{maximumFractionDigits:1})} vezes essa área urbana. O território precisa incluir também campos, aldeias e estradas.</p><p>Proposta sem nome oficial. A escala em km² ainda precisa ser definida.</p></details>
 </aside>;
}

export const cityPreviewCenter=preview.center as unknown as Point;
export const defaultCityShare=preview.defaultAreaShare;
