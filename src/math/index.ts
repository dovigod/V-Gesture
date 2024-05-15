import type { Boundary, ElementBoundary, Point } from '../types'

export function getRawDistance(p1: Point | Boundary, p2: Point | Boundary) {
  return Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2);
}
// returns p1 or p2 depending which one is closer to pivot
export function getCloserDistance(pivot: Point | Boundary, p1: ElementBoundary, p2: ElementBoundary) {
  if (!p1) {
    return p2
  }
  if (!p2) {
    return p1
  }

  const d1 = getRawDistance(pivot, p1.boundary);
  const d2 = getRawDistance(pivot, p2.boundary);

  if (d1 < d2) {
    return p1
  } else {
    return p2
  }
}