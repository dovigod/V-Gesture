import type { Hand } from "@tensorflow-models/hand-pose-detection";
import { Handedness, VectorLike2D } from "../types";
import { DataDomain } from "../models/DataDomain";


/**
 * 
 * An `OperationKey` is an formatted query which let `VGesture` cache each results and retreive for faster computation.
 * 
 * For variable requests, start with `var::`
 * 
 * For function requests, start with `func::`,concat with function name, and concat each parameters with `-`

 * e.g)
 * function request = `func::functionName-arg1-arg2`
 * 
 * variable request = `var::var1`
 * 
 * 
 * **NOTE)Each functions, args , vars should be knowned values check following {@link https://arc.net/l/quote/euazgumu link}.**
 * 
 */
export type OperationKey = `${"func::" | "var::"}${string}`




/**
 * An `AbstractGesture` is a interface which let user describe core informations to let `VGesture` recognize
 * how to handle gesture, what gesture is and what to do when gesture dispatched
 */

export interface AbstractGesture {
  /**
   * name of gesture
   * 
   * **NOTE)`name` should be **unique** among all registered gestures**
   */
  name: string;
  eventName: string;
  /**
   * 
   * Describes what is this gesture.
   * Determine current user's hand pose matches this Gesture.
   * 
   *  
   * Any "Truthy" values will let current handpose match this gesture.
   * In case of marking hitpoint of gesture, return VectorLike2D
   */
  determinant(hands: Hand[], requestedOperations?: Record<OperationKey, any>): any | VectorLike2D | boolean;

  /**
   * 
   * Describes what to do when gesture occurs.
   * 
   * An function when %eventName% is emitted to Window object
   * 
   * Normally used for handling events or to dispatch native event as a chain
   */
  handler(event: unknown, dataDomain: DataDomain, triggerHelperElem?: HTMLElement): void;

  /**
   * provided operations will be cached and forwarded during determinant call.
   * 
   * this is used to share operations among each gesture determinance.
   * e.g) 
   * 
   * 
   * function request = `func::functionName-arg1-arg2`
   * 
   * variable request = `var::var1`
   * 
   * **NOTE) each functionName , args , vars should be knowned values check following {@link https://arc.net/l/quote/euazgumu link}.**
   * 
   * 
   * 
   */
  operations?: OperationKey[]

  /**
   * gesture handedness for which hand to detect 
   */
  hand: Handedness
}