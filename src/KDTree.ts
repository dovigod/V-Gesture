import { VGestureError } from './error';
import { type Point, type Vector2D, type Vector3D, type ElementBoundary, ERROR_TYPE, Boundary } from './types'
import { getRawDistance, getCloserDistance } from './utils/math'

const MAXIMUM_SUPPORTED_DIMENSION = 3;
export class KDTree {
  id: string;
  data: ElementBoundary[];
  root: ElementBoundary
  left: KDTree | null = null;
  right: KDTree | null = null;
  size: number;
  depth: number;
  axis: number;
  dimension: number;
  m: number;

  // for better DX purpose
  [Symbol.iterator]() {
    let index = -1;
    const data = this.data;
    return {
      next: () => ({ value: data[++index], done: index >= data.length })
    };
  };


  constructor(data: ElementBoundary[], dimension?: number);
  constructor(data: ElementBoundary[], dimension = 2, _depth = 0) {

    if (dimension > MAXIMUM_SUPPORTED_DIMENSION) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'KDTree.constructor', 'Unable to construct K-d tree. Unsupported Dimension');
    }

    this.data = data;
    this.depth = _depth;
    this.dimension = dimension;
    this.axis = _depth % dimension;
    this.data = sort(this.data, this.axis);
    this.size = this.data.length;
    this.m = Math.floor(data.length / 2);
    this.root = this.data[this.m];
    this.id = this.root.id;


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
      if (pivot[0] >= closestNode.boundary[0] - closestNode.boundary[2] &&
        pivot[0] <= closestNode.boundary[0] + closestNode.boundary[2] &&
        pivot[1] >= closestNode.boundary[1] - closestNode.boundary[3] &&
        pivot[1] <= closestNode.boundary[1] + closestNode.boundary[3]
      ) {
        return closestNode.id
      }
    }
    return null
  }

  searchClosest(pivot: Vector2D | Vector3D) {
    return this._search(this, pivot) as ElementBoundary
  }

  private _search(self: KDTree, pivot: Point): ElementBoundary | null {
    if (!self) {
      return null;
    }
    const axis = this.axis;

    let nextSubTree: KDTree | null = null;
    let alterateSubTree: KDTree | null = null;

    const rootAxisValue = self.root.boundary[axis];

    if (pivot[axis] < rootAxisValue) {
      nextSubTree = self.left;
      alterateSubTree = self.right
    } else {
      nextSubTree = self.right;
      alterateSubTree = self.left
    }

    let closest = getCloserDistance(pivot, nextSubTree?._search(nextSubTree!, pivot)!, self.root)

    //search point and spliting point
    if (getRawDistance(pivot, closest.boundary) > Math.abs(pivot[axis] - rootAxisValue)) {
      closest = getCloserDistance(pivot, alterateSubTree?._search(alterateSubTree!, pivot)!, closest)
    }
    return closest as ElementBoundary
  }


}

function sort(data: ElementBoundary[], axis: number) {
  if (axis <= MAXIMUM_SUPPORTED_DIMENSION) {
    return data.sort((b1: ElementBoundary, b2: ElementBoundary) => {
      return b1.boundary[axis] - b2.boundary[axis]
    });
  }


  throw new VGestureError(ERROR_TYPE.VALIDATION, 'KDTree.sort', `UnSupported axis: ${axis}`)
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
