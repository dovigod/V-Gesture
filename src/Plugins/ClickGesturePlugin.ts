import { ClickGesture, ClickGestureConfig } from '../Gestures/ClickGesture';
import { VGesture } from '../VGesture';
import { AbstractGesturePlugin } from './Plugin';

export class ClickGesturePlugin implements AbstractGesturePlugin {

  gesture: ClickGesture;
  handlerFunc: ((event: unknown) => void) | null = null;

  constructor(config?: ClickGestureConfig) {
    this.gesture = new ClickGesture(config);
  }

  register(vGesture: VGesture) {
    if (this.handlerFunc) {
      window.removeEventListener(this.gesture.eventName, this.handlerFunc)
    }
    this.handlerFunc = (e: unknown) => {
      this.gesture.handler(e, vGesture.gestureTargetCollection);
    }
    return vGesture;
  }

  unregister() {
    if (this.handlerFunc) {
      window.removeEventListener(this.gesture.eventName, this.handlerFunc)
      this.handlerFunc = null;
    }
  }
}