import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as handdetection from '@tensorflow-models/hand-pose-detection';
import type { MediaPipeHandsMediaPipeModelConfig } from '@tensorflow-models/hand-pose-detection';

export async function createDetector() {
  const model = handdetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'mediapipe', // or 'tfjs',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelType: 'full',
  } as MediaPipeHandsMediaPipeModelConfig;

  const detector = await handPoseDetection.createDetector(model, detectorConfig);
  return detector
}