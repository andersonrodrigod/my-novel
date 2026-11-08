import { Vector3 } from 'three';
import type { Point } from '../types/geography';

export const WORLD_RADIUS = 1.8; // Display units only, not a canonical physical radius.
export function mapToSphere([x,y]: Point, radius = WORLD_RADIUS): Vector3 {
  const longitude = x * Math.PI * 2;
  const latitude = (.5 - y) * Math.PI;
  return new Vector3(-radius * Math.cos(latitude) * Math.cos(longitude), radius * Math.sin(latitude), radius * Math.cos(latitude) * Math.sin(longitude));
}
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > point[1]) !== (yj > point[1]) && point[0] < ((xj-xi)*(point[1]-yi))/(yj-yi)+xi) inside = !inside;
  }
  return inside;
}
