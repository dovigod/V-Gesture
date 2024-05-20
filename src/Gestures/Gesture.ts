import type { Hand } from "@tensorflow-models/hand-pose-detection";
import { KDTree } from "../KDTree";
import { Color, Handedness } from "../types";

export type OperationKey = `${"func::" | "var::"}${string}`
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
   * if matches, return any truth value, otherwise, false
   */
  determinant(hands: Hand[], requestedOperations?: Record<OperationKey, any>): any | boolean;

  /**
   * handler function when %eventName% is emitted to Window object
   * Normally used for handling events or to dispatch native event as a chain
   */
  handler(event: unknown, gestureCollection: KDTree, triggerHelperElem?: HTMLElement): void;

  /**
   * provided operations will be cached and forwarded during determinant call.
   * this is used to share operations among each gesture determinance.
   * e.g) 
   * function request = func::functionName-arg1-arg2
   * variable request = var::var1
   * 
   * NOTE) each functionName , args , vars should be knowned values check following link 
   * 
   * 
   */
  operationsRequest?: OperationKey[]

  /**
   * active hand which used for dectecting gesture
   */
  usedHand: Handedness
}