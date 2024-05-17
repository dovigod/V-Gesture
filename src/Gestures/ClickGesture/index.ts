import { Hand } from '@tensorflow-models/hand-pose-detection'
import type { AbstractGesture, OperationKey } from '../Gesture'
import { Color, Handedness } from '../../types';
import { KDTree } from '../../KDTree';
import { ClickGestureEvent } from './ClickGestureEvent'

export interface ClickGestureConfig {
  dispatchInterval?: number;
  displayTriggerPoint?: boolean;
  triggerPointColor?: Color;
  threshold?: number;
  usedHand?: Handedness
}

export class ClickGesture implements AbstractGesture {
  name = 'clickGesture';
  eventName = 'clickGesture';
  usedHand: Handedness;
  dispatchInterval: number;
  displayTriggerPoint: boolean = false;
  triggerPointColor: Color;
  threshold: number;
  timer: number | null = null;
  operationsRequest: OperationKey[] = [
    "func::get2FingerDistance-thumbTip-indexTip",
    "func::get2FingerDistance-thumbTip-middleTip",
    "var::thumbTip",
    "var::indexTip"
  ];

  constructor(config?: ClickGestureConfig) {
    this.dispatchInterval = config?.dispatchInterval || 500;
    this.displayTriggerPoint = config?.displayTriggerPoint || false;
    this.triggerPointColor = config?.triggerPointColor || '#B388EB';
    this.threshold = config?.threshold || 1200;
    this.usedHand = config?.usedHand || Handedness.LEFT

  }

  handler(event: unknown, gestureCollection: KDTree, triggerHelperElem?: HTMLDivElement) {
    const e = event as ClickGestureEvent;
    if (triggerHelperElem) {
      triggerHelperElem.style.top = e.triggerPoint.y + 'px'
      triggerHelperElem.style.left = e.triggerPoint.x + 'px'
    }
    const nodeId = gestureCollection.emit([e.triggerPoint.x, e.triggerPoint.y])
    if (nodeId) {
      const node = document.getElementById(nodeId);
      node?.dispatchEvent(new Event('click'));
    }
  }

  determinant(hands: Hand[], requestedOperations: Record<string, any>): any | boolean {
    //cool down
    if (this.timer) {
      return false;
    }
    //no hands detected
    if (hands.length === 0) {
      return false;
    }

    const distance = requestedOperations['func::get2FingerDistance-thumbTip-indexTip']
    const indexTip = requestedOperations['var::indexTip'];
    const thumbTip = requestedOperations['var::thumbTip'];

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
