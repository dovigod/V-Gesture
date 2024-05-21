import { VGestureError } from '../../error';
import { type Vector2D, type Vector3D, type ElementBoundary, ERROR_TYPE } from '../../types'
import { MAXIMUM_SUPPORTED_DIMENSION } from '../../constant';
import { KDTree } from './KDTree';


export class DataDomain {
  private _originalData: ElementBoundary[];
  size: number;
  dimension: number;
  private _searchTree: KDTree | null = null;
  baseCoord = [document.documentElement.scrollLeft, document.documentElement.scrollTop];

  // for better DX purpose
  [Symbol.iterator]() {
    let index = -1;
    const data = this._originalData;
    return {
      next: () => ({ value: data[++index], done: index >= data.length })
    };
  };

  constructor(data: ElementBoundary[], dimension = 2) {
    if (dimension > MAXIMUM_SUPPORTED_DIMENSION) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'DataDomain.constructor', 'Unable to construct DataDomain. Unsupported Dimension');
    }
    this._originalData = data
    this.dimension = dimension;
    this.size = this._originalData.length;
  }

  searchClosest(pivot: Vector2D | Vector3D) {
    const scrollOffset = [document.scrollingElement?.scrollLeft || 0, document.scrollingElement?.scrollTop || 0, 0];
    const positionOffset = [this.baseCoord[0] - scrollOffset[0], this.baseCoord[1] - scrollOffset[1]];
    this._createSearchTree(positionOffset);

    const searchTree = this._searchTree;
    if (!searchTree || !(searchTree instanceof KDTree)) {
      return;
    }

    const closest = searchTree.searchClosest(pivot)
    this._searchTree = null
    return closest;
  }

  /** take a snapshot of original 'data' and create searchTree filled with valid data sets(which is actual candidates of target element)  */
  private _createSearchTree(offsetFactor: number[]) {

    let validData = this._originalData.filter((elemBoundary: ElementBoundary) => {
      const isInclusive = elemBoundary.boundary[0] + offsetFactor[0] >= 0 && elemBoundary.boundary[1] + offsetFactor[1] >= 0 && elemBoundary.boundary[0] + offsetFactor[0] <= window.innerWidth && elemBoundary.boundary[1] + offsetFactor[1] <= window.innerHeight;
      return isInclusive
    })
    validData = validData.map((v) => {
      const newData = structuredClone(v);
      newData.boundary[0] += offsetFactor[0];
      newData.boundary[1] += offsetFactor[1];
      return newData
    })
    if (validData.length <= 0) {
      this._searchTree = null
      return;
    }
    const dataInstance = new KDTree(validData, this.dimension);
    this._searchTree = dataInstance
  }

}