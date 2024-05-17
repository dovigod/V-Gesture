import { AbstractGesture } from "../Gestures/Gesture";
import type { VGesture } from "../VGesture";

/**
 *  An **Plugin** is used provide Gesture to V-Gesture as Plugin
 *  without adding backwards-incompatible changes
 */

export interface AbstractGesturePlugin {


  gesture: AbstractGesture;
  /**
   * 
   * 
   * update func
   * listerner,
   * garbage collectings
   */
  register: (gestureManager: VGesture) => VGesture;


  /**
   * 
   * used when cleaning up gracefully.
   * e.g) removing event listeners etc..
   */
  unregister: () => void;
}