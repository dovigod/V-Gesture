import { AbstractGesture, OperationKey } from "../Gestures/Gesture";
import type { AbstractGesturePlugin } from "../plugins/Plugin";
import { warn } from "../utils/console";
import { getOperationReciept } from '../operation'
import { FunctionOperationReciept, Handedness, HandVertex, OperationReciept, OperationRecord, VariableOperationReciept } from "../types";
import { getVertex } from "../operation/operations";
import type { Hand } from "@tensorflow-models/hand-pose-detection";
import { protect } from "../utils/validation/trap";
import { unregister } from "../utils/prebuilt";
import { compatiblizeParam } from "../utils/polyfill/plugin";


const $$setterAccessKey = Symbol('Gesture-manager')
const SUPPORTING_VERTEX = {
  'thumb_tip': true,
  'index_finger_tip': true,
  'middle_finger_tip': true,
  'ring_finger_tip': true,
  'pinky_finger_tip': true
}
/**
 * An GestureManager is used to manage connection between Gestures and others.
 * Also supports sharing operation results among gestures.
 */
export class GestureManager {
  gestures: Map<string, AbstractGesture>;
  gestureGC: Map<string, () => void>;
  sharedOperations: Map<string, OperationRecord>;
  handsVertex: Map<Handedness, Map<string, HandVertex>>;
  version: number;

  constructor() {
    this.gestures = new Map();
    this.gestureGC = new Map();
    this.sharedOperations = new Map();
    this.handsVertex = new Map();
    this.handsVertex.set(Handedness.LEFT, new Map());
    this.handsVertex.set(Handedness.RIGHT, new Map());
    this.version = 0;
    return protect(this, $$setterAccessKey) as GestureManager

  }

  has(key: string) {
    return this.gestures.has(key)
  }

  register(plugin_: AbstractGesturePlugin, handlerFunc?: (e: unknown) => void) {

    const plugin = compatiblizeParam(plugin_)

    const gestureName = plugin.gesture.name;
    const gestures = this.gestures;
    const gestureGC = this.gestureGC;
    const requestingOperations = plugin.gesture.operations;
    const hand = plugin.gesture.hand;

    if (requestingOperations) {
      this._registerOperation(requestingOperations, hand)
    }

    if (gestures.has(gestureName)) {
      warn(`${gestureName} is already registered`);
      return;
    }

    const dispose = () => {

      if (plugin.unregister) {
        plugin.unregister()
      } else if (handlerFunc) {
        unregister(plugin, handlerFunc)
      }
      gestures.delete(gestureName)
    }
    gestures.set(gestureName, plugin.gesture);
    gestureGC.set(gestureName, dispose);
  }


  dispose(gestureName: string) {
    const gesture = this.gestures.get(gestureName);
    // clean up from shared Operation
    if (gesture?.operations) {
      for (const operationKey of gesture.operations) {
        const operationRecord = this.sharedOperations.get(operationKey);
        if (operationRecord) {
          operationRecord.used -= 1;
          if (operationRecord.used <= 0) {
            this.sharedOperations.delete(operationKey)
          }
        }
      }
    }
    const disposeFunc = this.gestureGC.get(gestureName);
    if (typeof disposeFunc === 'function') {
      disposeFunc()
    }
    this.gestureGC.delete(gestureName);
    this.gestures.delete(gestureName)

  }
  disposeAll() {
    this.gestureGC.forEach((func: () => void) => {
      if (typeof func === 'function') {
        func()
      }
    })
    this.gestures.clear();
    this.gestureGC.clear();
    this.sharedOperations.clear()
  }

  updateHandVertex(handDirection: Handedness, hand: Hand) {
    if (handDirection === 'left' || handDirection === 'right') {

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

  /**
   * creates operationRecords for caching.
   */
  private _registerOperation(requestingOperations: OperationKey[], usedHand: Handedness) {

    const sharedOperations = this.sharedOperations;

    for (const operationKey of requestingOperations) {

      let operationRecord = sharedOperations.get(operationKey);

      if (!operationRecord) {
        const operationReciept: OperationReciept | null = getOperationReciept(operationKey);
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
  private _operationFactory(operationReciept: OperationReciept, handDirection: Handedness) {
    let operation;

    if (operationReciept.type === 'function') {
      const reciept = operationReciept as FunctionOperationReciept
      const func = reciept.func;

      operation = () => {
        const args = reciept.vars.map((arg: string) => {
          // if(handDirection === Handedness.BOTH){
          // }
          if (handDirection === Handedness.LEFT) {
            return this.handsVertex.get(Handedness.LEFT)!.get(arg)
          }
          if (handDirection === Handedness.RIGHT) {
            return this.handsVertex.get(Handedness.RIGHT)!.get(arg)
          }
        }) as HandVertex[]
        return func(...args)
      }
    }
    if (operationReciept.type === 'variable') {
      const reciept = operationReciept as VariableOperationReciept
      const arg = reciept.vars;
      if (handDirection === Handedness.LEFT) {
        operation = () => this.handsVertex.get(Handedness.LEFT)!.get(arg)
      }
      if (handDirection === Handedness.RIGHT) {
        operation = () => this.handsVertex.get(Handedness.RIGHT)!.get(arg)
      }
    }
    return operation!;
  }


}