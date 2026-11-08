import fs from 'node:fs';
import { readArtwork, suitability } from './terrain-suitability.mjs';

const continentId=process.argv[2];
if(!continentId)throw new Error('Provide the continent ID to review.');
const filename='src/data/world/political-map.json';
const source=JSON.parse(fs.readFileSync(filename,'utf8'));
const countries=source.countries.filter(country=>country.continentId===continentId);
if(!countries.length)throw new Error(`Unknown continent: ${continentId}`);
const image=readArtwork(continentId);
function inside([x,y],ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
const owns=(p,c)=>c.geometry.some(poly=>inside(p,poly[0])&&!poly.slice(1).some(hole=>inside(p,hole)));
for(const country of countries){
  const oldX=Math.round(country.citySite[0]*image.width),oldY=Math.round(country.citySite[1]*image.height);
  let score=suitability(image,oldX,oldY);
  const hasClearance=Array.from({length:32},(_,i)=>i*Math.PI/16).every(a=>owns([(oldX+Math.cos(a)*5)/image.width,(oldY+Math.sin(a)*5)/image.height],country));
  if(score>.5&&owns(country.citySite,country)&&hasClearance){country.siteSuitability=Number(score.toFixed(3));continue;}
  const points=country.geometry.flat(2);
  const minX=Math.max(6,Math.ceil(Math.min(...points.map(p=>p[0]))*image.width));
  const maxX=Math.min(image.width-6,Math.floor(Math.max(...points.map(p=>p[0]))*image.width));
  const minY=Math.max(6,Math.ceil(Math.min(...points.map(p=>p[1]))*image.height));
  const maxY=Math.min(image.height-6,Math.floor(Math.max(...points.map(p=>p[1]))*image.height));
  let best=null,distance=Infinity;
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const d=(x-oldX)**2+(y-oldY)**2;if(d>=distance)continue;
    const p=[x/image.width,y/image.height];if(!owns(p,country))continue;
    const quality=suitability(image,x,y);if(quality<=.5)continue;
    if(!Array.from({length:32},(_,i)=>i*Math.PI/16).every(a=>owns([(x+Math.cos(a)*5)/image.width,(y+Math.sin(a)*5)/image.height],country)))continue;
    best={point:p,quality};distance=d;
  }
  if(!best)throw new Error(`${country.nationId}: no suitable city reserve within existing borders`);
  country.citySite=best.point.map(v=>Number(v.toFixed(7)));country.siteSuitability=Number(best.quality.toFixed(3));
  console.log(`${country.nationId}: moved city site ${Math.sqrt(distance).toFixed(1)} map pixels within its existing territory`);
}
fs.writeFileSync(filename,JSON.stringify(source));
console.log(`Reviewed ${countries.length} city sites; country borders preserved.`);
