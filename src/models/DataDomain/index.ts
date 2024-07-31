import { VGestureError } from '../../error';
import { type Vector2D, type Vector3D, type ElementBoundary, ERROR_TYPE, Boundary2D } from '../../types'
import { MAXIMUM_SUPPORTED_DIMENSION } from '../../constant';
import { KDTree } from './KDTree';
import Fastdom from 'fastdom';
import fastdomPromiseExtension from 'fastdom/extensions/fastdom-promised'
import { traverse } from '../../utils/dom/traverse';

const fastdom = Fastdom.extend(fastdomPromiseExtension);




export class DataDomain {
  private _originalData: ElementBoundary[];
  /** @ignore */
  size: number;
  /** @ignore */
  dimension: number;
  private _searchTree: KDTree | null = null;

  /** @ignore */
  baseCoord = [document.documentElement.scrollLeft, document.documentElement.scrollTop];

  // for better DX purpose
  /** @ignore */
  [Symbol.iterator]() {
    let index = -1;
    const data = this._originalData;
    return {
      next: () => ({ value: data[++index], done: index >= data.length })
    };
  };

  /** @ignore */
  constructor(data: ElementBoundary[], dimension = 2) {
    if (dimension > MAXIMUM_SUPPORTED_DIMENSION) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'DataDomain.constructor', 'Unable to construct DataDomain. Unsupported Dimension');
    }
    this._originalData = data
    this.dimension = dimension;
    this.size = this._originalData.length;
  }

  /** @ignore */
  async update() {
    const PREFIX = 'vgesturable'
    const elemBoundaries: ElementBoundary[] = []
    let id = 0;

    await fastdom.mutate(() => {
      // traverse from  Dom tree, rooting from body node, find all elems with gClickable specified elements
      // create kdtree to handle event target domain
      traverse(document.body, (elem) => {
        if ((elem as HTMLElement).hasAttribute('vgesturable')) {
          const clickableElem = elem as HTMLElement
          const { top, left, width, height } = clickableElem.getBoundingClientRect();
          let elemId = clickableElem.id;

          if (!elemId) {
            elemId = `${PREFIX}-${id}`
            id++;
          }

          clickableElem.id = elemId;

          const x = left + width / 2;
          const y = top + height / 2;
          const dx = width / 2;
          const dy = height / 2;
          const boundary = [x, y, dx, dy] as Boundary2D;
          const ElementBoundary = {
            id: elemId,
            dimension: boundary.length / 2,
            boundary
          }
          elemBoundaries.push(ElementBoundary)
        }
      })
    })

    this._originalData = elemBoundaries
    this.size = this._originalData.length
  }



  /**
   * 
   * searches nearest `vgesturable` element by given pivot point.
   * 
   */
  searchClosest(pivot: Vector2D | Vector3D) {
    const scrollOffset = [document.scrollingElement?.scrollLeft || 0, document.scrollingElement?.scrollTop || 0, 0];
    const positionOffset = [this.baseCoord[0] - scrollOffset[0], this.baseCoord[1] - scrollOffset[1]];
    this._createSearchTree(positionOffset);
    const searchTree = this._searchTree;
    if (!searchTree || !(searchTree instanceof KDTree)) {
      return null
    }

    const closest = searchTree.searchClosest(pivot)
    this._searchTree = null
    return closest;
  }

  /** take a snapshot of original 'data' and create searchTree filled with valid data sets(which is actual candidates of target element)  */
  /** @ignore */
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