import type { Hand } from '@tensorflow-models/hand-pose-detection'
import type { AbstractGesture, OperationKey } from '../Gesture'
import { Handedness, Vector2D } from '../../types';
import { ClickGestureEvent } from './ClickGestureEvent'
import type { DataDomain } from '../../models/DataDomain';


/**
 * @property dispatchInterval - minimum time interval between each event dispatch (default : 500)
 * @property threshold - value of index & thumb tip distance. This is used to determine whether current hand gesture is a `ClickGesture` or not.
 * 
 * if the distance is below threshold, `ClickGesture` will be dispatched.
 * 
 * (default : 1200)
 * 
 * @property hand - gesture handedness for which hand to detect 
 * 
 * (default : 'left')
 * @interface
 */
export interface ClickGestureConfig {
  dispatchInterval?: number;
  threshold?: number;
  hand?: Handedness
}


/**
 * An `ClickGesture` is implementation of `AbstractGesture` which holds every core informations how to handle gesture, define what is gesture and what to do when gesture dispatched.
 */
export class ClickGesture implements AbstractGesture {
  /**  `name` should be **unique** among all registered gestures */
  name = 'clickGesture';
  eventName = 'clickGesture';

  /**  gesture handedness for which hand to detect  */
  hand: Handedness;

  /** minimum time interval between each event dispatch (default : 500) */
  dispatchInterval: number;

  /**
  * value of index & thumb tip distance. This is used to determine whether current hand gesture is a `ClickGesture` or not.
  * 
  * if the distance is below threshold, `ClickGesture` will be dispatched.
  * 
  * (default : 1200)
   */
  threshold: number;
  private timer: number | null = null;

  /**
   * A list of queries to retrieve/cache function/values
   */
  operations: OperationKey[] = [
    "func::get2FingerDistance-thumbTip-indexTip",
    "func::get2FingerDistance-thumbTip-middleTip",
    "var::thumbTip",
    "var::indexTip"
  ];

  constructor(config?: ClickGestureConfig) {
    this.dispatchInterval = config?.dispatchInterval || 500;
    this.threshold = config?.threshold || 1200;
    this.hand = config?.hand || Handedness.LEFT
  }

  /**
   * @param event - clickGestureEvent
   * @param dataDomain - collections of `vgesturable` element coordinates base on current viewport, it provides useful methods to search which element to interact with.
   * @param triggerHelperElem - use to mark or add effect on event dispatched point.
   */
  handler(event: ClickGestureEvent, dataDomain: DataDomain, triggerHelperElem?: HTMLDivElement) {
    const e = event;
    if (triggerHelperElem) {
      triggerHelperElem.style.top = e.triggerPoint.y + 'px'
      triggerHelperElem.style.left = e.triggerPoint.x + 'px'
    }

    const pivot = [e.triggerPoint.x, e.triggerPoint.y] as Vector2D
    const closestNode = dataDomain.searchClosest(pivot)

    // current event is held inner boundary of closestNode
    if (closestNode) {
      if (pivot[0] >= closestNode.boundary[0] - closestNode.boundary[2] &&
        pivot[0] <= closestNode.boundary[0] + closestNode.boundary[2] &&
        pivot[1] >= closestNode.boundary[1] - closestNode.boundary[3] &&
        pivot[1] <= closestNode.boundary[1] + closestNode.boundary[3]
      ) {
        const nodeId = closestNode.id;
        if (nodeId) {
          const node = document.getElementById(nodeId);
          node?.dispatchEvent(new Event('click'));
        }
      }
    }

  }

  determinant(hands: Hand[], operations: Record<string, any>): any | boolean {
    //cool down
    if (this.timer) {
      return false;
    }
    if (hands.length === 0) {
      return false;
    }

    const distance = operations['func::get2FingerDistance-thumbTip-indexTip']
    const indexTip = operations['var::indexTip'];
    const thumbTip = operations['var::thumbTip'];

    if (indexTip && thumbTip) {
      if (distance <= this.threshold) {
        dispatchEvent(new ClickGestureEvent(this.eventName, { indexTip, thumbTip }));

        this.timer = setTimeout(() => {
          this.timer = null
        }, this.dispatchInterval)
        return { x: (indexTip.x + thumbTip.x) / 2, y: (indexTip.y + thumbTip.y) / 2 }
      }
    }
    return false;
  }

}
