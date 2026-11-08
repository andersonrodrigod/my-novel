export type Point = readonly [number, number];
export type Biome = 'temperate' | 'cold' | 'arid' | 'volcanic' | 'tropical' | 'mystic';
export interface Continent {
  id: string;
  name: string;
  nationCount: number;
  biome: Biome;
  forestDensity?: number;
  center: Point;
  outline: Point[];
  islands?: Point[][];
  mountains: Point[][];
  rivers: Point[][];
  lakes: Point[][];
  detailLevel: 0;
}
export interface Nation { id: string; name: string; continentId: string; }
export interface ClimateRegion { id:string; continentId:string; climate:'snow'|'tundra'; geometry:Point[][][]; }
export interface CountryTerritory {
  nationId:string;
  continentId:string;
  citySite:Point;
  cityClearance:number;
  siteSuitability:number;
  geometry:Point[][][];
}
export interface Duchy {
  id:string; name:string; parentNationId:string; region:string; description:string; economy:string; history:string;
  status:'provisional'; boundaryBasis:string; geometry:Point[][][]; labelAnchor:Point; color:string;
}
export interface GeographicFocus { id:string; center:Point; extent?:Point; level:'nation'|'duchy'; }
export interface DetailReference { id:string; parentId:string; level:'county'|'barony'|'settlement'; geometrySource?:string; }
export type LayerKey = 'names' | 'relief' | 'biomes' | 'rivers' | 'borders' | 'countries' | 'cities' | 'nationNames' | 'duchies';
