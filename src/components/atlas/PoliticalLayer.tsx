import { useEffect, useMemo } from 'react';
import { politicalTexture } from '../../rendering/politicalTexture';
import { countryTerritories } from '../../data/world/politicalMap';
import { nations } from '../../data/world/nations';
import { mapToSphere, WORLD_RADIUS } from '../../geography/coordinates';
import type { Continent, LayerKey, Nation } from '../../types/geography';
import { Html } from '@react-three/drei';

export function PoliticalLayer({selected,layers,nation,onSelect}:{selected:Continent|null;layers:Record<LayerKey,boolean>;nation:Nation|null;onSelect:(nation:Nation)=>void}){
  const texture=useMemo(()=>politicalTexture(nation?.id??null),[nation?.id]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  const visible=countryTerritories.filter(country=>country.continentId===selected?.id);
  return <>
    {layers.countries&&<mesh raycast={()=>{}}><sphereGeometry args={[WORLD_RADIUS+.002,192,128]}/><meshBasicMaterial map={texture} transparent depthWrite={false}/></mesh>}
    {visible.map(country=>{
      const record=nations.find(n=>n.id===country.nationId)!;
      return <group key={record.id}>
        {layers.cities&&<mesh position={mapToSphere(country.citySite,WORLD_RADIUS+.012)} onClick={e=>{if(e.delta>4)return;e.stopPropagation();onSelect(record);}}><sphereGeometry args={[.011,8,8]}/><meshBasicMaterial color={record.id===nation?.id?'#fff7d6':'#6a2d1c'}/></mesh>}
        {(layers.nationNames||record.id===nation?.id)&&!(record.id==='aetheria-07'&&layers.duchies)&&<Html position={mapToSphere(country.citySite,WORLD_RADIUS+.025)} center occlude><button className="nation-map-label" onClick={()=>onSelect(record)} title={`Local de cidade proposto — ${record.name}`}>{record.name}</button></Html>}
      </group>;
    })}
  </>;
}
