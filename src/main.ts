
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

let camera: Camera;
let detector: any;
let startInferenceTime: number, numInferences = 0;
let inferenceTimeSum = 0, lastPanelUpdate = 0;


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

    const leftIndexTip = getIndexFingerTip(leftHand)
    const rightIndexTip = getIndexFingerTip(rightHand)

    if (leftIndexTip) {
      console.log(leftIndexTip)
    }

    endEstimateHandsStats();
  }

  camera.drawCtx();

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