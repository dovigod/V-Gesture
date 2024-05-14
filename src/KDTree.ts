import { Boundary, Point, Vector2D, Vector3D } from './types'
import { getRawDistance, getCloserDistance } from './math'


const MAXIMUM_SUPPORTED_DIMENSION = 3;
export class KDTree {
  data: Boundary[];
  root: Boundary
  left: KDTree | null = null;
  right: KDTree | null = null;
  size: number;
  depth: number;
  axis: number;
  dimension: number;
  m: number;


  constructor(data: Boundary[], dimension = 2, depth = 0) {

    if (dimension > MAXIMUM_SUPPORTED_DIMENSION) {
      throw new Error('Unable to construct K-d tree. Unsupported Dimension');
    }
    this.depth = depth;
    this.dimension = dimension;
    this.axis = depth % dimension;
    this.data = sort(data, this.axis);
    this.size = data.length;
    this.m = Math.floor(data.length / 2);
    this.root = this.data[this.m];
    if (this.m > 0) {
      this.left = new KDTree(this.data.slice(0, this.m), this.depth + 1)
    }
    if (this.size - (this.m + 1) > 0) {
      this.right = new KDTree(this.data.slice(this.m + 1), this.depth + 1)
    }
  }

  emit(pivot: Vector2D | Vector3D) {
    const closestNode = this.searchClosest(pivot)

    if (closestNode) {
      if (pivot[0] >= closestNode[0] - closestNode[2] &&
        pivot[0] <= closestNode[0] + closestNode[2] &&
        pivot[1] >= closestNode[1] - closestNode[3] &&
        pivot[1] <= closestNode[1] + closestNode[3]
      ) {
        return closestNode[4]
      }
    }
    return null
  }

  searchClosest(pivot: Vector2D | Vector3D) {
    return this._search(this, pivot) as Boundary;
  }

  private _search(self: KDTree, pivot: Point): Boundary | null {
    if (!self) {
      return null;
    }

    const axis = this.axis;

    let nextSubTree: KDTree | null = null;
    let alterateSubTree: KDTree | null = null;

    if (pivot[axis] < self.root[axis]) {
      nextSubTree = self.left;
      alterateSubTree = self.right
    } else {
      nextSubTree = self.right;
      alterateSubTree = self.left
    }

    let closest = getCloserDistance(pivot, nextSubTree?._search(nextSubTree!, pivot)!, self.root)

    //search point and spliting point
    if (getRawDistance(pivot, closest) > Math.abs(pivot[axis] - self.root[axis])) {
      closest = getCloserDistance(pivot, alterateSubTree?._search(alterateSubTree!, pivot)!, closest)
    }
    return closest as Boundary
  }
}


function sort(data: Boundary[], axis: number) {
  if (axis <= MAXIMUM_SUPPORTED_DIMENSION) {
    return data.sort((b1: Boundary, b2: Boundary) => {
      return b1[axis] - b2[axis]
    });
  }


  throw new Error(`UnSupported axis: ${axis}`)
}


// const nodes = [
//   [300, 100, 50, 50], [600, 100, 50, 50], [900, 100, 50, 50],
//   [300, 400, 50, 50], [600, 400, 50, 50], [900, 400, 50, 50],
//   [300, 800, 50, 50], [600, 800, 50, 50], [900, 800, 50, 50]
// ] as Boundary2D[]

// const nodes = [
//   // [40, 70, 50, 50], [70, 130, 50, 50], [90, 40, 50, 50],
//   // [110, 100, 50, 50], [140, 110, 50, 50], [160, 100, 50, 50],
//   // [300, 800, 50, 50], [600, 800, 50, 50], [900, 800, 50, 50]
// ] as Boundary2D[]

// const tree = new KDTree(nodes)

