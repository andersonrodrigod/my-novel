import { BufferGeometry, Float32BufferAttribute } from 'three';
import { mapToSphere, WORLD_RADIUS } from './coordinates';
export function surfacePatch(bounds:readonly number[],radius=WORLD_RADIUS+.004,resolution=48){
  const [x1,y1,x2,y2]=bounds,positions:number[]=[],uvs:number[]=[],indices:number[]=[];
  for(let row=0;row<=resolution;row++)for(let col=0;col<=resolution;col++){
    const u=col/resolution,v=row/resolution,p=mapToSphere([x1+(x2-x1)*u,y1+(y2-y1)*v],radius);
    positions.push(p.x,p.y,p.z);uvs.push(u,1-v);
    if(row<resolution&&col<resolution){const a=row*(resolution+1)+col,b=a+resolution+1;indices.push(a,b,a+1,a+1,b,b+1);}
  }
  const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
