import { AbstractGesture } from "../Gestures/Gesture";
import type { VGesture } from "../VGesture";

/**
 *  An **Plugin** is an intermediate layer which is used let `VGesture` handle gesture as a plugin
 *  without adding backwards-incompatible changes
 * 
 *  
 * 
 *  
 */

export interface AbstractGesturePlugin {


  /**
   * Any Class which implements `AbstractGesture`
   */
  gesture: AbstractGesture;
  /**
   * **NOTE) If register is specified, unregister should be also specified.**
   * 
   * by default, `AbstractGesturePlugin` will have built-in register/unregister methods 
   * 
   * if specified, it will override built-in `register` function.
   * 
   * e.g)stuffs setting for update func, listerner, garbage collectings
   */
  register?: (gestureManager: VGesture) => VGesture;


  /**
   * **NOTE) If unregister is specified, register should be also specified.**
   * 
   * 
   * by default, `AbstractGesturePlugin` will have built-in register/unregister methods 
   * 
   * if specified, it will override built-in `unregister` function.
   * 
   * 
   * e.g) removing event listeners etc..
   */
  unregister?: () => void;
}