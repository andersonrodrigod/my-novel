import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { Color, IcosahedronGeometry, InstancedMesh, Object3D, RepeatWrapping, SRGBColorSpace } from 'three';
import { randomAt, TerrainField } from '../../geography/terrain/TerrainField';

/** Sparse stones give riverbanks and foothills detail without adding settlements. */
export function TerrainDetails({field}:{field:TerrainField}){
  const mesh=useRef<InstancedMesh>(null);
  const geometry=useMemo(()=>new IcosahedronGeometry(1,1),[]);
  const source=useTexture('/assets/terrain/atlas-rock.webp');
  const texture=useMemo(()=>{const t=source.clone();t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(1.4,1.4);t.colorSpace=SRGBColorSpace;t.needsUpdate=true;return t;},[source]);
  const rocks=useMemo(()=>{
    const result:{x:number;y:number;z:number;size:number;turn:number}[]=[];
    const {width,height}=field.manifest;
    for(let z=-height/2;z<height/2;z+=69)for(let x=-width/2;x<width/2;x+=69){
      const px=x+randomAt(x,z,71)*52,pz=z+randomAt(x,z,72)*52;
      const shore=field.hydrology?.sample(px,pz).distance??Infinity,h=field.elevation(px,pz);
      if(shore<5||field.sample(px,pz,'forest')>.5)continue;
      if(!(shore<35||h>300&&field.slope(px,pz)<.6&&randomAt(x,z,73)>.65))continue;
      result.push({x:px,z:pz,y:h,size:3+randomAt(x,z,74)*8,turn:randomAt(x,z,75)*Math.PI});
    }
    return result;
  },[field]);
  useLayoutEffect(()=>{
    if(!mesh.current)return;
    const object=new Object3D();
    rocks.forEach((r,i)=>{
      object.position.set(r.x,r.y+r.size*.26,r.z);object.rotation.set(.2,r.turn,.1);object.scale.set(r.size*1.2,r.size*.66,r.size*.9);object.updateMatrix();
      const shade=.88+randomAt(r.x,r.z,77)*.2;
      mesh.current!.setMatrixAt(i,object.matrix);mesh.current!.setColorAt(i,new Color().setRGB(shade,shade,shade));
    });
    mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;mesh.current.computeBoundingSphere();
  },[rocks]);
  useEffect(()=>()=>{geometry.dispose();texture.dispose();},[geometry,texture]);
  return <instancedMesh ref={mesh} args={[geometry,undefined,rocks.length]} raycast={()=>{}}><meshBasicMaterial map={texture} toneMapped={false} fog/></instancedMesh>;
}
