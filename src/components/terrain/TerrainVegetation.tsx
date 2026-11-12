import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { Color, DoubleSide, InstancedBufferAttribute, InstancedMesh, MeshBasicMaterial, Object3D, PlaneGeometry, SRGBColorSpace } from 'three';
import type { PaintedTree } from '../../geography/terrain/vegetation';
import type { TerrainResources } from './terrainResources';
import { useTerrainResource } from './useTerrainResource';

/** Illustrated cutouts face the camera while their roots stay in geographic coordinates. */
export function TerrainVegetation({resources,anchor,close}:{resources:TerrainResources;anchor:[number,number];close:boolean}){
 const source=useTexture('/assets/terrain/atlas-trees.webp');
 const texture=useMemo(()=>{const t=source.clone();t.colorSpace=SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;return t;},[source]);
 const trees=useTerrainResource<PaintedTree[]>(resources,{kind:'regional',key:'vegetation:regional'},900000);
 const material=useMemo(()=>{
  const m=new MeshBasicMaterial({map:texture,alphaTest:.38,side:DoubleSide,fog:true,depthWrite:true,toneMapped:false});
  m.onBeforeCompile=shader=>{
   shader.vertexShader='attribute float treeCell; varying float vTreeCell;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvTreeCell=treeCell;\n#ifdef USE_MAP\nfloat col=mod(treeCell,4.0);float row=1.0-floor(treeCell/4.0);vMapUv=vec2((col+mix(.012,.988,uv.x))/4.0,(row+mix(.012,.988,uv.y))/2.0);\n#endif');
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
    vec4 anchor=modelMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);
    float sx=length(instanceMatrix[0].xyz);float sy=length(instanceMatrix[1].xyz);
    vec3 right=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);
    vec3 up=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);
    vec3 world=anchor.xyz+right*position.x*sx+up*position.y*sy;
    vec4 mvPosition=viewMatrix*vec4(world,1.0);
    gl_Position=projectionMatrix*mvPosition;
   `);
  };
  return m;
 },[texture]);
 useEffect(()=>()=>{material.dispose();texture.dispose();},[material,texture]);
 return <>{trees&&<PaintedTreeLayer trees={trees} material={material}/>}<LocalVegetation resources={resources} anchor={anchor} close={close} material={material}/></>;
}
function LocalVegetation({resources,anchor,close,material}:{resources:TerrainResources;anchor:[number,number];close:boolean;material:MeshBasicMaterial}){
 return close?<LocalTrees resources={resources} anchor={anchor} material={material}/>:null;
}
function LocalTrees({resources,anchor,material}:{resources:TerrainResources;anchor:[number,number];material:MeshBasicMaterial}){
 const trees=useTerrainResource<PaintedTree[]>(resources,{kind:'local',key:`vegetation:local:${anchor[0]}:${anchor[1]}`,anchor},100000);
 return trees?<PaintedTreeLayer trees={trees} material={material}/>:null;
}
function PaintedTreeLayer({trees,material}:{trees:PaintedTree[];material:MeshBasicMaterial}){
 const geometry=useMemo(()=>{const g=new PlaneGeometry(1,1);g.translate(0,.5,0);g.setAttribute('treeCell',new InstancedBufferAttribute(new Float32Array(trees.map(t=>t.species)),1));return g;},[trees]);
 const mesh=useRef<InstancedMesh>(null);
 useLayoutEffect(()=>{
  if(!mesh.current)return;const object=new Object3D();
  trees.forEach((t,i)=>{object.position.set(t.x,t.y+.4,t.z);object.scale.set(t.size*1.02,t.size,1);object.updateMatrix();mesh.current!.setMatrixAt(i,object.matrix);mesh.current!.setColorAt(i,new Color().setRGB(t.shade*.78,t.shade,t.shade*.9));});
  mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
 },[trees,geometry]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <instancedMesh ref={mesh} key={trees.length} args={[geometry,material,trees.length]} frustumCulled={false} raycast={()=>{}} dispose={null}/>;
}
