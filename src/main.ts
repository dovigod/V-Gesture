
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import type { MediaPipeHandsMediaPipeModelConfig } from '@tensorflow-models/hand-pose-detection';

import '@tensorflow/tfjs-backend-webgl';
import { STATE } from './params'
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`);
import * as handdetection from '@tensorflow-models/hand-pose-detection';
import { Camera } from './camera'
import { setBackendAndEnvFlags } from './utils';
import { ClickGestureEvent } from './ClickGestureEvent'


declare global {
  interface Window {
    xr_clickables: any
  }
}
let camera: Camera;
let detector: any;
let startInferenceTime: number, numInferences = 0;
let inferenceTimeSum = 0, lastPanelUpdate = 0;

let timer: any = null;
let dispatched: boolean = false;


console.warn = () => { }

async function createDetector() {

  const model = handdetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'mediapipe', // or 'tfjs',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelType: 'full',
  } as MediaPipeHandsMediaPipeModelConfig;

  const detector = await handPoseDetection.createDetector(model, detectorConfig);
  return detector

}


async function app() {

  camera = await Camera.setupCamera(STATE.camera);

  await setBackendAndEnvFlags(STATE.flags, STATE.backend);

  detector = await createDetector();

  renderPrediction();
  init()

};

app();




function beginEstimateHandsStats() {
  startInferenceTime = (performance || Date).now();
}

function endEstimateHandsStats() {
  const endInferenceTime = (performance || Date).now();
  inferenceTimeSum += endInferenceTime - startInferenceTime;
  ++numInferences;

  const panelUpdateMilliseconds = 1000;
  if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
    const averageInferenceTime = inferenceTimeSum / numInferences;
    inferenceTimeSum = 0;
    numInferences = 0;
    lastPanelUpdate = endInferenceTime;
  }
}


async function renderResult() {
  if (camera.video.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(camera.video);
      };
    });
  }

  let hands = null;
  let leftIndexTip: any = null;
  let rightIndexTip: any = null;
  let leftThumbTip: any = null;
  let rightThumbTip: any = null;

  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    // FPS only counts the time it takes to finish estimateHands.
    beginEstimateHandsStats();

    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      hands = await detector.estimateHands(
        camera.video,
        { flipHorizontal: false });
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
    let leftHand: any = null;
    let rightHand: any = null;


    for (const hand of hands) {
      if (hand.handedness === 'Left') {
        rightHand = hand;
      }
      if (hand.handedness === 'Right') {
        leftHand = hand;
      }
    }

    leftIndexTip = getIndexFingerTip(leftHand)
    leftThumbTip = getThumbTip(leftHand);
    rightIndexTip = getIndexFingerTip(rightHand)


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


    endEstimateHandsStats();
  }

  camera.drawCtx();
  camera.drawTips(leftIndexTip, '#ff0000')
  camera.drawTips(leftThumbTip, '#00f0ff')
  // camera.clearCtx()

  // The null check makes sure the UI is not in the middle of changing to a
  // different model. If during model change, the result is from an old model,
  // which shouldn't be rendered.
  if (hands && hands.length > 0) {
    camera.drawResults(hands);
  }
}
async function renderPrediction() {

  await renderResult();

  requestAnimationFrame(renderPrediction);
};


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



function init() {
  const b1 = document.getElementById('btn-1')
  const b2 = document.getElementById('btn-2')
  const b3 = document.getElementById('btn-3')

  const b1Dim = b1?.getBoundingClientRect();
  const b2Dim = b2?.getBoundingClientRect();
  const b3Dim = b3?.getBoundingClientRect();


  // b1Dim = b1Dim
  const b1Top = Math.random() * (window.innerHeight - (b1Dim!.height / 2));
  const b2Top = Math.random() * (window.innerHeight - (b2Dim!.height / 2));
  const b3Top = Math.random() * (window.innerHeight - (b3Dim!.height / 2));

  const b1Left = Math.random() * (window.innerWidth - (b1Dim!.width / 2));
  const b2Left = Math.random() * (window.innerWidth - (b2Dim!.width / 2));
  const b3Left = Math.random() * (window.innerWidth - (b3Dim!.width / 2));

  (b1 as any).style.top = b1Top + 'px';
  (b2 as any).style.top = b2Top + 'px';
  (b3 as any).style.top = b3Top + 'px';

  (b1 as any).style.left = b1Left + 'px';
  (b2 as any).style.left = b2Left + 'px';
  (b3 as any).style.left = b3Left + 'px';


  b1!.dataset.boundary = JSON.stringify({
    top: b1Top,
    left: b1Left,
    dx: b1Dim!.width,
    dy: b1Dim!.height
  })

  b2!.dataset.boundary = JSON.stringify({
    top: b2Top,
    left: b2Left,
    dx: b2Dim!.width,
    dy: b2Dim!.height
  })


  b3!.dataset.boundary = JSON.stringify({
    top: b3Top,
    left: b3Left,
    dx: b3Dim!.width,
    dy: b3Dim!.height
  })

  const pin = document.getElementById('pin')

  window.xr_clickables = [b1, b2, b3];

  window.addEventListener('clickGesture', (e) => {



    pin!.style.top = (e as any).triggerPoint.y + 'px'
    pin!.style.left = (e as any).triggerPoint.x + 'px'

    for (let i = 0; i < window.xr_clickables.length; i++) {
      if (!window.xr_clickables[i].dataset.boundary) {
        continue;
      }
      const boundary = JSON.parse(window.xr_clickables[i].dataset.boundary)

      if (isInterior((e as any).triggerPoint, boundary)) {

        const target = window.xr_clickables[i];

        target.innerHTML = 'Clicked!!!!'
        target.style.transition = 'all 0.3s ease';
        target.style.backgroundColor = '#bb86fc'
        break
      }
    }

  })
}

function isInterior(point: any, boundary: any) {

  return point.x >= boundary.left && point.x <= (boundary.left + boundary.dx) && point.y >= boundary.top && point.y <= (boundary.top + boundary.dy)

}