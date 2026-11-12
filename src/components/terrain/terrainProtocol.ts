import type { TerrainManifest } from '../../geography/terrain/TerrainField';
import type { HydrologySource } from '../../geography/terrain/hydrology';
import type { PaintedTree } from '../../geography/terrain/vegetation';
export type TerrainJob=
 |{kind:'mesh';key:string;x:number;z:number;width:number;depth:number;resolution:number}
 |{kind:'water'|'banks';key:string}
 |{kind:'regional';key:string}
 |{kind:'local';key:string;anchor:[number,number]};
export interface GeometryData {attributes:Record<string,{array:Float32Array;itemSize:number}>;index:Uint16Array|Uint32Array|null;}
export type TerrainJobData=GeometryData|PaintedTree[];
export type TerrainWorkerInput={kind:'init';manifest:TerrainManifest;buffer:ArrayBuffer;hydrology:HydrologySource;city:[number,number]}|{kind:'job';id:number;job:TerrainJob};
export type TerrainWorkerOutput={kind:'ready'}|{kind:'result';id:number;data:TerrainJobData;ms:number}|{kind:'error';id?:number;message:string};
