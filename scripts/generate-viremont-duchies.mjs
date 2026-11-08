import fs from 'node:fs';
import crypto from 'node:crypto';
import pc from 'polygon-clipping';

const source=JSON.parse(fs.readFileSync('src/data/world/political-map.json','utf8'));
const nation=source.countries.find(country=>country.nationId==='aetheria-07');
if(!nation)throw new Error('Viremont not found');
function smooth(points){
  const result=[];
  for(let i=0;i<points.length-1;i++){
    const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];
    for(let j=0;j<8;j++){const t=j/8;result.push([0,1].map(k=>.5*(2*b[k]+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t)));}
  }
  return [...result,points.at(-1)];
}
const north=smooth([[.23,.337],[.272,.337],[.292,.343],[.305,.339],[.320,.335],[.332,.341],[.339,.351],[.355,.339],[.4,.34]]);
const south=smooth([[.23,.426],[.27,.422],[.287,.410],[.304,.408],[.321,.404],[.338,.397],[.354,.398],[.38,.421],[.4,.42]]);
const west=smooth([[.291,.32],[.291,.340],[.291,.345],[.294,.350],[.300,.354],[.294,.358],[.287,.363],[.294,.376],[.290,.39],[.292,.403],[.290,.415],[.294,.45]]);
const east=smooth([[.3353,.32],[.3353,.34],[.3313,.35],[.3353,.363],[.3283,.38],[.3323,.398],[.3283,.412],[.3343,.45]]);
const southernDivide=smooth([[.323,.385],[.323,.405],[.322,.42],[.330,.439],[.328,.457],[.332,.49]]);
const upper=line=>[[[...line,[.5,0],[0,0],line[0]]]];
const left=line=>[[[...line,[0,1],[0,0],line[0]]]];
const n=pc.intersection(nation.geometry,upper(north));
const bottom=pc.difference(nation.geometry,upper(south));
const middle=pc.difference(nation.geometry,n,bottom);
const selv=pc.intersection(middle,left(west));
const erdel=pc.difference(middle,left(east));
const valeris=pc.difference(middle,selv,erdel);
const montelur=pc.intersection(bottom,left(southernDivide));
const thargrund=pc.difference(bottom,montelur);
const records=[
 ['nortar',1,'norte',[.319,.325],'#d4b14b',n],
 ['valeris',2,'centro e corredor fluvial',[.320,.382],'#4f9faf',valeris],
 ['selveria',3,'oeste',[.279,.382],'#4b8152',selv],
 ['erdel',4,'leste e nordeste',[.355,.380],'#9b6ea7',erdel],
 ['montelur',5,'sudoeste',[.307,.426],'#c07853',montelur],
 ['thargrund',6,'sul e sudeste',[.344,.418],'#78849f',thargrund]
].map(([slug,editorialSection,region,labelAnchor,color,geometry])=>({
  id:`viremont-${slug}`,parentNationId:'aetheria-07',editorialSection,region,labelAnchor,color,
  status:'provisional',boundaryBasis:'visual-terrain-draft',
  geometry:geometry.map(polygon=>polygon.map(ring=>ring.map(([x,y])=>[Number(x.toFixed(9)),Number(y.toFixed(9))])))
}));
fs.mkdirSync('src/data/viremont',{recursive:true});
fs.writeFileSync('src/data/viremont/duchies.json',JSON.stringify({schemaVersion:1,parentNationId:'aetheria-07',editorialSource:'viremont_ducados_codex.md',status:'provisional',hydrologyStatus:'painted-river-not-vectorized',plannedHierarchy:{duchies:6,counties:24,baronies:96},duchies:records}));
const snapshotPath='references/viremont-duchies-baseline.json';
if(!fs.existsSync(snapshotPath)){
  const files=['src/data/world/political-map.json','src/data/world/coastlines.json','src/data/world/terrain-revisions.json','src/data/world/polar-expansion.json','src/data/world/isthmus-repair.json','viremont_ducados_codex.md',...fs.readdirSync('public/assets').filter(f=>f.endsWith('.png')).map(f=>`public/assets/${f}`)];
  fs.writeFileSync(snapshotPath,JSON.stringify(Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))));
}
console.log('Saved six asymmetric provisional duchies clipped to the existing national polygon.');
