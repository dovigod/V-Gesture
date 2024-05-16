import type { Hand, HandDetector as HandPoseDetector } from "@tensorflow-models/hand-pose-detection";
import { createDetector } from "../tensorflow/detector";
import { setBackendAndEnvFlags } from "../tensorflow/backend";
import { error } from "../utils/console";
import { Camera } from "../Camera";
import { ClickGestureEvent } from "../ClickGestureEvent";

let dispatched: any;
let timer: any;

export class HandDetector {

  private predictionId: number | null = null;
  public detector: HandPoseDetector | null = null;
  public camera: Camera | null = null;
  private initialized: boolean = false;

  constructor() {
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
    const camera = new Camera();
    this.camera = new Proxy(camera, cameraInterceptors);
    await Camera.setupCamera({ targetFPS: 60 });

    // wasm-backend
    await setBackendAndEnvFlags({}, '');

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

    let leftHand: Hand;
    let rightHand: Hand;
    let leftIndexTip: any = null;
    let rightIndexTip: any = null;
    let leftThumbTip: any = null;
    let rightThumbTip: any = null;

    for (const hand of hands) {
      if (hand.handedness === 'Left') {
        rightHand = hand;
      }
      if (hand.handedness === 'Right') {
        leftHand = hand;
      }
    }

    leftIndexTip = getIndexFingerTip(leftHand!)
    leftThumbTip = getThumbTip(leftHand!);
    rightIndexTip = getIndexFingerTip(rightHand!)

    if (leftIndexTip && leftThumbTip) {
      const distance = getGestureClickDistance(leftIndexTip, leftThumbTip);

      //magic
      if (distance < 1200) {

        if (timer) {
          return;
        }
        if (!dispatched) {
          window.dispatchEvent(new ClickGestureEvent('clickGesture', {
            indexTip: leftIndexTip,
            thumbTip: leftThumbTip,
          }))
          dispatched = true;
          timer = setTimeout(() => {
            timer = null
          }, 500)
        }


      } else {
        dispatched = false
      }
    }


  }

}

function getIndexFingerTip(hand: any) {
  if (!hand) {
    return null;
  }
  return hand.keypoints.find((keypoint: any) => keypoint.name === 'index_finger_tip')
}

function getThumbTip(hand: any) {
  if (!hand) {
    return null;
  }
  return hand.keypoints.find((keypoint: any) => keypoint.name === 'thumb_tip')
}


function getGestureClickDistance(keypoint1: any, keypoint2: any) {
  return Math.pow(keypoint1.x - keypoint2.x, 2) + Math.pow(keypoint1.y - keypoint2.y, 2);
}