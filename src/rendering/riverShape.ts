import type { Point } from '../types/geography';

/** Filled water surface with irregular banks; input points run from source to mouth. */
export function riverBanks(points: Point[]): Point[] {
  if(points.length<2)return [];
  const samples: Point[]=[];
  for(let segment=0;segment<points.length-1;segment++){
    const a=points[Math.max(0,segment-1)],b=points[segment],c=points[segment+1],d=points[Math.min(points.length-1,segment+2)];
    for(let step=0;step<20;step++){
      const t=step/20,t2=t*t,t3=t2*t;
      const interpolate=(axis:0|1)=>.5*(2*b[axis]+(-a[axis]+c[axis])*t+(2*a[axis]-5*b[axis]+4*c[axis]-d[axis])*t2+(-a[axis]+3*b[axis]-3*c[axis]+d[axis])*t3);
      samples.push([interpolate(0),interpolate(1)]);
    }
  }
  samples.push(points[points.length-1]);
  const left:Point[]=[],right:Point[]=[];
  samples.forEach((p,i)=>{
    const previous=samples[Math.max(0,i-1)],next=samples[Math.min(samples.length-1,i+1)];
    const dx=next[0]-previous[0],dy=next[1]-previous[1],length=Math.hypot(dx,dy)||1,t=i/(samples.length-1);
    const width=(.55+2.8*t)*(.95+.27*Math.sin(i*.37)+.16*Math.sin(i*.91));
    const nx=-dy/length,ny=dx/length;
    left.push([p[0]+nx*width,p[1]+ny*width]);
    right.push([p[0]-nx*width*(1+.15*Math.sin(i*.63)),p[1]-ny*width*(1+.15*Math.sin(i*.63))]);
  });
  return [...left,...right.reverse()];
}
