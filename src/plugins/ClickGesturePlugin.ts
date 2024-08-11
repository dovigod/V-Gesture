import { ClickGesture, ClickGestureConfig } from '../Gestures/ClickGesture';
// import { VGesture } from '../VGesture';
import { AbstractGesturePlugin } from './Plugin';


/**
 * An `ClickGesturePlugin` is a built-in gesture which gives `VGesture`ability to recognize "pinching" (with left index & thumb) gesture
 */
export class ClickGesturePlugin implements AbstractGesturePlugin {

  gesture: ClickGesture;
  // handlerFunc: ((event: unknown) => void) | null = null;

  constructor(config?: ClickGestureConfig) {
    this.gesture = new ClickGesture(config);
  }

  // register(vGesture: VGesture) {
  //   console.log('hit')
  //   if (this.handlerFunc) {
  //     window.removeEventListener(this.gesture.eventName, this.handlerFunc)
  //   }
  //   this.handlerFunc = (e: unknown) => {
  //     this.gesture.handler(e, vGesture.gestureTargetCollection);
  //   }
  //   window.addEventListener(this.gesture.eventName, this.handlerFunc)
  //   return vGesture;
  // }

  // unregister() {
  //   if (this.handlerFunc) {
  //     window.removeEventListener(this.gesture.eventName, this.handlerFunc)
  //     this.handlerFunc = null;
  //   }
  // }
}