import { CanvasTexture, SRGBColorSpace } from 'three';
import { duchies } from '../data/viremont/duchies';
export const VIREMONT_BOUNDS=[.255,.30,.382,.483] as const;
export function makeDuchyTexture(active:string|null,hover:string|null){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1536;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D indisponível');
  const [x1,y1,x2,y2]=VIREMONT_BOUNDS;
  for(const duchy of duchies){
    ctx.beginPath();for(const polygon of duchy.geometry)for(const ring of polygon){ring.forEach(([x,y],i)=>{const px=(x-x1)/(x2-x1)*canvas.width,py=(y-y1)/(y2-y1)*canvas.height;i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.closePath();}
    ctx.globalAlpha=active===duchy.id ? .14 : hover===duchy.id ? .13 : .045;ctx.fillStyle=duchy.color;ctx.fill('evenodd');ctx.globalAlpha=1;
    ctx.strokeStyle='#463c2a';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle=duchy.color;ctx.lineWidth=3.5;ctx.stroke();ctx.strokeStyle='#fff0c8';ctx.lineWidth=.8;ctx.stroke();
  }
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.anisotropy=8;return texture;
}
