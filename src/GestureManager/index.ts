import { AbstractGesture, OperationKey } from "../Gestures/Gesture";
import type { AbstractGesturePlugin } from "../Plugins/Plugin";
import { warn } from "../utils/console";
import { getOperationReciept } from '../operation'
import { Handedness } from "../types";

/**
 * An GestureManager is used to manage connection between Gestures and others.
 * Also supports sharing operation results among gestures.
 */
export class GestureManager {
  gestures: Map<string, AbstractGesture>;
  gestureGC: Map<string, () => void>;
  sharedOperations: Map<string, any>;
  handsVertex: any;

  constructor() {
    this.gestures = new Map();
    this.gestureGC = new Map();
    this.sharedOperations = new Map();
    this.handsVertex = new Map();
    this.handsVertex.set('left', new Map());
    this.handsVertex.set('right', new Map());
  }

  has(key: string) {
    return this.gestures.has(key)
  }

  register(plugin: AbstractGesturePlugin) {
    const gestureName = plugin.gesture.name;
    const gestures = this.gestures;
    const gestureGC = this.gestureGC;
    const requestingOperations = plugin.gesture.operationsRequest;
    const usedHand = plugin.gesture.usedHand;

    if (requestingOperations) {
      this._registerOperation(requestingOperations, usedHand)
    }

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

  private _registerOperation(requestingOperations: OperationKey[], usedHand: Handedness) {

    const sharedCache = this.sharedOperations;

    for (const operationKey of requestingOperations) {

      let operationRecord = sharedCache.get(operationKey);
      if (operationRecord) {

        const operationReciept = getOperationReciept(operationKey);
        // operation not recognized. possibly human error. exit without registering
        if (!operationReciept) {
          return;
        }
        const operation = this._operationFactory(operationReciept, usedHand)

        operationRecord = {
          used: 1,
          operation,
          value: null
        }
      } else {
        operationRecord.used++
      }

      this.sharedOperations.set(operationKey, operationRecord);
    }
  }
  private _operationFactory(operationReciept: any, handDirection: Handedness) {
    let operation;

    if (operationReciept.type === 'function') {
      const func = operationReciept.func;
      const args = operationReciept.vars.map((arg: string) => {
        // if(handDirection === Handedness.BOTH){
        // }
        if (handDirection === Handedness.LEFT) {
          return this.handsVertex.get('left').get(arg)
        }
        if (handDirection === Handedness.RIGHT) {
          return this.handsVertex.get('right').get(arg)
        }
      })

      operation = () => {
        return func(...args)
      }
    }
    if (operationReciept.type === 'variable') {
      const arg = operationReciept.args[0];

      if (handDirection === Handedness.LEFT) {
        operation = () => this.handsVertex.get('left').get(arg)
      }
      if (handDirection === Handedness.RIGHT) {
        operation = () => this.handsVertex.get('right').get(arg)
      }
    }
    return operation;
  }
}