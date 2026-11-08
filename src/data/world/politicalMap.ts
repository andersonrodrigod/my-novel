import source from './political-map.json';
import type { CountryTerritory, Point } from '../../types/geography';
import { pointInPolygon } from '../../geography/coordinates';

export const countryTerritories=source.countries as unknown as CountryTerritory[];
export function countryAt(point:Point){return countryTerritories.find(country=>country.geometry.some(polygon=>pointInPolygon(point,polygon[0])&&!polygon.slice(1).some(hole=>pointInPolygon(point,hole))));}
