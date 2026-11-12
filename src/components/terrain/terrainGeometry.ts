import { BufferGeometry, Color, Float32BufferAttribute } from 'three';
import { clamp, terrainNoise, TerrainField } from '../../geography/terrain/TerrainField.ts';
import { waterFootprint } from '../../geography/terrain/waterFootprint.ts';
import { triangulateSurface } from './triangulateSurface.ts';

function meshData(positions:number[],colors:number[],indices:number[],depth?:number[],flow?:number[]){
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('color',new Float32BufferAttribute(colors,3));geometry.setIndex(indices);
 if(depth)geometry.setAttribute('waterDepth',new Float32BufferAttribute(depth,1));
 if(flow)geometry.setAttribute('waterFlow',new Float32BufferAttribute(flow,1));
 geometry.computeVertexNormals();geometry.computeBoundingSphere();return geometry;
}

/** A single triangulated surface owns each confluence, with no overlapping channel caps. */
export function waterGeometry(field:TerrainField){
 const footprint=waterFootprint(field),{points,indices}=triangulateSurface(footprint.water,24),positions:number[]=[],colors:number[]=[],depth:number[]=[],flow:number[]=[];
 const shallow=new Color('#66907e'),deep=new Color('#244f4a');
 for(const [x,z] of points){
  // A common depth scale stays continuous where a narrow tributary meets a wide river.
  const sample=field.hydrology!.sample(x,z),d=footprint.depth(x,z);
  positions.push(x,sample.level+.45,z);const c=shallow.clone().lerp(deep,Math.pow(d,.55));colors.push(c.r,c.g,c.b);depth.push(d);flow.push(x*.8+z*.6);
 }
 return meshData(positions,colors,indices,depth,flow);
}

export function bankGeometry(field:TerrainField){
 const {points,indices}=triangulateSurface(waterFootprint(field).banks),positions:number[]=[],colors:number[]=[],uv:number[]=[];
 const dry=new Color('#bca77c'),wet=new Color('#687966'),grass=new Color('#8c9563');
 for(const [x,z] of points){
  const sample=field.hydrology!.sample(x,z),t=clamp(sample.distance/34);
  positions.push(x,Math.max(field.elevation(x,z)+.2,sample.level+.28+t*.8),z);
  const c=wet.clone().lerp(dry,clamp(t*.7+terrainNoise(x/17,z/17)*.3)).lerp(grass,t*t*.38);colors.push(c.r,c.g,c.b);uv.push(x/35,z/35);
 }
 const geometry=meshData(positions,colors,indices);geometry.setAttribute('uv',new Float32BufferAttribute(uv,2));return geometry;
}

export function terrainGeometry(field:TerrainField,x0:number,z0:number,width:number,depth:number,resolution:number){
 const positions:number[]=[],normals:number[]=[],colors:number[]=[],uvs:number[]=[],mix:number[]=[],rocks:number[]=[],canopies:number[]=[],indices:number[]=[];
 const gold=new Color('#b9aa58'),grass=new Color('#889650'),forest=new Color('#405331'),rock=new Color('#afa287'),snow=new Color('#e8e3cc'),bank=new Color('#b5ab7e');
 function vertex(x:number,z:number,skirt=0){
  const h=field.elevation(x,z),dx=(field.elevation(x+4,z)-field.elevation(x-4,z))/8,dz=(field.elevation(x,z+4)-field.elevation(x,z-4))/8,len=Math.hypot(dx,1,dz),slope=Math.hypot(dx,dz);
  positions.push(x,h-skirt,z);normals.push(-dx/len,1/len,-dz/len);uvs.push(x/170,z/170);
  const tree=field.sample(x,z,'forest'),shore=field.hydrology?.sample(x,z).distance??Infinity,stony=clamp((slope-.48)*1.0+(h-340)/1000),icy=clamp((h-1150)/200);
  const color=gold.clone().lerp(grass,.12+terrainNoise(x/430,z/430)*.75).lerp(forest,clamp((tree-.25)*.85)).lerp(rock,stony).lerp(snow,icy).lerp(bank,clamp(1-Math.abs(shore-15)/32)*.45);
  const canopy=clamp((tree*.78+terrainNoise(x/145,z/145)*.22-.36)/.35);
  canopies.push(canopy*canopy*(1-stony));
  color.multiplyScalar(skirt?.78:1);colors.push(color.r,color.g,color.b);mix.push((1-stony)*(1-icy)*.8);rocks.push(stony*(1-icy));
 }
 for(let row=0;row<=resolution;row++)for(let col=0;col<=resolution;col++){
  vertex(x0+col/resolution*width,z0+row/resolution*depth);
  if(row<resolution&&col<resolution){const a=row*(resolution+1)+col,b=a+resolution+1;indices.push(a,b,a+1,a+1,b,b+1);}
 }
 const edges=[Array.from({length:resolution+1},(_,i)=>i),Array.from({length:resolution+1},(_,i)=>i*(resolution+1)+resolution),Array.from({length:resolution+1},(_,i)=>resolution*(resolution+1)+resolution-i),Array.from({length:resolution+1},(_,i)=>(resolution-i)*(resolution+1))];
 for(const edge of edges){const base=positions.length/3;for(const index of edge)vertex(positions[index*3],positions[index*3+2],150);for(let i=0;i<edge.length-1;i++)indices.push(edge[i],base+i,edge[i+1],edge[i+1],base+i,base+i+1);}
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new Float32BufferAttribute(normals,3));geometry.setAttribute('color',new Float32BufferAttribute(colors,3));geometry.setAttribute('uv',new Float32BufferAttribute(uvs,2));geometry.setAttribute('surfaceMix',new Float32BufferAttribute(mix,1));geometry.setAttribute('surfaceRock',new Float32BufferAttribute(rocks,1));geometry.setAttribute('surfaceCanopy',new Float32BufferAttribute(canopies,1));geometry.setIndex(indices);geometry.computeBoundingSphere();return geometry;
}
