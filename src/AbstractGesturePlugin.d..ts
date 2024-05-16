import type { VGesture } from "./VGesture";

/**
 *  An **AbstractGesture** is used to provide additional Gesture as Plugin
 *  to an [[VGesture]] without adding backwards-incompatible changes
 */
export interface AbstractGesturePlugin {
  name: string;
  connect: (gestureManager: VGesture) => VGesture
}