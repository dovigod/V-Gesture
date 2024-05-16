import { Hand } from '@tensorflow-models/hand-pose-detection'
import type { AbstractGesture } from './Gesture'
import { Color } from '../types';
import { KDTree } from '../KDTree';
import { ClickGestureEvent } from '../ClickGestureEvent'

export interface ClickGestureConfig {
  dispatchInterval?: number;
  displayTriggerPoint?: boolean;
  triggerPointColor?: Color;
  threshold?: number;
}

export class ClickGesture implements AbstractGesture {
  name = 'clickGesture';
  eventName = 'clickGesture';
  dispatchInterval: number;
  displayTriggerPoint: boolean = false;
  triggerPointColor: Color;
  threshold: number;
  timer: number | null = null;

  constructor(config?: ClickGestureConfig) {
    this.dispatchInterval = config?.dispatchInterval || 500;
    this.displayTriggerPoint = config?.displayTriggerPoint || false;
    this.triggerPointColor = config?.triggerPointColor || '#B388EB';
    this.threshold = config?.threshold || 1200;

  }

  dispatcher(event: unknown, gestureCollection: KDTree, triggerHelperElem?: HTMLDivElement) {
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

  determinant(hands: Hand[]): boolean {
    //cool down
    if (this.timer) {
      return false;
    }
    //no hands detected
    if (hands.length === 0) {
      return false;
    }

    const hand = hands[0];

    const indexTip = getIndexFingerTip(hand);
    const thumbTip = getThumbTip(hand);

    if (indexTip && thumbTip) {
      const distance = getGestureClickDistance(indexTip, thumbTip);

      if (distance <= this.threshold) {
        dispatchEvent(new ClickGestureEvent('clickGesture', { indexTip, thumbTip }));
        this.timer = setTimeout(() => {
          this.timer = null
        }, this.dispatchInterval)
      }
    }
    return true;
  }
}

function getGestureClickDistance(keypoint1: any, keypoint2: any) {
  return Math.pow(keypoint1.x - keypoint2.x, 2) + Math.pow(keypoint1.y - keypoint2.y, 2);
}
function getIndexFingerTip(hand: any) {
  if (!hand) {
    return null;
  }
  return hand.keypoints.find((keypoint: any) => keypoint.name === 'index_finger_tip')
}

function getThumbTip(hand: any) {
  if (!hand) {
    return null;
  }
  return hand.keypoints.find((keypoint: any) => keypoint.name === 'thumb_tip')
}

