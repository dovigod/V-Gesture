


//NOTE) coordinates refers center of element, not top left of element.
//x, y
/**@ignore */
export type Vector2D = [number, number];
//x, y, z
/**@ignore */
export type Vector3D = [number, number, number];
//x, y, dx ,dy
/**@ignore */
export type Boundary2D = [number, number, number, number]
//x, y, z, dx, dy, dz
/**@ignore */
export type Boundary3D = [number, number, number, number, number, number];
// export type Point<Dimension, T extends Number[] = []> = Dimension extends T['length'] ? T : Point<Dimension, [...T, Number]>

export type VectorLike2D = { x: number, y: number }
/**@ignore */
export type Point = (Vector2D | Vector3D);
export type Boundary = (Boundary2D | Boundary3D)
export interface ElementBoundary {
  id: string;
  dimension: number;
  boundary: Boundary;
}

/**@ignore */
export type RenderedElement<T extends Node> = T
/**@ignore */
export type HTMLValidElement = HTMLDivElement | HTMLAnchorElement | HTMLAnchorElement | HTMLAreaElement | HTMLAudioElement | HTMLBRElement | HTMLBaseElement | HTMLBodyElement | HTMLButtonElement | HTMLCanvasElement | HTMLDListElement | HTMLDetailsElement | HTMLDialogElement | HTMLFieldSetElement | HTMLFormControlsCollection | HTMLFormElement | HTMLFrameSetElementEventMap | HTMLHRElement | HTMLHeadingElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLLIElement | HTMLLegendElement | HTMLLabelElement | HTMLLinkElement | HTMLMapElement | HTMLMediaElement | HTMLMenuElement | HTMLObjectElement | HTMLOptGroupElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLProgressElement | HTMLQuoteElement | HTMLSelectElement | HTMLSlotElement | HTMLSpanElement | HTMLTableCaptionElement | HTMLTableCellElement | HTMLTableColElement | HTMLTableElement | HTMLTableElement | HTMLTableRowElement | HTMLTableSectionElement | HTMLTextAreaElement | HTMLTimeElement | HTMLTitleElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement | HTMLOrSVGElement | HTMLOrSVGImageElement | Node;
/**@ignore */
export type OperationRequestType = 'variable' | 'function'
export enum Handedness {
  LEFT = 'left',
  RIGHT = 'right',
}
/**@ignore */
type RGB = `rgb(${number}, ${number}, ${number})`;
/**@ignore */
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
/**@ignore */
type HEX = `#${string}`;
/**@ignore */
export type Color = RGB | RGBA | HEX;

/**@ignore */
export interface HandVertex {
  name: string,
  x: number,
  y: number,
  z?: number
}
/**@ignore */
export interface OperationRecord {
  used: number;
  version: number;
  operation: () => unknown;
  value: unknown | null;
}

/**@ignore */
export type FunctionOperationReciept = {
  type: OperationRequestType;
  func: (arg?: unknown, ...arg2: unknown[]) => unknown;
  vars: string[]
}
/**@ignore */
export type VariableOperationReciept = {
  type: OperationRequestType;
  vars: string
}

/**@ignore */
export type OperationReciept = FunctionOperationReciept | VariableOperationReciept
/**@ignore */
export enum ERROR_TYPE {
  VALIDATION = 'validation-error',
  UNKNOWN = 'unknown-error',
  PREDICTION = 'prediction-error',
  UNSUPPORT = 'unsupport-error',
  NOT_ALLOWED = 'not-allowed-error'
}
/**@ignore */
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
/**@ignore */
export interface Coord2D {
  x: number | null;
  y: number | null;
}
/**@ignore */
export interface Tip extends Coord2D {
  name: string;
}

/**@ignore */
export interface HelperConfig {
  hitpoint?: {
    color?: Color;
    size?: number
  }
  colors?: {
    indexTip?: Color;
    thumbTip?: Color;
    middleTip?: Color;
    ringTip?: Color;
    pinkyTip?: Color;
    wrist?: Color;
    thumbCmc?: Color;
    thumbIp?: Color;
    indexMcp?: Color;
    indexPip?: Color;
    indexDip?: Color;
    middleMcp?: Color;
    middlePip?: Color;
    middleDip?: Color;
    ringMcp?: Color;
    ringPip?: Color;
    ringDip?: Color;
    pinkyMcp?: Color;
    pinkyPip?: Color;
    pinkyDip?: Color;
  };
  sizes?: {
    indexTip?: number;
    thumbTip?: number;
    middleTip?: number;
    ringTip?: number;
    pinkyTip?: number;
    wrist?: number;
    thumbCmc?: number;
    thumbIp?: number;
    indexMcp?: number;
    indexPip?: number;
    indexDip?: number;
    middleMcp?: number;
    middlePip?: number;
    middleDip?: number;
    ringMcp?: number;
    ringPip?: number;
    ringDip?: number;
    pinkyMcp?: number;
    pinkyPip?: number;
    pinkyDip?: number;
  }
}
export interface VGestureOption {
  dataDimension?: 2;
  enableHelper?: Boolean;
  helper?: HelperConfig;
}