import type { Duchy, Point } from '../../types/geography';
import type { TerrainField } from './TerrainField.ts';

export function polygonArea(ring:readonly Point[]){
 return Math.abs(ring.reduce((sum,a,i)=>{const b=ring[(i+1)%ring.length];return sum+a[0]*b[1]-b[0]*a[1];},0)/2);
}
/** Ratios use the registered local projection; no kilometer/population scale is inferred. */
export function cityScale(field:TerrainField,duchy:Duchy,center:Point,share:number,aspect=1.3){
 const duchyArea=duchy.geometry.reduce((sum,polygon)=>sum+polygon.reduce((area,ring,index)=>area+(index?-1:1)*polygonArea(ring.map(p=>field.toLocal(p))),0),0);
 const outline:Point[]=[[-.5,-.32],[-.32,-.5],[.32,-.5],[.5,-.32],[.5,.32],[.32,.5],[-.32,.5],[-.5,.32]];
 const unit=outline.map(([x,z])=>[x*Math.sqrt(aspect),z/Math.sqrt(aspect)] as Point);
 const factor=Math.sqrt(duchyArea*share/polygonArea(unit)),[x,z]=field.toLocal(center);
 const ring=unit.map(([a,b])=>[x+a*factor,z+b*factor] as Point);
 return {center:[x,z] as Point,ring,duchyArea,cityArea:polygonArea(ring),share,width:factor*Math.sqrt(aspect),depth:factor/Math.sqrt(aspect)};
}
export const formatCityShare=(share:number)=>`${(share*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}%`;
