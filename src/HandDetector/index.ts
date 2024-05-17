import type { HandDetector as HandPoseDetector } from "@tensorflow-models/hand-pose-detection";
import { createDetector } from "../tensorflow/detector";
import { setBackendAndEnvFlags } from "../tensorflow/backend";
import { error } from "../utils/console";
import { Camera } from "../Camera";
import { GestureManager } from "../GestureManager";
import { OperationKey } from "../Gestures/Gesture";
import { Handedness } from "../types";
export class HandDetector {

  private predictionId: number | null = null;
  public detector: HandPoseDetector | null = null;
  public camera: Camera | null = null;
  private initialized: boolean = false;
  public gestureManager: GestureManager
  public helper: any;

  constructor(gestureManager: GestureManager, helper: any) {
    this.gestureManager = gestureManager
    this.helper = helper
  }

  async initialize() {
    if (this.initialized) {
      error('Duplicate HandDetector initialization not allowed')
      return null;
    }
    //traps
    const detectorInterceptors = {
      get: (target: HandPoseDetector, prop: string) => {
        return Reflect.get(target, prop)
      },
      set: () => false
    }
    const cameraInterceptors = {
      get: (target: Camera, prop: string) => {
        return Reflect.get(target, prop)
      },
      set: () => false
    }

    // camera
    const camera = new Camera(this.helper);
    this.camera = new Proxy(camera, cameraInterceptors);


    // wasm-backend
    await setBackendAndEnvFlags({}, '');

    await Camera.setupCamera({ targetFPS: 60 });

    //detector
    const detector = await createDetector();
    this.detector = new Proxy(detector, detectorInterceptors);

    this.initialized = true;
    return this
  }

  async startPrediction() {
    if (!this.initialized) {
      throw new Error('HandPost Detector not initialized')
    }

    const self = this;
    async function frameCb() {
      await self.predict();
      self.predictionId = requestAnimationFrame(frameCb);
    }

    frameCb();
  }

  async pausePrediction() {
    const predictionId = this.predictionId
    if (predictionId) {
      cancelAnimationFrame(predictionId)
      this.predictionId = null;
    }
  }


  private async predict() {
    const camera = this.camera;
    const detector = this.detector;
    if (!camera || !detector || !this.initialized) {
      throw new Error('HandPost Detector not initialized')
    }
    const hands = await detector?.estimateHands(
      camera.video,
      { flipHorizontal: false }
    ).catch(error => {
      return {
        error
      }
    })

    if (!(hands instanceof Array)) {
      detector?.dispose();
      this.detector = null;
      // camera off..
      throw (hands as { error: any }).error
    }

    // for smooth vanishing
    this.camera?.clearCtx();
    this.camera?.drawHitPoint();

    if (hands.length === 0) {
      return;
    }



    // update hand vertex
    for (const hand of hands) {
      const direction = hand.handedness === 'Right' ? 'left' : 'right';
      this.gestureManager.updateHandVertex(direction as Handedness, hand);
      this.gestureManager.handsVertex.get(direction)?.forEach((vertex) => {
        this.camera?.drawTips(vertex)
      })
      this.camera?.drawHitPoint();

    }



    // get requested operation from gestureManager.
    // if requestedOperation is staled (controled by version), refresh 
    const gestureManager = this.gestureManager;
    gestureManager.version = (gestureManager.version + 1) % 8;
    gestureManager.gestures.forEach((gesture) => {
      let requestedOperations: Record<OperationKey, any> | undefined;

      if (gesture.operationsRequest && gesture.operationsRequest.length > 0) {
        requestedOperations = {};
        for (const key of gesture.operationsRequest) {
          let value: any;
          const operationReciept = gestureManager.sharedOperations.get(key)
          if (operationReciept.version !== gestureManager.version) {
            operationReciept.value = operationReciept.operation();
            operationReciept.version++;
            gestureManager.sharedOperations.set(key, operationReciept)
            value = operationReciept.value;
          } else {
            value = operationReciept.value
          }
          requestedOperations[key] = value;
        }

      }

      const det = gesture.determinant(hands, requestedOperations)
      if (det) {
        this.camera?.createHitPoint(det, gesture.triggerPointColor || '#000000');
      }
    })
  }

}