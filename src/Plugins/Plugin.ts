import { AbstractGesture } from "../Gestures/Gesture";
import type { VGesture } from "../VGesture";

/**
 *  An **Plugin** is used provide Gesture to V-Gesture as Plugin
 *  without adding backwards-incompatible changes
 */

export interface AbstractGesturePlugin {


  gesture: AbstractGesture;
  /**
   * NOTE) If register is delcared, unregister should be also declared.
   * by default, abstract plugins will have prebuilt register/unregister methods 
   * if specified, it will override prebuilt.
   * e.g)stuffs setting for update func, listerner, garbage collectings
   */
  register?: (gestureManager: VGesture) => VGesture;


  /**
   * NOTE) If unregister is delcared, register should be also declared.
   * by default, abstract plugins will have prebuilt register/unregister methods 
   * if specified, it will override prebuilt.
   * e.g) removing event listeners etc..
   */
  unregister?: () => void;
}