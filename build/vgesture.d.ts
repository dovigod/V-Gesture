import { Hand } from '@tensorflow-models/hand-pose-detection';

type Vector2D = [number, number];
type Vector3D = [number, number, number];
type Boundary2D = [number, number, number, number];
type Boundary3D = [number, number, number, number, number, number];
type Boundary = (Boundary2D | Boundary3D);
interface ElementBoundary {
    id: string;
    dimension: number;
    boundary: Boundary;
}
declare enum Handedness {
    LEFT = "left",
    RIGHT = "right"
}
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;
type Color = RGB | RGBA | HEX;
interface HandVertex {
    name: string;
    x: number;
    y: number;
    z?: number;
}
interface OperationRecord {
    used: number;
    version: number;
    operation: () => unknown;
    value: unknown | null;
}
type UsedKeypointName = 'indexTip' | 'thumbTip' | 'middleTip' | 'ringTip' | 'pinkyTip' | 'wrist' | 'thumbCmc' | 'thumbIp' | 'indexMcp' | 'indexPip' | 'indexDip' | 'middleMcp' | 'middlePip' | 'middleDip' | 'ringMcp' | 'ringPip' | 'ringDip' | 'pinkyMcp' | 'pinkyPip' | 'pinkyDip';
interface Helper {
    colors: Record<UsedKeypointName, Color | undefined>;
    sizes: Record<UsedKeypointName, number | undefined>;
    hitpoint: {
        color?: Color;
        size?: number;
    };
}
interface HelperConfig {
    hitpoint?: {
        color?: Color;
        size?: number;
    };
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
    };
}
interface VGestureOption {
    handedness?: Handedness;
    dataDimension?: 2;
    disableHelper?: Boolean;
    helper?: HelperConfig;
}

declare class DataDomain {
    private _originalData;
    size: number;
    dimension: number;
    private _searchTree;
    baseCoord: number[];
    [Symbol.iterator](): {
        next: () => {
            value: ElementBoundary;
            done: boolean;
        };
    };
    constructor(data: ElementBoundary[], dimension?: number);
    searchClosest(pivot: Vector2D | Vector3D): ElementBoundary | undefined;
    /** take a snapshot of original 'data' and create searchTree filled with valid data sets(which is actual candidates of target element)  */
    private _createSearchTree;
}

type OperationKey = `${"func::" | "var::"}${string}`;
interface AbstractGesture {
    /**
     * name of gesture
     */
    name: string;
    /**
     * name of event which will be dispatched if user acts Gesture
     */
    eventName: string;
    /**
     *
     * determinate current user's gesture does matches this Gesture
     * if matches, return any truth value, otherwise, false
     */
    determinant(hands: Hand[], requestedOperations?: Record<OperationKey, any>): any | boolean;
    /**
     * handler function when %eventName% is emitted to Window object
     * Normally used for handling events or to dispatch native event as a chain
     */
    handler(event: unknown, dataDomain: DataDomain, triggerHelperElem?: HTMLElement): void;
    /**
     * provided operations will be cached and forwarded during determinant call.
     * this is used to share operations among each gesture determinance.
     * e.g)
     * function request = func::functionName-arg1-arg2
     * variable request = var::var1
     *
     * NOTE) each functionName , args , vars should be knowned values check following link
     *
     *
     */
    operationsRequest?: OperationKey[];
    /**
     * active hand which used for dectecting gesture
     */
    usedHand: Handedness;
}

/**
 *  An **Plugin** is used provide Gesture to V-Gesture as Plugin
 *  without adding backwards-incompatible changes
 */
interface AbstractGesturePlugin {
    gesture: AbstractGesture;
    /**
     *
     *
     * update func
     * listerner,
     * garbage collectings
     */
    register: (gestureManager: VGesture) => VGesture;
    /**
     *
     * used when cleaning up gracefully.
     * e.g) removing event listeners etc..
     */
    unregister: () => void;
}

/**
 * An GestureManager is used to manage connection between Gestures and others.
 * Also supports sharing operation results among gestures.
 */
declare class GestureManager {
    gestures: Map<string, AbstractGesture>;
    gestureGC: Map<string, () => void>;
    sharedOperations: Map<string, OperationRecord>;
    handsVertex: Map<Handedness, Map<string, HandVertex>>;
    version: number;
    constructor();
    has(key: string): boolean;
    register(plugin: AbstractGesturePlugin): void;
    dispose(gestureName: string): void;
    disposeAll(): void;
    updateHandVertex(handDirection: Handedness, hand: Hand): void;
    /**
     * creates operationRecords for caching.
     */
    private _registerOperation;
    private _operationFactory;
}

declare class VGesture {
    gestureManager: GestureManager;
    gestureTargetCollection: DataDomain;
    private initialized;
    private detector;
    private camera;
    private stage;
    private sessionState;
    private frameId;
    dataDimension: 2;
    helper: Helper | null;
    constructor(options?: VGestureOption);
    initialize(): Promise<void>;
    startDetection(): Promise<void>;
    endDetection(): void;
    register(plugin: AbstractGesturePlugin): void;
    unregister(gestureName: string): void;
    private task;
    private _generateGestureTargetCollection;
    private _createStarterElems;
    private _cleanStartedElems;
}

export { VGesture };
