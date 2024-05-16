import type { Hand } from "@tensorflow-models/hand-pose-detection";
import { KDTree } from "../KDTree";

export interface AbstractGesture {
  /**
   * name of gesture
   */
  name: string;
  /**
   * name of event which will be dispatched if user acts Gesture
   */
  eventName: string;
  /**
   * 
   * determinate current user's gesture does matches this Gesture 
   * if matches, return true, otherwise, false
   */
  determinant(hands: Hand[]): boolean;

  /**
   * handler function when %eventName% is emitted to Window object
   * Normally used for handling events or to dispatch native event as a chain
   */
  dispatcher(event: unknown, gestureCollection: KDTree, triggerHelperElem?: HTMLElement): void;

}