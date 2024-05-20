import type { HandDetector as HandPoseDetector } from "@tensorflow-models/hand-pose-detection";
import { createDetector } from "../tensorflow/detector";
import { setBackendAndEnvFlags } from "../tensorflow/backend";
import { error } from "../utils/console";
import { Camera } from "../Camera";
import { protect, createMutationEnvelop } from "../utils/validation/trap";
import { VGestureError } from "../error";
import { ERROR_TYPE } from '../types'
const $$setterAccessKey = Symbol('HandDetector-setter-access-key')
export class HandDetector {

  private _detector: HandPoseDetector | null = null;
  private _initialized: boolean = false;

  constructor() {
    return protect(this, $$setterAccessKey) as HandDetector
  }

  async initialize() {
    if (this._initialized) {
      error('Duplicate HandDetector initialization not allowed')
      return null;
    }

    // use wasm-backend
    await setBackendAndEnvFlags({}, '');

    const detector = await createDetector();
    this._detector = createMutationEnvelop($$setterAccessKey, detector);
    this._initialized = createMutationEnvelop($$setterAccessKey, true);
  }


  async predict(camera: Camera) {

    const detector = this._detector;
    if (!detector || !this._initialized) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'HandDetector.predict', 'HandPost Detector not initialized')
    }
    const hands = await detector?.estimateHands(
      camera.video,
      { flipHorizontal: false }
    ).catch(error => {
      throw new VGestureError(ERROR_TYPE.PREDICTION, 'estimateHands', error)
    })

    if (!(hands instanceof Array)) {
      detector?.dispose();
      this._detector = createMutationEnvelop($$setterAccessKey, null);
      camera.close()
      // hoist up closing to V-gesture
      throw new VGestureError(ERROR_TYPE.PREDICTION, 'HandDetector.predict', `Prediction failed. expected prediction return type to be array but got ${typeof hands}`)
    }

    if (hands.length === 0) {
      return;
    }

    return hands
  }
}
