
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
import { KDTree } from './KDTree';
import { Boundary2D, ElementBoundary } from './types';
import { traverse } from './dom/traverse'
import fastdomPromiseExtension from 'fastdom/extensions/fastdom-promised'
import Fastdom from 'fastdom';


const debug = console.log.bind(console, '[V-Gesture]');
const fastdom = Fastdom.extend(fastdomPromiseExtension);
declare global {
  interface Window {
    xr_clickables: any
  }
  interface NamedNodeMap {
    gClickable?: string
  }
}
let camera: Camera;
let detector: any;
let startInferenceTime: number, numInferences = 0;
let inferenceTimeSum = 0, lastPanelUpdate = 0;

let timer: any = null;
let dispatched: boolean = false;
let kdTree: KDTree;

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

  initialize()
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

  // camera.drawCtx();
  camera.clearCtx()
  camera.drawTips(leftIndexTip, '#ff0000')
  camera.drawTips(leftThumbTip, '#00f0ff')

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





async function initialize() {

  const PREFIX = 'g-clickable-element'
  const elemBoundaries: ElementBoundary[] = []
  let id = 0;

  await fastdom.mutate(() => {
    // traverse sub Dom tree root of body node, and find all elems with gClickable specified elements
    // then create kdtree to handle event target domain
    traverse(document.body, (elem) => {
      if ((elem as HTMLElement).hasAttribute('gClickable')) {
        const clickableElem = elem as HTMLElement
        const { top, left, width, height } = clickableElem.getBoundingClientRect();
        let elemId = clickableElem.id;

        if (!elemId) {
          elemId = `${PREFIX}-${id}`
          id++;
        }

        clickableElem.id = elemId;

        const x = left + width / 2;
        const y = top + height / 2;
        const dx = width / 2;
        const dy = height / 2;
        const boundary = [x, y, dx, dy] as Boundary2D;
        const ElementBoundary = {
          id: elemId,
          dimension: boundary.length / 2,
          boundary
        }

        elemBoundaries.push(ElementBoundary)
      }
    })

    kdTree = new KDTree(elemBoundaries);
  })



  const pin = document.getElementById('pin')



  window.addEventListener('clickGesture', (e: any) => {
    pin!.style.top = (e as any).triggerPoint.y + 'px'
    pin!.style.left = (e as any).triggerPoint.x + 'px'
    const nodeId = kdTree.emit([e.triggerPoint.x, e.triggerPoint.y])
    if (nodeId) {
      const node = document.getElementById(nodeId);
      node?.dispatchEvent(new Event('click'));
    }
  })
}