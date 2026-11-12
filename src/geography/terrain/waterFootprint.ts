import polygonClipping, { type MultiPolygon, type Polygon, type Pair } from 'polygon-clipping';
import { terrainNoise, type TerrainField } from './TerrainField.ts';

export interface WaterFootprint {water:MultiPolygon;banks:MultiPolygon;depth:(x:number,z:number)=>number;}
const footprints=new WeakMap<TerrainField,WaterFootprint>();

// Distance to the EXTERNAL unified shore, so channel widths cannot introduce a seam.
function depthSampler(polygons:MultiPolygon){
 const cells=new Map<string,number[][]>(),size=128,radius=90;
 for(const polygon of polygons)for(const ring of polygon)for(let i=1;i<ring.length;i++){
  const [ax,az]=ring[i-1],[bx,bz]=ring[i],segment=[ax,az,bx,bz];
  for(let z=Math.floor((Math.min(az,bz)-radius)/size);z<=Math.floor((Math.max(az,bz)+radius)/size);z++)for(let x=Math.floor((Math.min(ax,bx)-radius)/size);x<=Math.floor((Math.max(ax,bx)+radius)/size);x++){
   const key=`${x},${z}`,list=cells.get(key)??[];list.push(segment);cells.set(key,list);
  }
 }
 return (x:number,z:number)=>{
  let best=radius*radius;
  for(const [ax,az,bx,bz] of cells.get(`${Math.floor(x/size)},${Math.floor(z/size)}`)??[]){
   const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));
   best=Math.min(best,(x-ax-dx*t)**2+(z-az-dz*t)**2);
  }
  return Math.sqrt(best)/radius;
 };
}

/** Boolean union removes every internal mouth/cap; banks border the combined water only. */
export function waterFootprint(field:TerrainField):WaterFootprint{
 const hit=footprints.get(field);if(hit)return hit;
 const water:Polygon[]=[],outer:Polygon[]=[];
 for(const {stations} of field.hydrology?.courses??[]){
  const sides:Pair[][]=[[],[]],edges:Pair[][]=[[],[]];
  stations.forEach((p,i)=>{
   const a=stations[Math.max(0,i-1)],b=stations[Math.min(stations.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1;
   const turn=((p.x-a.x)*(b.z-p.z)-(p.z-a.z)*(b.x-p.x))/(Math.hypot(p.x-a.x,p.z-a.z)*Math.hypot(b.x-p.x,b.z-p.z)||1);
   for(const [j,side] of [[0,1],[1,-1]]){
    const half=side>0?p.leftWidth:p.rightWidth,bar=Math.max(0,Math.min(1,.12+side*turn*22));
    const margin=p.width>40?18+bar*40+terrainNoise(p.x/55,p.z/55)*11:12+terrainNoise(p.x/35,p.z/35)*8;
    sides[j].push([p.x-dz/len*half*side,p.z+dx/len*half*side]);
    edges[j].push([p.x-dz/len*(half+margin)*side,p.z+dx/len*(half+margin)*side]);
   }
  });
  water.push([[...sides[0],...sides[1].reverse()]]);outer.push([[...edges[0],...edges[1].reverse()]]);
 }
 field.hydrology?.lakes.forEach(({x,z,rx,rz},index)=>{
  const shore:Pair[]=[],edge:Pair[]=[];
  for(let i=0;i<80;i++){
   const a=i/80*Math.PI*2,r=field.hydrology!.lakeRadius(a,index),margin=12+terrainNoise(Math.cos(a)*3+index,Math.sin(a)*3-index)*15;
   shore.push([x+Math.cos(a)*rx*r,z+Math.sin(a)*rz*r]);
   edge.push([x+Math.cos(a)*(rx*r+margin),z+Math.sin(a)*(rz*r+margin)]);
  }
  water.push([shore]);outer.push([edge]);
 });
 const merged=water.length?polygonClipping.union(water):[];
 const result={water:merged,banks:outer.length?polygonClipping.difference(polygonClipping.union(outer),merged):[],depth:depthSampler(merged)};
 footprints.set(field,result);return result;
}
