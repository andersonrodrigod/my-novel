import { CanvasTexture, SRGBColorSpace } from 'three';
import { countryTerritories } from '../data/world/politicalMap';

export function politicalTexture(selectedId:string|null){
  const canvas=document.createElement('canvas');canvas.width=4096;canvas.height=2048;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D indisponível');
  for(const country of countryTerritories){
    for(const polygon of country.geometry){
      ctx.beginPath();
      for(const ring of polygon){ring.forEach(([x,y],i)=>{i?ctx.lineTo(x*canvas.width,y*canvas.height):ctx.moveTo(x*canvas.width,y*canvas.height);});ctx.closePath();}
      ctx.fillStyle=country.nationId===selectedId?'rgba(250,216,127,.24)':'rgba(242,223,166,.025)';ctx.fill('evenodd');
      ctx.strokeStyle='rgba(247,230,188,.8)';ctx.lineWidth=3.5;ctx.stroke();
      ctx.strokeStyle='rgba(81,56,32,.85)';ctx.lineWidth=1.4;ctx.setLineDash([7,3]);ctx.stroke();ctx.setLineDash([]);
    }
  }
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.anisotropy=8;return texture;
}
