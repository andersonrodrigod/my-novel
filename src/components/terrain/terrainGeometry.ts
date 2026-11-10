import { BufferGeometry, Color, Float32BufferAttribute, Path, Shape, ShapeGeometry } from 'three';
import { clamp, randomAt, TerrainField } from '../../geography/terrain/TerrainField.ts';
import type { Point } from '../../types/geography';

export function waterGeometry(field:TerrainField,features:{geometry:number[][][][]}[]){
 const shapes:Shape[]=[];
 const trace=(path:Path,ring:number[][])=>{
  const p=ring.slice(0,-1).map(point=>{const [x,z]=field.toLocal(point as unknown as Point);return [x,-z];});
  const last=p.at(-1)!;path.moveTo((last[0]+p[0][0])/2,(last[1]+p[0][1])/2);
  p.forEach((v,i)=>{const next=p[(i+1)%p.length];path.quadraticCurveTo(v[0],v[1],(v[0]+next[0])/2,(v[1]+next[1])/2);});path.closePath();
 };
 for(const feature of features)for(const polygon of feature.geometry){const shape=new Shape();trace(shape,polygon[0]);for(const ring of polygon.slice(1)){const hole=new Path();trace(hole,ring);shape.holes.push(hole);}shapes.push(shape);}
 const geometry=new ShapeGeometry(shapes,3);geometry.rotateX(-Math.PI/2);geometry.translate(0,field.manifest.waterLevel+.35,0);return geometry;
}

export function terrainGeometry(field:TerrainField,x0:number,z0:number,width:number,depth:number,resolution:number){
 const positions:number[]=[],normals:number[]=[],colors:number[]=[],uvs:number[]=[],mix:number[]=[],indices:number[]=[];
 const gold=new Color('#b3ad47'),grass=new Color('#788f39'),forest=new Color('#31582e'),rock=new Color('#6c777a'),snow=new Color('#f2f4eb'),bank=new Color('#b8b67b');
 function vertex(x:number,z:number,skirt=0){
  const h=field.elevation(x,z),dx=(field.elevation(x+4,z)-field.elevation(x-4,z))/8,dz=(field.elevation(x,z+4)-field.elevation(x,z-4))/8,len=Math.hypot(dx,1,dz),slope=Math.hypot(dx,dz);
  positions.push(x,h-skirt,z);normals.push(-dx/len,1/len,-dz/len);uvs.push(x/180,z/180);
  const tree=field.sample(x,z,'forest'),water=field.sample(x,z,'water'),stony=clamp((slope-.48)*1.7+(h-320)/1100),icy=clamp((h-660)/175+(randomAt(Math.floor(x/80),Math.floor(z/80))-.5)*.3);
  const color=gold.clone().lerp(grass,.35+randomAt(Math.floor(x/160),Math.floor(z/160))*.4).lerp(forest,clamp(tree*.85)).lerp(rock,stony).lerp(snow,icy).lerp(bank,clamp(water*1.8));
  color.multiplyScalar(skirt?.75:1);colors.push(color.r,color.g,color.b);mix.push((1-stony)*(1-icy)*.44);
 }
 for(let row=0;row<=resolution;row++)for(let col=0;col<=resolution;col++){
  vertex(x0+col/resolution*width,z0+row/resolution*depth);
  if(row<resolution&&col<resolution){const a=row*(resolution+1)+col,b=a+resolution+1;indices.push(a,b,a+1,a+1,b,b+1);}
 }
 // Skirts hide differences between neighboring tessellation levels without moving map coordinates.
 const edges=[Array.from({length:resolution+1},(_,i)=>i),Array.from({length:resolution+1},(_,i)=>i*(resolution+1)+resolution),Array.from({length:resolution+1},(_,i)=>resolution*(resolution+1)+resolution-i),Array.from({length:resolution+1},(_,i)=>(resolution-i)*(resolution+1))];
 for(const edge of edges){const base=positions.length/3;for(const index of edge)vertex(positions[index*3],positions[index*3+2],150);for(let i=0;i<edge.length-1;i++)indices.push(edge[i],base+i,edge[i+1],edge[i+1],base+i,base+i+1);}
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new Float32BufferAttribute(normals,3));geometry.setAttribute('color',new Float32BufferAttribute(colors,3));geometry.setAttribute('uv',new Float32BufferAttribute(uvs,2));geometry.setAttribute('surfaceMix',new Float32BufferAttribute(mix,1));geometry.setIndex(indices);geometry.computeBoundingSphere();return geometry;
}
