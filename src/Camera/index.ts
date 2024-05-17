/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as scatter from 'scatter-gl';
import * as params from './params';
import type { Color } from '../types';

// These anchor points allow the hand pointcloud to resize according to its
// position in the input.
const ANCHOR_POINTS = [[0, 0, 0], [0, 0.1, 0], [-0.1, 0, 0], [-0.1, -0.1, 0]];

const fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
}; // for rendering each finger as a polyline

const connections = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20]
];

function createScatterGLContext(selectors: string) {
  const scatterGLEl = document.querySelector(selectors);
  return {
    scatterGLEl,
    scatterGL: new scatter.ScatterGL(scatterGLEl as HTMLElement, {
      'rotateOnStart': true,
      'selectEnabled': false,
      'styles': { polyline: { defaultOpacity: 1, deselectedOpacity: 1 } }
    }),
    scatterGLHasInitialized: false,
  };
}


export class Camera {
  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  hitpoints: any;
  helper!: any;
  static helper: any;
  static ready: boolean = false;
  static scatterGLCtxtLeftHand: any;
  static scatterGLCtxtRightHand: any


  constructor(helper: any) {
    this.video = document.getElementById('vGesture-video')! as HTMLVideoElement;
    this.canvas = document.getElementById('vGesture-stage')! as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.helper = helper;
    this.hitpoints = []
  }

