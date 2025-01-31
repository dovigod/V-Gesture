import type { VGesture } from "../../VGesture";
import type { AbstractGesturePlugin } from '../../plugins/Plugin'

export function register(vGesture: VGesture, plugin: AbstractGesturePlugin) {
  const gestureName = plugin.gesture.name;
  const gestureManager = vGesture.gestureManager;
  if (!gestureManager.gestures.has(gestureName)) {
    const handlerFunc = (e: unknown) => {
      plugin.gesture.handler(e, vGesture.gestureTargetCollection);
    }

    window.addEventListener(plugin.gesture.eventName, handlerFunc)
    return [handlerFunc]
  }
}

export function unregister(plugin: AbstractGesturePlugin, handlerFunc: (e: unknown) => void) {
  window.removeEventListener(plugin.gesture.eventName, handlerFunc)
}