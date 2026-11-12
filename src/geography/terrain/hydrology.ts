export interface RiverCourse {
  id:string;
  kind:'river'|'stream'|'spring';
  joins:string|null;
  // Map coordinates, illustrative surface elevation and half-width in local units.
  points:number[][];
}
export interface LakeSite {
  id:string; duchyId:string; center:number[]; radii:number[]; level:number;
  inlet:string; outlet:string;
}
export interface OpenPlain { id:string; duchyId:string; center:number[]; radius:number; level:number; }
export interface HydrologySource { courses:RiverCourse[]; lakes:LakeSite[]; plains:OpenPlain[]; }
export interface WaterSample { distance:number; level:number; width:number; depth:number; }
export interface RiverStation { x:number; z:number; level:number; width:number; leftWidth:number; rightWidth:number; }
interface Segment { a:RiverStation; b:RiverStation; }
interface LocalLake { site:LakeSite; x:number; z:number; rx:number; rz:number; }
interface Registration { bounds:number[]; width:number; height:number; }
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
const cubic=(a:number,b:number,c:number,d:number,t:number)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);

/** One persistent geographic network is shared by all six duchies and all LODs. */
export class TerrainHydrology {
  readonly courses:{source:RiverCourse;stations:RiverStation[]}[];
  readonly lakes:LocalLake[];
  readonly plains:{source:OpenPlain;x:number;z:number}[];
  private readonly cells=new Map<string,Segment[]>();
  private readonly cellSize=256;

  constructor(source:HydrologySource,registration:Registration){
    const local=([u,v]:number[])=>{
      const [u0,v0,u1,v1]=registration.bounds;
      return [((u-u0)/(u1-u0)-.5)*registration.width,((v-v0)/(v1-v0)-.5)*registration.height];
    };
    const station=(x:number,z:number,level:number,baseWidth:number):RiverStation=>{
      const envelope=1+.055*Math.sin(x*.025+z*.019)+.025*Math.sin(x*.077-z*.049);
      const width=baseWidth*envelope,variation=baseWidth>35?.19:.10;
      return {x,z,level,width,leftWidth:width*(.94+variation*Math.sin(x*.012+z*.017)),rightWidth:width*(1.03+variation*Math.cos(x*.019-z*.011))};
    };
    this.courses=source.courses.map(course=>{
      const controls=course.points.map(p=>{const [x,z]=local(p);return {x,z,level:p[2],width:p[3]};});
      const stations:RiverStation[]=[];
      for(let i=0;i<controls.length-1;i++){
        const a=controls[Math.max(0,i-1)],b=controls[i],c=controls[i+1],d=controls[Math.min(controls.length-1,i+2)];
        const steps=Math.max(4,Math.ceil(Math.hypot(c.x-b.x,c.z-b.z)/14));
        for(let j=0;j<steps;j++){
          const t=j/steps;
          const x=cubic(a.x,b.x,c.x,d.x,t),z=cubic(a.z,b.z,c.z,d.z,t);
          stations.push(station(x,z,b.level+(c.level-b.level)*t,b.width+(c.width-b.width)*t));
        }
      }
      const end=controls[controls.length-1];stations.push(station(end.x,end.z,end.level,end.width));
      for(let i=0;i<stations.length-1;i++){
        const a=stations[i],b=stations[i+1],pad=Math.max(a.leftWidth,a.rightWidth,b.leftWidth,b.rightWidth)+225;
        for(let z=Math.floor((Math.min(a.z,b.z)-pad)/this.cellSize);z<=Math.floor((Math.max(a.z,b.z)+pad)/this.cellSize);z++)
          for(let x=Math.floor((Math.min(a.x,b.x)-pad)/this.cellSize);x<=Math.floor((Math.max(a.x,b.x)+pad)/this.cellSize);x++){
            const key=`${x},${z}`,list=this.cells.get(key)??[];list.push({a,b});this.cells.set(key,list);
          }
      }
      return {source:course,stations};
    });
    this.lakes=source.lakes.map(site=>{
      const [x,z]=local(site.center),[ex,ez]=local([site.center[0]+site.radii[0],site.center[1]+site.radii[1]]);
      return {site,x,z,rx:ex-x,rz:ez-z};
    });
    this.plains=source.plains.map(p=>{const [x,z]=local(p.center);return {source:p,x,z};});
  }

  lakeRadius(angle:number,index:number){return 1+.17*Math.sin(angle*3+index*1.7)+.095*Math.cos(angle*5-index)+.03*Math.sin(angle*7+index);}

  sample(x:number,z:number):WaterSample {
    let best:WaterSample={distance:Infinity,level:0,width:0,depth:0};
    for(const {a,b} of this.cells.get(`${Math.floor(x/this.cellSize)},${Math.floor(z/this.cellSize)}`)??[]){
      const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1));
      const side=(x-a.x-t*dx)*(-dz)+(z-a.z-t*dz)*dx;
      const width=side>=0?a.leftWidth+(b.leftWidth-a.leftWidth)*t:a.rightWidth+(b.rightWidth-a.rightWidth)*t;
      const distance=Math.hypot(x-a.x-t*dx,z-a.z-t*dz)-width;
      if(distance<best.distance)best={distance,level:a.level+(b.level-a.level)*t,width,depth:clamp(-distance/Math.max(1,width))};
    }
    this.lakes.forEach(({site,x:cx,z:cz,rx,rz},index)=>{
      const nx=(x-cx)/rx,nz=(z-cz)/rz,r=this.lakeRadius(Math.atan2(nz,nx),index);
      const distance=(Math.hypot(nx,nz)-r)*Math.min(rx,rz);
      if(distance<best.distance)best={distance,level:site.level,width:Math.min(rx,rz),depth:clamp(-distance/Math.min(rx,rz))};
    });
    return best;
  }

  terrain(x:number,z:number,base:number){
    let height=base;
    for(const {source,x:cx,z:cz} of this.plains){
      const t=ease((Math.hypot(x-cx,z-cz)-source.radius*.55)/(source.radius*.55));
      height=source.level*(1-t)+height*t;
    }
    const water=this.sample(x,z);
    if(water.distance<0)return water.level-3-water.depth*8;
    if(water.distance<220){
      // A submerged shoulder keeps coarse terrain triangles behind the smooth shoreline.
      const bank=water.level-2+Math.max(0,Math.min(water.distance,65)-12)*.065;
      const t=ease((water.distance-18)/202);height=bank*(1-t)+height*t;
      // Retain the authored dry terraces while broadening the surrounding valley.
      for(const {source,x:cx,z:cz} of this.plains){
        const weight=(1-ease((Math.hypot(x-cx,z-cz)-source.radius*.55)/(source.radius*.55)))*ease((water.distance-25)/70);
        height=source.level*weight+height*(1-weight);
      }
    }
    return height;
  }

}
