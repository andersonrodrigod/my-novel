import { clamp, randomAt, terrainNoise, type TerrainField } from './TerrainField.ts';

export interface PaintedTree {x:number;z:number;y:number;size:number;species:number;shade:number;}

/** Deterministic positions shared by the scene and the performance benchmark. */
function createLayer(field:TerrainField,anchor:[number,number],understory:boolean,city:[number,number]){
 const list:PaintedTree[]=[],{width,height}=field.manifest,[cityX,cityZ]=city;
 const add=(x:number,z:number,understory:boolean)=>{
  if(Math.abs(x)>width/2||Math.abs(z)>height/2)return;
  const forest=field.sample(x,z,'forest'),shore=field.hydrology?.sample(x,z).distance??Infinity;
  if(shore<7||Math.hypot(x-cityX,z-cityZ)<65)return;
  if(!understory&&shore<42&&terrainNoise(x/110,z/110)>.58&&randomAt(x,z,81)<.6&&field.slope(x,z)<.5){
   list.push({x,z,y:field.elevation(x,z),size:20+randomAt(x,z,82)*15,species:Math.floor(randomAt(x,z,83)*3),shade:.52+randomAt(x,z,84)*.2});
  }
  if(shore<22)return;
  const density=clamp((forest*.78+terrainNoise(x/145,z/145)*.22-.36)/.35);
  if(randomAt(x,z,31)>density*density||forest<.22)return;
  if(understory&&Math.hypot(x-anchor[0],z-anchor[1])>600)return;
  const h=field.elevation(x,z);if(h>880||field.slope(x,z)>.85)return;
  const pine=h>250||randomAt(x,z,67)>.58;
  const species=pine?6+Math.floor(randomAt(x,z,68)*2):Math.floor(randomAt(x,z,69)*6);
  list.push({x,z,y:h,size:(understory?27:60)*(.65+randomAt(x,z,29)*1.05),species,shade:.45+randomAt(x,z,13)*.30});
 };
 if(!understory){for(let z=-height/2;z<height/2;z+=25)for(let x=-width/2;x<width/2;x+=25)add(x+randomAt(x,z,1)*20,z+randomAt(x,z,2)*20,false);}
 else{const step=26,startX=Math.floor((anchor[0]-600)/step)*step,startZ=Math.floor((anchor[1]-600)/step)*step;for(let z=startZ;z<anchor[1]+600;z+=step)for(let x=startX;x<anchor[0]+600;x+=step)add(x+randomAt(x,z,1)*17,z+randomAt(x,z,2)*17,true);}
 return list;
}
export const createRegionalVegetation=(field:TerrainField,city:[number,number])=>createLayer(field,[0,0],false,city);
export const createLocalVegetation=(field:TerrainField,anchor:[number,number],city:[number,number])=>createLayer(field,anchor,true,city);
export function createPaintedVegetation(field:TerrainField,anchor:[number,number],close:boolean,city:[number,number]){
 const regional=createRegionalVegetation(field,city);
 return close?regional.concat(createLocalVegetation(field,anchor,city)):regional;
}
