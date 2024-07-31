import type { Hand } from '@tensorflow-models/hand-pose-detection'
import type { AbstractGesture, OperationKey } from '../Gesture'
import { Handedness, Vector2D } from '../../types';
import { ClickGestureEvent } from './ClickGestureEvent'
import type { DataDomain } from '../../models/DataDomain';

export interface ClickGestureConfig {
  dispatchInterval?: number;
  threshold?: number;
  hand?: Handedness
}

export class ClickGesture implements AbstractGesture {
  name = 'clickGesture';
  eventName = 'clickGesture';
  hand: Handedness;
  dispatchInterval: number;
  threshold: number;
  timer: number | null = null;
  _test: boolean = false;
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

  handler(event: unknown, dataDomain: DataDomain, triggerHelperElem?: HTMLDivElement) {
    const e = event as ClickGestureEvent;
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
