import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { type BufferGeometry, DoubleSide, MeshBasicMaterial, RepeatWrapping, SRGBColorSpace } from 'three';
import type { TerrainResources } from './terrainResources';
import { useTerrainResource } from './useTerrainResource';

export function TerrainWater({resources,animated=true}:{resources:TerrainResources;animated?:boolean}){
  const water=useTerrainResource<BufferGeometry>(resources,{kind:'water',key:'water:unified'},2000000);
  const banks=useTerrainResource<BufferGeometry>(resources,{kind:'banks',key:'banks:unified'},1900000);
  const rockSource=useTexture('/assets/terrain/atlas-rock.webp');
  const rock=useMemo(()=>{const t=rockSource.clone();t.wrapS=t.wrapT=RepeatWrapping;t.colorSpace=SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;return t;},[rockSource]);
  const bankMaterial=useMemo(()=>{
    const m=new MeshBasicMaterial({map:rock,vertexColors:true,side:DoubleSide,fog:true,toneMapped:false});
    m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','vec3 bankPaint=texture2D(map,vMapUv).rgb;diffuseColor.rgb*=mix(vec3(.85),bankPaint*.6+.7,.35);');};
    return m;
  },[rock]);
  const clock=useMemo(()=>({value:0}),[]);
  const material=useMemo(()=>{
    const m=new MeshBasicMaterial({vertexColors:true,side:DoubleSide,fog:true,toneMapped:false});
    m.onBeforeCompile=shader=>{
      shader.uniforms.waterTime=clock;
      shader.vertexShader='attribute float waterDepth; attribute float waterFlow; varying float vWaterDepth; varying float vWaterFlow; varying vec2 vWaterPosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWaterDepth=waterDepth;vWaterFlow=waterFlow;vWaterPosition=position.xz;');
      shader.fragmentShader='uniform float waterTime; varying float vWaterDepth; varying float vWaterFlow; varying vec2 vWaterPosition;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float wave=sin(vWaterFlow*.12-waterTime*.8+sin(vWaterPosition.x*.023+vWaterPosition.y*.017)*3.0);
        float fleck=pow(max(0.0,wave),16.0)*pow(max(0.0,sin(vWaterPosition.x*.11+vWaterPosition.y*.079+sin(vWaterPosition.y*.031)*2.0)),8.0);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.65,.83,.76),fleck*.18);
        diffuseColor.rgb*=.96+.04*vWaterDepth;
        float shoreline=(1.0-smoothstep(.015,.075,vWaterDepth))*(.55+.45*sin(vWaterFlow*.043));
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.57,.65,.43),shoreline*.36);
      `);
    };
    return m;
  },[clock]);
  useFrame((_,delta)=>{if(animated)clock.value+=Math.min(delta,.1);});
  useEffect(()=>()=>material.dispose(),[material]);
  useEffect(()=>()=>{rock.dispose();bankMaterial.dispose();},[rock,bankMaterial]);
  return <>
    {banks&&<mesh geometry={banks} material={bankMaterial} raycast={()=>{}} dispose={null}/>}
    {water&&<mesh geometry={water} material={material} raycast={()=>{}} dispose={null}/>}
  </>;
}
