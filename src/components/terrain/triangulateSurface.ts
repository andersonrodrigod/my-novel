import { ShapeUtils, Vector2 } from 'three';
import type { MultiPolygon, Pair } from 'polygon-clipping';

/** Subdivide inside the already-clipped polygon, preserving its concave shores and holes. */
export function triangulateSurface(polygons:MultiPolygon,maxEdge=48){
 const points:Pair[]=[],indices:number[]=[],vertices=new Map<string,number>();
 const vertex=(p:Pair)=>{const key=`${p[0].toFixed(7)},${p[1].toFixed(7)}`;let index=vertices.get(key);if(index===undefined){index=points.length;points.push(p);vertices.set(key,index);}return index;};
 const edge=(a:number,b:number)=>(points[a][0]-points[b][0])**2+(points[a][1]-points[b][1])**2;
 const split=(a:number,b:number,c:number)=>{
  const ab=edge(a,b),bc=edge(b,c),ca=edge(c,a),longest=Math.max(ab,bc,ca);
  if(longest<=maxEdge*maxEdge){indices.push(a,b,c);return;}
  if(bc===longest){[a,b,c]=[b,c,a];}else if(ca===longest){[a,b,c]=[c,a,b];}
  const m=vertex([(points[a][0]+points[b][0])/2,(points[a][1]+points[b][1])/2]);
  split(a,m,c);split(m,b,c);
 };
 for(const polygon of polygons){
  const rings=polygon.map(ring=>ring.slice(0,-1).map(([x,z])=>new Vector2(x,z))),flat=rings.flat();
  const mapped=flat.map(p=>vertex([p.x,p.y]));
  for(const [a,b,c] of ShapeUtils.triangulateShape(rings[0],rings.slice(1)))split(mapped[a],mapped[b],mapped[c]);
 }
 return {points,indices};
}
