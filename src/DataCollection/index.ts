import { VGestureError } from '../error';
import { type Point, type Vector2D, type Vector3D, type ElementBoundary, ERROR_TYPE, Boundary } from '../types'
import { MAXIMUM_SUPPORTED_DIMENSION } from '../constant';
import { KDTree } from '../KDTree';


export class DataDomain {

  originalData: ElementBoundary[];
  size: number;
  dimension: number;
  searchTree: KDTree | null = null;
  baseCoord = [document.documentElement.scrollLeft, document.documentElement.scrollTop];

  // for better DX purpose
  [Symbol.iterator]() {
    let index = -1;
    const data = this.originalData;
    return {
      next: () => ({ value: data[++index], done: index >= data.length })
    };
  };

  constructor(data: ElementBoundary[], dimension?: number);
  constructor(data: ElementBoundary[], dimension = 2, _depth = 0) {
    if (dimension > MAXIMUM_SUPPORTED_DIMENSION) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'DataDomain.constructor', 'Unable to construct DataDomain. Unsupported Dimension');
    }
    this.originalData = data;
    this.dimension = dimension;
    this.originalData = data;
    this.size = this.originalData.length;
  }

  emit(pivot: Vector2D | Vector3D) {
    const scrollOffset = [document.scrollingElement?.scrollLeft || 0, document.scrollingElement?.scrollTop || 0, 0];
    this._createSearchTree(scrollOffset);

    const searchTree = this.searchTree;
    if (!searchTree || !(searchTree instanceof KDTree)) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'DataDomain.emit', `Expected searchTree to be type of KDtree but got ${typeof searchTree}`);
    }

    const closestNode = searchTree.searchClosest(pivot)

    // console.log(closestNode.id, closestNode.boundary, scrollOffset[1], this.data)
    const baseCoord = this.baseCoord
    if (closestNode) {
      if (pivot[0] >= closestNode.boundary[0] - closestNode.boundary[2] - scrollOffset[0] + baseCoord[0] &&
        pivot[0] <= closestNode.boundary[0] + closestNode.boundary[2] - scrollOffset[0] + baseCoord[0] &&
        pivot[1] >= closestNode.boundary[1] - closestNode.boundary[3] - scrollOffset[1] + baseCoord[1] &&
        pivot[1] <= closestNode.boundary[1] + closestNode.boundary[3] - scrollOffset[1] + baseCoord[1]
      ) {
        return closestNode.id
      }
    }
    return null
  }

  /** take a snapshot of original 'data' and create searchTree filled with valid data sets(which is actual candidates of target element)  */
  private _createSearchTree(offsetFactor: number[]) {

    let validData = this.originalData.filter((elemBoundary: ElementBoundary) => {
      const isInclusive = elemBoundary.boundary[0] + offsetFactor[0] >= 0 && elemBoundary.boundary[1] + offsetFactor[1] >= 0 && elemBoundary.boundary[0] + offsetFactor[0] <= window.innerWidth && elemBoundary.boundary[1] + offsetFactor[1] <= window.innerHeight;
      return isInclusive
    })

    validData = validData.map((v) => {
      v.boundary[0] += offsetFactor[0];
      v.boundary[1] += offsetFactor[1];
      return v
    })

    const dataInstance = new KDTree(validData, this.dimension)
    this.searchTree = dataInstance;
  }

}