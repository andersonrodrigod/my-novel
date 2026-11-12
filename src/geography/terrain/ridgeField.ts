interface RidgeLine { id:string; width:number; points:number[][]; }
interface ValleyLine { id:string; width:number; depth:number; points:number[][]; }
export interface RidgeSource { ridges:RidgeLine[]; valleys:ValleyLine[]; }
interface Registration { bounds:number[]; width:number; height:number; }
interface CrestSegment { ax:number;az:number;bx:number;bz:number;ah:number;bh:number;width:number; }
interface CutSegment { ax:number;az:number;bx:number;bz:number;width:number;depth:number; }
const noise=(x:number,z:number)=>{
 const hash=(a:number,b:number)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v);};
 const a=Math.floor(x),b=Math.floor(z),u=x-a,v=z-b,s=u*u*(3-2*u),t=v*v*(3-2*v);
 return (hash(a,b)*(1-s)+hash(a+1,b)*s)*(1-t)+(hash(a,b+1)*(1-s)+hash(a+1,b+1)*s)*t;
};
// Triangular interpolation gives broad planar fracture faces instead of rounded bumps.
const fracture=(x:number,z:number)=>{
 const a=Math.floor(x),b=Math.floor(z),u=x-a,v=z-b;
 const hash=(i:number,j:number)=>{const n=Math.sin(i*91.7+j*173.3)*48371.9;return n-Math.floor(n);};
 const h00=hash(a,b),h11=hash(a+1,b+1);
 return u>v?h00*(1-u)+hash(a+1,b)*(u-v)+h11*v:h00*(1-v)+hash(a,b+1)*(v-u)+h11*u;
};
function closest(x:number,z:number,s:{ax:number;az:number;bx:number;bz:number}){
 const dx=s.bx-s.ax,dz=s.bz-s.az,t=Math.max(0,Math.min(1,((x-s.ax)*dx+(z-s.az)*dz)/(dx*dx+dz*dz)));
 return {t,distance:Math.hypot(x-s.ax-dx*t,z-s.az-dz*t)};
}

/** An authored crest network supplies the mountain mass; noise only adds rock-scale detail. */
export class RidgeField {
 private readonly crests:CrestSegment[]=[];
 private readonly cuts:CutSegment[]=[];
 constructor(source:RidgeSource,registration:Registration){
  const local=([u,v]:number[])=>{const [u0,v0,u1,v1]=registration.bounds;return [((u-u0)/(u1-u0)-.5)*registration.width,((v-v0)/(v1-v0)-.5)*registration.height];};
  for(const ridge of source.ridges)for(let i=0;i<ridge.points.length-1;i++){
   const a=ridge.points[i],b=ridge.points[i+1],[ax,az]=local(a),[bx,bz]=local(b);
   this.crests.push({ax,az,bx,bz,ah:a[2],bh:b[2],width:ridge.width});
  }
  for(const valley of source.valleys)for(let i=0;i<valley.points.length-1;i++){
   const [ax,az]=local(valley.points[i]),[bx,bz]=local(valley.points[i+1]);
   this.cuts.push({ax,az,bx,bz,width:valley.width,depth:valley.depth});
  }
 }
 height(x:number,z:number){
  const wx=x+(noise(x/360,z/360)-.5)*125+(noise(x/125,z/125)-.5)*26;
  const wz=z+(noise(x/330+31,z/330-17)-.5)*95;
  let mass=0,along=0,across=0;
  for(const segment of this.crests){
   const {t,distance}=closest(wx,wz,segment),crest=segment.ah+(segment.bh-segment.ah)*(t*t*(3-2*t));
   const localWidth=segment.width*(1.12+noise(x/230,z/230)*.40);
   const d=distance/localWidth;
   // A narrow angular crest grows out of a much broader, gently curved talus skirt.
   const profile=.56*Math.exp(-d*d*.62)+.44*Math.pow(Math.max(0,1-d),1.18);
   const value=crest*.82*profile;
   if(value>mass){mass=value;along=t*Math.hypot(segment.bx-segment.ax,segment.bz-segment.az);across=d;}
  }
  let incision=0;
  for(const segment of this.cuts){const {distance}=closest(x,z,segment);incision=Math.max(incision,segment.depth*Math.exp(-((distance/segment.width)**2)));}
  const flank=Math.min(1,across*4)*Math.exp(-across*.65);
  const gullies=Math.pow(.5+.5*Math.sin(along/43+noise(x/180,z/180)*8+across*2),4)*mass*.15*flank;
  const fx=x*.86+z*.51,fz=z*.86-x*.51;
  const details=(fracture(fx/135,fz/135)-.5)*Math.min(125,mass*.21)+(fracture(fx/49,fz/49)-.5)*Math.min(35,mass*.06);
  return Math.max(0,mass-incision*Math.min(1,mass/250)-gullies+details);
 }
}
