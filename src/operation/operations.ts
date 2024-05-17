import type { Keypoint } from "@tensorflow-models/hand-pose-detection";
import type { HandVertex } from "../types";

function get2FingerDistance(keypoint1: any, keypoint2: any) {
  if (!keypoint1 || !keypoint2) {
    return NaN
  }
  return Math.pow(keypoint1.x - keypoint2.x, 2) + Math.pow(keypoint1.y - keypoint2.y, 2);
}
export function getIndexFingerTip(hand: any) {
  if (!hand) {
    return null;
  }
  return hand.keypoints.find((keypoint: any) => keypoint.name === 'index_finger_tip')
}
export function getThumbTip(hand: any) {
  if (!hand) {
    return null;
  }
  return hand.keypoints.find((keypoint: any) => keypoint.name === 'thumb_tip')
}

export function getVertex(keypoint: Keypoint, fingerName: string): HandVertex | null {
  if (!keypoint) {
    return null;
  }
  // const keypoint = .keypoints.find((keypoint: any) => keypoint.name === fingerName);

  let name: string = '';
  switch (fingerName) {
    case 'wrist': {
      name = fingerName
      break;
    }
    case 'thumb_cmc': {
      name = 'thumbCmc'
      break;
    }
    case 'thumb_mcp': {
      name = 'thumbMcp'
      break;
    }
    case 'thumb_ip': {
      name = 'thumbIp'
      break;
    }
    case 'thumb_tip': {
      name = 'thumbTip'
      break;
    }
    case 'index_finger_mcp': {
      name = 'indexMcp'
      break;
    }
    case 'index_finger_pip': {
      name = 'indexPcp'
      break;
    }
    case 'index_finger_dip': {
      name = 'indexDip'
      break;
    }
    case 'index_finger_tip': {
      name = 'indexTip'
      break;
    }
    case 'middle_finger_mcp': {
      name = 'middleMcp'
      break;
    }
    case 'middle_finger_pip': {
      name = 'middlePcp'
      break;
    }
    case 'middle_finger_dip': {
      name = 'middleDip'
      break;
    }
    case 'middle_finger_tip': {
      name = 'middleTip'
      break;
    }
    case 'ring_finger_mcp': {
      name = 'ringMcp'
      break;
    }
    case 'ring_finger_pip': {
      name = 'ringPcp'
      break;
    }
    case 'ring_finger_dip': {
      name = 'ringDip'
      break;
    }
    case 'ring_finger_tip': {
      name = 'ringTip'
      break;
    }
    case 'pinky_finger_mcp': {
      name = 'pinkyMcp'
      break;
    }
    case 'pinky_finger_pip': {
      name = 'pinkyPcp'
      break;
    }
    case 'pinky_finger_dip': {
      name = 'pinkyDip'
      break;
    }
    case 'pinky_finger_tip': {
      name = 'pinkyTip'
      break;
    }
  }
  return keypoint ? {
    name,
    x: keypoint.x,
    y: keypoint.y
  } : null
}

export const operations: Record<string, any> = {
  get2FingerDistance
}