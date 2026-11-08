import editorial from '../../../viremont_ducados_codex.md?raw';
import source from './duchies.json';
import { pointInPolygon } from '../../geography/coordinates';
import type { Duchy, GeographicFocus, Point } from '../../types/geography';
import { countryTerritories } from '../world/politicalMap';

// Runtime prose comes directly from the author's single editorial document.
export function readEditorialSection(markdown:string,section:number){
  const heading=`### 2.${section} Ducado de `;
  const start=markdown.indexOf(heading);
  if(start<0)throw new Error(`Missing duchy editorial section 2.${section}`);
  const rest=markdown.slice(start+heading.length);
  const name=rest.split(' — ')[0].trim();
  const next=rest.indexOf('\n### '),nextMain=rest.indexOf('\n## ');
  const end=Math.min(...[next,nextMain,rest.length].filter(i=>i>=0));
  const body=rest.slice(0,end);
  const paragraph=(label:string)=>{
    const match=body.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`));
    if(!match)throw new Error(`Missing ${label} in duchy 2.${section}`);
    return match[1].trim();
  };
  return {name:`Ducado de ${name}`,description:paragraph('Paisagem'),economy:paragraph('Vocação'),history:paragraph('História breve')};
}
export const duchies:Duchy[]=source.duchies.map(record=>({...record,...readEditorialSection(editorial,record.editorialSection)})) as unknown as Duchy[];
export function duchyAt(point:Point){return duchies.find(duchy=>duchy.geometry.some(poly=>pointInPolygon(point,poly[0])&&!poly.slice(1).some(hole=>pointInPolygon(point,hole))));}
export function duchyFocus(duchy:Duchy):GeographicFocus{
  const points=duchy.geometry.flat(2),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const candidate:Point=[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2];
  const center=duchy.geometry.some(poly=>pointInPolygon(candidate,poly[0]))?candidate:duchy.labelAnchor;
  return {id:duchy.id,center,extent:[2*Math.max(...xs.map(x=>Math.abs(x-center[0]))),2*Math.max(...ys.map(y=>Math.abs(y-center[1])))],level:'duchy'};
}
export const cityProposalDuchy=duchyAt([.3203125,.3740234])?.id;
const nationalPoints=countryTerritories.find(c=>c.nationId==='aetheria-07')!.geometry.flat(2);
const minX=Math.min(...nationalPoints.map(p=>p[0])),maxX=Math.max(...nationalPoints.map(p=>p[0])),minY=Math.min(...nationalPoints.map(p=>p[1])),maxY=Math.max(...nationalPoints.map(p=>p[1]));
export const viremontFocus:GeographicFocus={id:'aetheria-07',center:[(minX+maxX)/2,(minY+maxY)/2],extent:[maxX-minX,maxY-minY],level:'nation'};
