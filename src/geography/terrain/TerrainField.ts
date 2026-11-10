import type { Point } from '../../types/geography';

export interface TerrainManifest { bounds:number[];size:number;width:number;height:number;maxHeight:number;waterLevel:number;url:string;version:string; }
export const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const randomAt=(x:number,z:number,seed=0)=>{const n=Math.sin(x*127.1+z*311.7+seed*73.13)*43758.5453;return n-Math.floor(n);};
function noise(x:number,z:number){const a=Math.floor(x),b=Math.floor(z),u=x-a,v=z-b,s=u*u*(3-2*u),t=v*v*(3-2*v);return (randomAt(a,b)*(1-s)+randomAt(a+1,b)*s)*(1-t)+(randomAt(a,b+1)*(1-s)+randomAt(a+1,b+1)*s)*t;}

export class TerrainField {
  readonly bytes:Uint8Array;readonly heights:Float32Array;readonly manifest:TerrainManifest;
  constructor(manifest:TerrainManifest,buffer:ArrayBuffer){
    this.manifest=manifest;
    if(buffer.byteLength!==manifest.size*manifest.size*4)throw new Error('Arquivo de terreno incompleto');
    this.bytes=new Uint8Array(buffer);this.heights=new Float32Array(manifest.size**2);
    const view=new DataView(buffer);for(let i=0;i<this.heights.length;i++)this.heights[i]=view.getUint16(i*4,true)/65535*manifest.maxHeight;
  }
  toLocal([u,v]:Point):[number,number]{const [x1,y1,x2,y2]=this.manifest.bounds;return [((u-x1)/(x2-x1)-.5)*this.manifest.width,((v-y1)/(y2-y1)-.5)*this.manifest.height];}
  toMap(x:number,z:number):Point{const [x1,y1,x2,y2]=this.manifest.bounds;return [x1+(x/this.manifest.width+.5)*(x2-x1),y1+(z/this.manifest.height+.5)*(y2-y1)];}
  sample(x:number,z:number,channel:'height'|'forest'|'water'='height'){
    const {size,width,height}=this.manifest,px=clamp(x/width+.5)*(size-1),pz=clamp(z/height+.5)*(size-1),ix=Math.min(size-2,Math.floor(px)),iz=Math.min(size-2,Math.floor(pz)),u=px-ix,v=pz-iz;
    const read=(a:number,b:number)=>channel==='height'?this.heights[b*size+a]:this.bytes[(b*size+a)*4+(channel==='forest'?2:3)]/255;
    return (read(ix,iz)*(1-u)+read(ix+1,iz)*u)*(1-v)+(read(ix,iz+1)*(1-u)+read(ix+1,iz+1)*u)*v;
  }
  elevation(x:number,z:number){
    const water=this.sample(x,z,'water');
    // Stable world-coordinate microrelief: it never changes with tile resolution or selection.
    const detail=(noise(x/35,z/35)-.5)*5+(noise(x/9,z/9)-.5)*1.2;
    return this.sample(x,z)+detail*(1-clamp(water*4));
  }
  slope(x:number,z:number){const dx=(this.elevation(x+5,z)-this.elevation(x-5,z))/10,dz=(this.elevation(x,z+5)-this.elevation(x,z-5))/10;return Math.hypot(dx,dz);}
  surface(x:number,z:number){return Math.max(this.manifest.waterLevel,this.elevation(x,z));}
}
