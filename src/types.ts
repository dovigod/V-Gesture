


//NOTE) coordinates refers center of element, not top left of element.
//x, y
export type Vector2D = [number, number];
//x, y, z
export type Vector3D = [number, number, number];
//x, y, dx ,dy
export type Boundary2D = [number, number, number, number]
//x, y, z, dx, dy, dz
export type Boundary3D = [number, number, number, number, number, number];
// export type Point<Dimension, T extends Number[] = []> = Dimension extends T['length'] ? T : Point<Dimension, [...T, Number]>

export type Point = (Vector2D | Vector3D);
export type Boundary = (Boundary2D | Boundary3D)
export interface ElementBoundary {
  id: string;
  dimension: number;
  boundary: Boundary;
}


export type RenderedElement<T extends Node> = T
export type HTMLValidElement = HTMLDivElement | HTMLAnchorElement | HTMLAnchorElement | HTMLAreaElement | HTMLAudioElement | HTMLBRElement | HTMLBaseElement | HTMLBodyElement | HTMLButtonElement | HTMLCanvasElement | HTMLDListElement | HTMLDetailsElement | HTMLDialogElement | HTMLFieldSetElement | HTMLFormControlsCollection | HTMLFormElement | HTMLFrameSetElementEventMap | HTMLHRElement | HTMLHeadingElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLLIElement | HTMLLegendElement | HTMLLabelElement | HTMLLinkElement | HTMLMapElement | HTMLMediaElement | HTMLMenuElement | HTMLObjectElement | HTMLOptGroupElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLProgressElement | HTMLQuoteElement | HTMLSelectElement | HTMLSlotElement | HTMLSpanElement | HTMLTableCaptionElement | HTMLTableCellElement | HTMLTableColElement | HTMLTableElement | HTMLTableElement | HTMLTableRowElement | HTMLTableSectionElement | HTMLTextAreaElement | HTMLTimeElement | HTMLTitleElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement | HTMLOrSVGElement | HTMLOrSVGImageElement | Node;

export type OperationRequestType = 'variable' | 'function'
export enum Handedness {
  LEFT = 'left',
  RIGHT = 'right',
}

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;
export type Color = RGB | RGBA | HEX;


export interface HandVertex {
  name: string,
  x: number,
  y: number,
  z?: number
}

export interface OperationRecord {
  used: number;
  version: number;
  operation: () => unknown;
  value: unknown | null;
}


export type FunctionOperationReciept = {
  type: OperationRequestType;
  func: (arg?: unknown, ...arg2: unknown[]) => unknown;
  vars: string[]
}
export type VariableOperationReciept = {
  type: OperationRequestType;
  vars: string
}
export type OperationReciept = FunctionOperationReciept | VariableOperationReciept

export enum ERROR_TYPE {
  VALIDATION = 'validation-error',
  UNKNOWN = 'unknown-error',
  PREDICTION = 'prediction-error',
  UNSUPPORT = 'unsupport-error',
  NOT_ALLOWED = 'not-allowed-error'
}

export enum SESSION_STATE {
  IDLE = 'idle',
  READY = 'ready',
  RUNNING = 'running',
  FINISHED = 'finished'
}

export type UsedKeypointName = 'indexTip' | 'thumbTip' | 'middleTip' | 'ringTip' | 'pinkyTip' | 'wrist' | 'thumbCmc' | 'thumbIp' | 'indexMcp' | 'indexPip' | 'indexDip' | 'middleMcp' | 'middlePip' | 'middleDip' | 'ringMcp' | 'ringPip' | 'ringDip' | 'pinkyMcp' | 'pinkyPip' | 'pinkyDip'
export interface Helper {
  colors: Record<UsedKeypointName, Color | undefined>;
  sizes: Record<UsedKeypointName, number | undefined>;
  hitpoint: {
    color?: Color;
    size?: number
  }
}
export interface Coord2D {
  x: number | null;
  y: number | null;
}

export interface Tip extends Coord2D {
  name: string;
}