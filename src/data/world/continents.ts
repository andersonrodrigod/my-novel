import type { Continent, Point } from '../../types/geography';
import coastlines from './coastlines.json';
import terrainRevisions from './terrain-revisions.json';
import isthmusRepair from './isthmus-repair.json';

// Coordinates are persistent normalized equirectangular positions [longitude, latitude].
// The approved illustration guides these provisional coastlines; no physical distances are asserted.
const c = (id: string, name: string, nationCount: number, biome: Continent['biome'], center: Point, outline: Point[], mountains: Point[][], rivers: Point[][] = [], lakes: Point[][] = []): Continent => ({ id, name, nationCount, biome, center, outline, mountains, rivers, lakes, detailLevel: 0 });

const continentDrafts: Continent[] = [
  c('aetheria','Aetheria',18,'temperate',[.48,.44],[[.17,.32],[.21,.27],[.27,.27],[.30,.22],[.36,.20],[.41,.25],[.46,.20],[.53,.25],[.59,.25],[.64,.29],[.70,.28],[.76,.33],[.79,.39],[.75,.45],[.69,.46],[.65,.52],[.62,.55],[.57,.53],[.54,.58],[.50,.55],[.46,.57],[.42,.53],[.38,.58],[.34,.54],[.30,.57],[.27,.52],[.23,.51],[.21,.45],[.17,.43],[.20,.38]],[[[.39,.35],[.45,.29],[.51,.30],[.57,.34]],[[.27,.45],[.34,.41],[.39,.44]],[[.59,.46],[.65,.41],[.70,.43]]],[[[.49,.32],[.46,.42],[.48,.51]],[[.61,.36],[.60,.44],[.57,.52]]],[[[.66,.35],[.68,.35],[.69,.37],[.67,.38]]]),
  c('varkhonia','Varkhonia',14,'cold',[.17,.23],[[.03,.19],[.07,.15],[.12,.17],[.16,.12],[.22,.13],[.28,.18],[.30,.24],[.27,.29],[.24,.28],[.20,.34],[.17,.32],[.13,.36],[.10,.30],[.06,.29],[.04,.25]],[[[.09,.22],[.15,.16],[.22,.20]]],[[[.20,.22],[.20,.28],[.17,.31]]]),
  c('solmeria','Solméria',16,'arid',[.79,.55],[[.70,.48],[.74,.45],[.80,.43],[.84,.46],[.89,.47],[.95,.51],[.97,.57],[.92,.62],[.89,.66],[.82,.64],[.78,.69],[.73,.65],[.70,.60],[.67,.55]],[[[.77,.52],[.83,.48],[.87,.53]],[[.74,.60],[.80,.62],[.85,.59]]],[[[.83,.59],[.82,.65],[.78,.68]]]),
  c('eryndor','Eryndor',12,'cold',[.64,.17],[[.47,.13],[.52,.09],[.56,.10],[.60,.05],[.64,.08],[.69,.04],[.74,.09],[.77,.15],[.75,.20],[.70,.24],[.64,.23],[.60,.25],[.55,.22],[.50,.21]],[[[.58,.14],[.63,.08],[.68,.14]],[[.65,.18],[.70,.13],[.74,.16]]],[[[.60,.18],[.58,.21],[.55,.21]]]),
  c('drakmoria','Drakmória',11,'volcanic',[.17,.59],[[.04,.49],[.10,.45],[.16,.47],[.22,.44],[.27,.49],[.30,.54],[.27,.59],[.30,.66],[.28,.73],[.22,.76],[.18,.71],[.14,.70],[.10,.65],[.06,.63],[.03,.57]],[[[.08,.54],[.13,.48],[.18,.54]],[[.18,.62],[.23,.56],[.27,.62]]],[[[.23,.62],[.22,.68],[.20,.72]]]),
  c('namaris','Namaris',15,'tropical',[.47,.75],[[.31,.72],[.36,.68],[.42,.70],[.47,.66],[.52,.69],[.57,.70],[.62,.73],[.60,.78],[.55,.81],[.51,.85],[.46,.82],[.42,.86],[.38,.81],[.33,.80]],[[[.42,.73],[.48,.70],[.54,.74]]],[[[.49,.73],[.47,.79],[.44,.83]]],[[[.53,.77],[.55,.78],[.54,.80],[.52,.79]]]),
  c('thalzor',"Thal'Zor",8,'mystic',[.89,.22],[[.82,.15],[.87,.10],[.92,.12],[.97,.17],[.99,.22],[.96,.28],[.93,.32],[.88,.29],[.83,.31],[.80,.25]],[[[.86,.20],[.91,.15],[.96,.21]]])
];

const polygons=coastlines as unknown as Record<string,Point[][]>;
const revisions=terrainRevisions as unknown as Record<string,Partial<Pick<Continent,'biome'|'forestDensity'|'mountains'|'rivers'|'center'>>>;
export const continents: Continent[] = continentDrafts.map(continent=>{
  const revised={...continent,...revisions[continent.id],outline:polygons[continent.id][0],islands:polygons[continent.id].slice(1)};
  return continent.id==='drakmoria'?{...revised,rivers:[...revised.rivers,isthmusRepair.tributary.path.map(([x,y]):Point=>[x,y])],lakes:[...revised.lakes,isthmusRepair.lake.outline.map(([x,y]):Point=>[x,y])]}:revised;
});

export const oceans = [
  { name: 'Oceano Boreal', position: [.18,.06] as Point },
  { name: 'Oceano de Varkas', position: [.06,.40] as Point },
  { name: 'Oceano Oriental', position: [.91,.41] as Point },
  { name: 'Mar de Cristal', position: [.51,.62] as Point },
  { name: 'Oceano Austral', position: [.61,.91] as Point },
];
