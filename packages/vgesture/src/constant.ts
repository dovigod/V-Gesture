import type { Color } from "./types";

export const MAXIMUM_SUPPORTED_DIMENSION = 3;
export const FUNCTION_NOTATION = 'func::';
export const VARIABLE_NOTATION = 'var::';
export const WRAPPER_ELEMENT_ID = 'vGesture-canvas-wrapper'
export const VIDEO_ELEMENT_ID = 'vGesture-video';
export const CANVAS_ELEMENT_ID = 'vGesture-stage'
export const LEFT_HAND_CONTAINER_ELEMENT_ID = 'vGesture-scatter-gl-container-left'
export const RIGHT_HAND_CONTAINER_ELEMENT_ID = 'vGesture-scatter-gl-container-right'
export const DEFAULT_TIP_VERTEX_COLOR: Color[] = ['#EAC435', '#345995', '#03CEA4', '#FB4D3D', '#CA1551'];
export const DEFAULT_VERTEX_COLOR = '#0000ff';
export const DEFAULT_TIP_VERTEX_SIZE = 30;
export const DEFAULT_VERTEX_SIZE = 10
export const DEFAULT_HIT_POINT_COLOR = '#B388EB'
export const DEFAULT_HIT_POINT_SIZE = 30;

// These anchor points allow the hand pointcloud to resize according to its
// position in the input.
// const ANCHOR_POINTS = [[0, 0, 0], [0, 0.1, 0], [-0.1, 0, 0], [-0.1, -0.1, 0]];

// const fingerLookupIndices = {
//   thumb: [0, 1, 2, 3, 4],
//   indexFinger: [0, 5, 6, 7, 8],
//   middleFinger: [0, 9, 10, 11, 12],
//   ringFinger: [0, 13, 14, 15, 16],
//   pinky: [0, 17, 18, 19, 20],
// }; // for rendering each finger as a polyline

// const connections = [
//   [0, 1], [1, 2], [2, 3], [3, 4],
//   [0, 5], [5, 6], [6, 7], [7, 8],
//   [0, 9], [9, 10], [10, 11], [11, 12],
//   [0, 13], [13, 14], [14, 15], [15, 16],
//   [0, 17], [17, 18], [18, 19], [19, 20]
// ];