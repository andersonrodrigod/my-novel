import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Color, ConeGeometry, CylinderGeometry, IcosahedronGeometry, InstancedMesh, Object3D } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TerrainField, randomAt } from '../../geography/terrain/TerrainField';
import { countryTerritories } from '../../data/world/politicalMap';

interface Tree {x:number;z:number;y:number;scale:number;rotation:number;shade:number;}
export function TerrainVegetation({field,anchor,close}:{field:TerrainField;anchor:[number,number];close:boolean}){
 const trees=useMemo(()=>{
  const list:Tree[]=[],{width,height}=field.manifest;
  const add=(x:number,z:number,detail:boolean)=>{
   const forest=field.sample(x,z,'forest'),water=field.sample(x,z,'water');
   if(forest<.2||water>.02||randomAt(x,z,31)>forest*.7||field.slope(x,z)>.95||field.elevation(x,z)>750)return;
   const [cityX,cityZ]=field.toLocal(countryTerritories.find(c=>c.nationId==='aetheria-07')!.citySite);if(Math.hypot(x-cityX,z-cityZ)<45)return;
   if(detail?Math.hypot(x-anchor[0],z-anchor[1])>650:close&&Math.hypot(x-anchor[0],z-anchor[1])<540)return;
   list.push({x,z,y:field.elevation(x,z),scale:(detail?.7:1.7)*(0.7+randomAt(x,z,29)*.8),rotation:randomAt(x,z,15)*Math.PI*2,shade:randomAt(x,z,13)});
  };
  for(let z=-height/2;z<height/2;z+=42)for(let x=-width/2;x<width/2;x+=42)add(x+randomAt(x,z,1)*34,z+randomAt(x,z,2)*34,false);
  if(close){const step=13,startX=Math.floor((anchor[0]-650)/step)*step,startZ=Math.floor((anchor[1]-650)/step)*step;for(let z=startZ;z<anchor[1]+650;z+=step)for(let x=startX;x<anchor[0]+650;x+=step)add(x+randomAt(x,z,1)*10,z+randomAt(x,z,2)*10,true);}
  return list;
 },[field,anchor[0],anchor[1],close]);
 const crowns=useRef<InstancedMesh>(null),trunks=useRef<InstancedMesh>(null);
 const geometry=useMemo(()=>{
  const cones=[new ConeGeometry(3.8,8,7),new ConeGeometry(3.1,7,7),new ConeGeometry(2.2,6,7)];cones[0].translate(0,5,0);cones[1].translate(0,8,0);cones[2].translate(0,10.5,0);
  const rounded=new IcosahedronGeometry(3.8,1);rounded.scale(1,1.2,1);rounded.translate(0,6,0);
  const plain=cones.map(g=>g.toNonIndexed()),merged=mergeGeometries([...plain,rounded]);cones.forEach(g=>g.dispose());plain.forEach(g=>g.dispose());rounded.dispose();return merged;
 },[]);
 const trunk=useMemo(()=>{const g=new CylinderGeometry(.35,.65,6,5);g.translate(0,3,0);return g;},[]);
 useLayoutEffect(()=>{
  if(!crowns.current||!trunks.current)return;const object=new Object3D(),a=new Color('#234e2d'),b=new Color('#6b8534');
  trees.forEach((t,i)=>{object.position.set(t.x,t.y,t.z);object.rotation.set(0,t.rotation,0);object.scale.setScalar(t.scale);object.updateMatrix();crowns.current!.setMatrixAt(i,object.matrix);trunks.current!.setMatrixAt(i,object.matrix);crowns.current!.setColorAt(i,a.clone().lerp(b,t.shade));});
  crowns.current.instanceMatrix.needsUpdate=true;trunks.current.instanceMatrix.needsUpdate=true;if(crowns.current.instanceColor)crowns.current.instanceColor.needsUpdate=true;crowns.current.computeBoundingSphere();trunks.current.computeBoundingSphere();
 },[trees]);
 useEffect(()=>()=>{geometry.dispose();trunk.dispose();},[geometry,trunk]);
 return <group><instancedMesh castShadow key={`c${trees.length}`} ref={crowns} args={[geometry,undefined,trees.length]} raycast={()=>{}}><meshStandardMaterial roughness={1}/></instancedMesh><instancedMesh castShadow key={`t${trees.length}`} ref={trunks} args={[trunk,undefined,trees.length]} raycast={()=>{}}><meshStandardMaterial color="#635136" roughness={1}/></instancedMesh></group>;
}
