import { CanvasTexture, SRGBColorSpace } from 'three';
import { continents } from '../data/world/continents';
import { pointInPolygon } from '../geography/coordinates';
import type { ClimateRegion, Continent, LayerKey, Point } from '../types/geography';
import { riverBanks } from './riverShape';
import polarExpansion from '../data/world/polar-expansion.json';
const climateRegions=polarExpansion.climateRegions as unknown as ClimateRegion[];
const climateAt=(id:string,p:Point)=>climateRegions.find(region=>region.continentId===id&&region.geometry.some(poly=>pointInPolygon(p,poly[0])&&!poly.slice(1).some(hole=>pointInPolygon(p,hole))))?.climate;

const W=4096,H=2048;
let terrainSymbols: HTMLImageElement | null=null;
export async function loadTerrainSymbols(){const img=new Image();img.src='/assets/terrain-symbols.png';await img.decode();terrainSymbols=img;}
const xy=([x,y]:Point):[number,number]=>[x*W,y*H];
const rand=(seed:number)=>{let n=seed;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};};
function path(ctx:CanvasRenderingContext2D,points:Point[],close=true){ctx.beginPath();points.forEach((p,i)=>{const [x,y]=xy(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});if(close)ctx.closePath();}

function mountain(ctx:CanvasRenderingContext2D,x:number,y:number,h:number,r:()=>number,volcanic:boolean){
  if(terrainSymbols){const half=terrainSymbols.width/2;ctx.drawImage(terrainSymbols,volcanic?0:half,volcanic?half:0,half,half,x-h,y-h*1.5,h*2,h*2);return;}
  const w=h*(.65+r()*.25),peak=x+(r()-.5)*w*.4;
  ctx.beginPath();ctx.moveTo(x-w,y);ctx.lineTo(x-w*.55,y-h*.30);ctx.lineTo(peak,y-h);ctx.lineTo(x+w*.6,y-h*.24);ctx.lineTo(x+w,y);ctx.closePath();
  const g=ctx.createLinearGradient(x-w,y-h,x+w,y);g.addColorStop(0,'#7d8172');g.addColorStop(.48,'#d5cba3');g.addColorStop(.51,'#747567');g.addColorStop(1,'#a59973');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#4b5a4e';ctx.lineWidth=1.1;ctx.stroke();
  ctx.beginPath();ctx.moveTo(peak,y-h);ctx.lineTo(peak-6,y-h*.65);ctx.lineTo(peak-1,y-h*.72);ctx.lineTo(peak+6,y-h*.55);ctx.lineTo(peak+8,y-h*.66);ctx.lineTo(peak+14,y-h*.48);ctx.lineTo(peak+5,y-h*.82);ctx.closePath();ctx.fillStyle=volcanic?'#d8b095':'#f0e8cd';ctx.fill();
  ctx.strokeStyle='#5b6252';ctx.lineWidth=.65;
  for(let i=0;i<5;i++){const t=.2+i*.12;ctx.beginPath();ctx.moveTo(peak+(w*.65)*t,y-h+h*t);ctx.lineTo(x+w*(.35+t*.45),y-h+h*t+8);ctx.stroke();}
}
function tree(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,r:()=>number){
  if(terrainSymbols){const half=terrainSymbols.width/2;ctx.drawImage(terrainSymbols,0,0,half,half,x-s*3,y-s*5,s*6,s*6);return;}
  ctx.fillStyle='rgba(31,61,42,.16)';ctx.beginPath();ctx.ellipse(x+2,y+2,s*.85,s*.3,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=r()>.5?'#365d3c':'#476a3e';ctx.strokeStyle='#284b36';ctx.lineWidth=.6;
  ctx.beginPath();ctx.moveTo(x,y-s*1.9);ctx.lineTo(x-s*.5,y-s*.8);ctx.lineTo(x-s*.25,y-s*.8);ctx.lineTo(x-s*.8,y);ctx.quadraticCurveTo(x,y+s*.25,x+s*.8,y);ctx.lineTo(x+s*.25,y-s*.8);ctx.lineTo(x+s*.5,y-s*.8);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#7e9353';ctx.beginPath();ctx.moveTo(x-.5,y-s*1.5);ctx.lineTo(x-s*.4,y-s*.3);ctx.stroke();
}
function terrain(ctx:CanvasRenderingContext2D,c:Continent,layers:Record<LayerKey,boolean>,r:()=>number){
  const arid=c.biome==='arid',cold=c.biome==='cold',volcanic=c.biome==='volcanic';
  path(ctx,c.outline);ctx.fillStyle=layers.biomes?(arid?'#d6ba78':volcanic?'#a8a16b':cold?'#b6bd8a':'#b3bd70'):'#cfbf91';ctx.fill();
  ctx.save();path(ctx,c.outline);ctx.clip();
  for(let i=0;i<1200;i++){const p:Point=[r(),r()];if(!pointInPolygon(p,c.outline))continue;const [x,y]=xy(p),size=12+r()*70;const gradient=ctx.createRadialGradient(x,y,0,x,y,size);gradient.addColorStop(0,arid?'#b58c4938':cold?'#e6dfb14a':'#66834732');gradient.addColorStop(1,'#a5b06b00');ctx.fillStyle=gradient;ctx.fillRect(x-size,y-size,size*2,size*2);}
  if(layers.biomes){
    for(const region of climateRegions.filter(region=>region.continentId===c.id)){
      ctx.beginPath();for(const polygon of region.geometry)for(const ring of polygon){ring.forEach((p,i)=>{const [x,y]=xy(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}
      ctx.fillStyle=region.climate==='snow'?'#e4e9e5':'#aeb397';ctx.fill('evenodd');
    }
    for(let i=0;i<13000;i++){const p:Point=[r(),r()];if(!pointInPolygon(p,c.outline))continue;const [x,y]=xy(p);const band=Math.sin(p[0]*76+Math.cos(p[1]*63)*2)+Math.sin(p[1]*81);const climate=climateAt(c.id,p);
    if(!arid&&climate!=='snow'&&band>.25&&r()<(c.forestDensity??1)*(climate==='tundra'?.25:1))tree(ctx,x,y,3+r()*3,r);
    if(arid&&r()>.65){ctx.strokeStyle='#a7834a70';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,7+r()*12,2,0,Math.PI,Math.PI*2);ctx.stroke();}
  }}
  if(layers.relief)for(const ridge of c.mountains){for(let i=0;i<ridge.length-1;i++){const [x1,y1]=xy(ridge[i]),[x2,y2]=xy(ridge[i+1]);const count=Math.ceil(Math.hypot(x2-x1,y2-y1)/15);for(let j=0;j<count;j++){const t=j/count,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;mountain(ctx,x+(r()-.5)*9,y+(r()-.5)*13,15+r()*27,r,volcanic);}}}
  if(layers.rivers){
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#598b96';
    for(const river of c.rivers){
      const points=river.map(xy);
      if(c.id==='thalzor'||c.id==='solmeria'){
        const banks=riverBanks(points);ctx.beginPath();banks.forEach(([x,y],i)=>{i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fillStyle='#4d8fc0';ctx.fill();continue;
      }
      for(let i=1;i<points.length;i++){
        const a=points[i-1],b=points[i];
        ctx.beginPath();ctx.moveTo(...a);
        ctx.bezierCurveTo(a[0]+(b[0]-a[0])*.65,a[1]+(b[1]-a[1])*.25,a[0]+(b[0]-a[0])*.25,a[1]+(b[1]-a[1])*.7,...b);
        ctx.lineWidth=.8+1.1*i/(points.length-1);ctx.stroke();
      }
    }
    for(const lake of c.lakes){path(ctx,lake);ctx.fillStyle='#598b96';ctx.fill();}
  }
  ctx.restore();path(ctx,c.outline);ctx.strokeStyle='#e0cb8b';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#4c6653';ctx.lineWidth=1;ctx.stroke();
  if(layers.borders){path(ctx,c.outline);ctx.strokeStyle='#f7e7a3';ctx.lineWidth=4;ctx.stroke();}
}
export function makeMapTexture(layers:Record<LayerKey,boolean>):CanvasTexture{
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D indisponível');const r=rand(1937);
  const sea=ctx.createLinearGradient(0,0,0,H);sea.addColorStop(0,'#164653');sea.addColorStop(.45,'#17647a');sea.addColorStop(1,'#154d60');ctx.fillStyle=sea;ctx.fillRect(0,0,W,H);
  for(const c of continents){for(let i=5;i>0;i--){path(ctx,c.outline);ctx.strokeStyle=`rgba(126,180,171,${.05+i*.009})`;ctx.lineWidth=i*9;ctx.stroke();}}
  for(let i=0;i<85000;i++){ctx.fillStyle=r()>.5?'rgba(230,225,187,.045)':'rgba(5,35,44,.06)';ctx.fillRect(r()*W,r()*H,1+r()*3,1+r()*2);}
  continents.forEach(c=>terrain(ctx,c,layers,r));const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.anisotropy=8;return texture;
}
