import { AbstractGesture, OperationKey } from "../Gestures/Gesture";
import type { AbstractGesturePlugin } from "../Plugins/Plugin";
import { warn } from "../utils/console";
import { getOperationReciept } from '../operation'
import { Handedness, HandVertex } from "../types";
import { getVertex } from "../operation/operations";
import type { Hand } from "@tensorflow-models/hand-pose-detection";


const SUPPORTING_VERTEX = {
  'thumb_tip': true,
  'index_finger_tip': true
}
/**
 * An GestureManager is used to manage connection between Gestures and others.
 * Also supports sharing operation results among gestures.
 */
export class GestureManager {
  gestures: Map<string, AbstractGesture>;
  gestureGC: Map<string, () => void>;
  sharedOperations: Map<string, any>;
  handsVertex: Map<'left' | 'right', Map<string, HandVertex>>;
  version: number;

  constructor() {
    this.gestures = new Map();
    this.gestureGC = new Map();
    this.sharedOperations = new Map();
    this.handsVertex = new Map();
    this.handsVertex.set('left', new Map());
    this.handsVertex.set('right', new Map());
    this.version = 0;
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

  updateHandVertex(handDirection: Handedness, hand: Hand) {
    if (handDirection !== 'both') {

      const handVertexMap = this.handsVertex.get(handDirection)

      hand.keypoints.forEach(keypoint => {
        if (keypoint.name && keypoint.name in SUPPORTING_VERTEX) {
          const vertex = getVertex(keypoint, keypoint.name);

          if (vertex) {
            handVertexMap!.set(vertex.name, vertex)
          }
        }
      });
    }
  }

  private _registerOperation(requestingOperations: OperationKey[], usedHand: Handedness) {

    const sharedOperations = this.sharedOperations;

    for (const operationKey of requestingOperations) {

      let operationRecord = sharedOperations.get(operationKey);

      if (!operationRecord) {

        const operationReciept = getOperationReciept(operationKey);
        // operation not recognized. possibly human error. exit without registering
        if (!operationReciept) {
          return;
        }
        const operation = this._operationFactory(operationReciept, usedHand)
        operationRecord = {
          used: 1,
          operation,
          value: null,
          version: 0 % 8
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


      operation = () => {
        const args = operationReciept.vars.map((arg: string) => {
          // if(handDirection === Handedness.BOTH){
          // }
          if (handDirection === Handedness.LEFT) {
            return this.handsVertex.get('left')!.get(arg)
          }
          if (handDirection === Handedness.RIGHT) {
            return this.handsVertex.get('right')!.get(arg)
          }
        })
        return func(...args)
      }
    }
    if (operationReciept.type === 'variable') {
      const arg = operationReciept.vars;
      if (handDirection === Handedness.LEFT) {
        operation = () => this.handsVertex.get('left')!.get(arg)
      }
      if (handDirection === Handedness.RIGHT) {
        operation = () => this.handsVertex.get('right')!.get(arg)
      }
    }
    return operation;
  }


}