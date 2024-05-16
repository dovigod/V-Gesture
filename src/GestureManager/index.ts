import { AbstractGesture } from "../Gestures/Gesture";
import type { AbstractGesturePlugin } from "../Plugins/Plugin";
import { warn } from "../utils/console";

/**
 * An GestureManager is used to manage connection between GesturePlugins and others.
 * 
 */
export class GestureManager {
  gestures: Map<string, AbstractGesture>;
  gestureGC: Map<string, () => void>;

  constructor() {
    this.gestures = new Map();
    this.gestureGC = new Map();
  }

  has(key: string) {
    return this.gestures.has(key)
  }

  register(plugin: AbstractGesturePlugin) {
    const gestureName = plugin.gesture.name;
    const gestures = this.gestures;
    const gestureGC = this.gestureGC;
    if (gestures.has(gestureName)) {
      warn(`${gestureName} is already registered`);
      return;
    }
    const dispose = () => {
      plugin.unregister()
      gestures.delete(gestureName)
    }
    gestures.set(gestureName, plugin.gesture);
    gestureGC.set(gestureName, dispose);
  }


  dispose(gestureName: string) {
    const disposeFunc = this.gestureGC.get(gestureName);
    if (typeof disposeFunc === 'function') {
      disposeFunc()
    }
  }
  disposeAll() {
    this.gestureGC.forEach((func: () => void) => {
      if (typeof func === 'function') {
        func()
      }
    })
  }
}