  /**
   * Initiate a Camera instance and wait for the camera stream to be ready.
   * @param cameraParam From app `STATE.camera`.
   */
  static async setupCamera(cameraParam: any) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
    }
    if (Camera.ready) {
      return;
    }


    const scatterGLCtxtLeftHand = createScatterGLContext('#vGesture-scatter-gl-container-left');
    const scatterGLCtxtRightHand = createScatterGLContext('#vGesture-scatter-gl-container-right');

    const { targetFPS } = cameraParam;
    const $size = params.VIDEO_SIZE;
    const videoConfig = {
      'audio': false,
      'video': {
        facingMode: 'user',
        width: $size.width,
        height: $size.height,
        frameRate: {
          ideal: targetFPS,
        }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
    const camera = new Camera(this.helper);
    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(camera.video);
      };
    });

    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    camera.canvas.width = videoWidth;
    camera.canvas.height = videoHeight;
    const canvasContainer = document.getElementById('vGesture-canvas-wrapper') as HTMLElement;
    canvasContainer.style.width = `${videoWidth}px;`
    canvasContainer.style.height = `${videoHeight}px`;

    // Because the image from camera is mirrored, need to flip horizontally.
    camera.ctx.translate(camera.video.videoWidth, 0);
    camera.ctx.scale(-1, 1);

    for (const ctxt of [scatterGLCtxtLeftHand, scatterGLCtxtRightHand]) {
      (ctxt.scatterGLEl as HTMLElement).style.width = `${videoWidth / 2}px`;
      (ctxt.scatterGLEl as HTMLElement).style.height = `${videoHeight / 2}px`;
      ctxt.scatterGL.resize();

      (ctxt.scatterGLEl as HTMLElement).style.display =
        (params.STATE.modelConfig as any).render3D ? 'inline-block' : 'none';
    }

    return camera;
  }


  close() {
    const tracks = (this.video.srcObject as MediaStream).getVideoTracks();
    tracks[0].stop();
    Camera.ready = false;

  }
  createHitPoint(point: any, color: Color) {
    const hitpoint = new HitPoint(this.ctx, point, color);
    this.hitpoints.push(hitpoint)
  }
  drawHitPoint() {
    this.hitpoints.forEach((hitpoint: any) => {
      hitpoint.update();
      hitpoint.draw();
      if (hitpoint.lifespan < 0) {
        this.hitpoints.shift();
      }
    })
  }
  drawTips(tip: any) {
    if (!tip) {
      return;
    }
    let color = null;


    switch (tip.name) {
      case 'thumbTip': {
        color = this.helper['thumbTipColor']
        break;
      }
      case 'indexTip': {
        color = this.helper['indexTipColor']
        break;
      }
      case 'middleTip': {
        color = this.helper['middleTipColor']
        break;
      }
      case 'ringTip': {
        color = this.helper['ringTipColor']
        break;
      }
      case 'pinkyTip': {
        color = this.helper['pinkyTipColor']
        break;
      }
    }

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(tip.x, tip.y, 30, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.closePath()

  }
  drawCtx() {
    this.ctx.drawImage(
      this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
  }

  /**
   * Draw the keypoints on the video.
   * @param hands A list of hands to render.
   */
  drawResults(hands: any) {
    // Sort by right to left hands.
    hands.sort((hand1: any, hand2: any) => {
      if (hand1.handedness < hand2.handedness) return 1;
      if (hand1.handedness > hand2.handedness) return -1;
      return 0;
    });

    // Pad hands to clear empty scatter GL plots.
    while (hands.length < 2) hands.push({});

    for (let i = 0; i < hands.length; ++i) {
      // Third hand and onwards scatterGL context is set to null since we
      // don't render them.
      const ctxt = [Camera.scatterGLCtxtLeftHand, Camera.scatterGLCtxtRightHand][i];
      this.drawResult(hands[i], ctxt);
    }
  }

  /**
   * Draw the keypoints on the video.
   * @param hand A hand with keypoints to render.
   * @param ctxt Scatter GL context to render 3D keypoints to.
   */
  drawResult(hand: any, ctxt: any) {
    if (hand.keypoints != null) {
      this.drawKeypoints(hand.keypoints, hand.handedness);
    }
    // Don't render 3D hands after first two.
    if (ctxt == null) {
      return;
    }
    if (hand.keypoints3D != null && (params.STATE.modelConfig as any).render3D) {
      this.drawKeypoints3D(hand.keypoints3D, hand.handedness, ctxt);
    } else {
      // Clear scatter plot.
      this.drawKeypoints3D([], '', ctxt);
    }
  }

  /**
   * Draw the keypoints on the video.
   * @param keypoints A list of keypoints.
   * @param handedness Label of hand (either Left or Right).
   */
  drawKeypoints(keypoints: any, handedness: any) {
    const keypointsArray = keypoints;
    this.ctx.fillStyle = handedness === 'Left' ? 'Red' : 'Blue';
    this.ctx.strokeStyle = 'White';
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    for (let i = 0; i < keypointsArray.length; i++) {
      const y = keypointsArray[i].x;
      const x = keypointsArray[i].y;
      this.drawPoint(x - 2, y - 2, 3);
    }

    const fingers = Object.keys(fingerLookupIndices);
    for (let i = 0; i < fingers.length; i++) {
      const finger = fingers[i];
      const points = ((fingerLookupIndices as any)[finger] as any).map((idx: any) => keypoints[idx]);
      this.drawPath(points, false);
    }
  }

  drawPath(points: any, closePath: any) {
    const region = new Path2D();
    region.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      region.lineTo(point.x, point.y);
    }

    if (closePath) {
      region.closePath();
    }
    this.ctx.stroke(region);
  }

  drawPoint(y: any, x: any, r: any) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  drawKeypoints3D(keypoints: any, handedness: any, ctxt: any) {
    const scoreThreshold = (params.STATE.modelConfig as any).scoreThreshold || 0;
    const pointsData =
      keypoints.map((keypoint: any) => ([-keypoint.x, -keypoint.y, -keypoint.z]));

    const dataset =
      new scatter.ScatterGL.Dataset([...pointsData, ...ANCHOR_POINTS]);

    ctxt.scatterGL.setPointColorer((i: any) => {
      if (keypoints[i] == null || keypoints[i].score < scoreThreshold) {
        // hide anchor points and low-confident points.
        return '#ffffff';
      }
      return handedness === 'Left' ? '#ff0000' : '#0000ff';
    });

    if (!ctxt.scatterGLHasInitialized) {
      ctxt.scatterGL.render(dataset);
    } else {
      ctxt.scatterGL.updateDataset(dataset);
    }
    const sequences = connections.map(pair => ({ indices: pair }));
    ctxt.scatterGL.setSequences(sequences);
    ctxt.scatterGLHasInitialized = true;
  }
}



class HitPoint {
  point: any;
  r: number;
  g: number;
  b: number;
  lifespan: number;
  ctx: any;
  constructor(ctx: any, point: any, color: Color) {
    this.ctx = ctx
    this.r = parseInt(color.slice(1, 3), 16);
    this.g = parseInt(color.slice(3, 5), 16);
    this.b = parseInt(color.slice(5, 7), 16);
    this.point = point
    this.lifespan = 1;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.point.x, this.point.y, 30, 0, 2 * Math.PI);

    this.ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b} , ${this.lifespan})`;
    this.ctx.fill();
    this.ctx.closePath()
  }

  update() {
    this.lifespan -= 0.01
  }

}