import { KDTree } from './KDTree';
import { Boundary2D, ElementBoundary, Handedness, Color, OperationRecord, ERROR_TYPE } from './types';
import { traverse } from './utils/dom/traverse';
import Fastdom from 'fastdom';
import fastdomPromiseExtension from 'fastdom/extensions/fastdom-promised'
import { error, warn } from './utils/console'
import { HandDetector } from './HandDetector';
import { AbstractGesturePlugin } from './Plugins/Plugin';
import { GestureManager } from './GestureManager';
import { CANVAS_ELEMENT_ID, DEFAULT_TIPS_COLOR, LEFT_HAND_CONTAINER_ELEMENT_ID, RIGHT_HAND_CONTAINER_ELEMENT_ID, VIDEO_ELEMENT_ID, WRAPPER_ELEMENT_ID } from './constant'
import { Camera } from './Camera';
import type { OperationKey } from './Gestures/Gesture';
import { VGestureError } from './error';


const fastdom = Fastdom.extend(fastdomPromiseExtension);
const $$driverKey = Symbol('driverKey');

interface HelperConfig {
  indexTipColor?: Color;
  thumbTipColor?: Color;
  middleTipColor?: Color;
  ringTipColor?: Color;
  pinkyTipColor?: Color;
}
interface VGestureOption {
  handedness?: Handedness;
  dataDimension?: 2;
  helper?: HelperConfig;
}

export class VGesture {

  gestureManager: GestureManager
  gestureTargetCollection!: KDTree
  private initialized: boolean = false;
  private detector: HandDetector | null = null;
  private camera: Camera | null = null;

  private sessionState: number;
  private frameId: number | null = null;
  //VGestureConfig
  handedness!: Handedness;
  dataDimension!: 2; // currently only 2 is allowed.
  helper!: HelperConfig;

  constructor(options?: VGestureOption) {
    // populating configs
    const handedness = options?.handedness || Handedness.LEFT;
    const dataDimension = options?.dataDimension || 2;
    const helper = {
      indexTipColor: options?.helper?.indexTipColor || DEFAULT_TIPS_COLOR[0],
      thumbTipColor: options?.helper?.thumbTipColor || DEFAULT_TIPS_COLOR[1],
      middleTipColor: options?.helper?.middleTipColor || DEFAULT_TIPS_COLOR[2],
      ringTipColor: options?.helper?.ringTipColor || DEFAULT_TIPS_COLOR[3],
      pinkyTipColor: options?.helper?.pinkyTipColor || DEFAULT_TIPS_COLOR[4],
    };

    this.helper = helper;
    this.handedness = handedness;
    this.dataDimension = dataDimension;
    this.gestureManager = new GestureManager()
    this.sessionState = 0;
  }

  async initialize() {
    if (this.initialized) {
      error('Duplicate V-Gesture initialization not allowed')
      return;

    }

    // aggregate and prepare gClickable collection
    await this._generateGestureTargetCollection();

    // create required elems to run V-Gesture
    this._createStarterElems()

    // setup camera and detector model
    this.detector = new HandDetector();
    this.camera = new Camera(this.helper)

    await Camera.setupCamera({ targetFPS: 60 });
    await this.detector.initialize();

    this.initialized = true;
    this.sessionState = 1;
  }

  async startDetection() {
    if (!this.initialized || !this.detector) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, arguments.callee.name, 'Validation Error: V-Gesture not initialized')
    }
    if (this.sessionState === -1) {
      throw new VGestureError(ERROR_TYPE.NOT_ALLOWED, arguments.callee.name, 'Cannot reuse VGesture session. Please re-instantiate')
    }
    this.sessionState = 2;
    const self = this;
    async function _() {
      await self.task($$driverKey)
      self.frameId = requestAnimationFrame(_);
    }
    _();

  }

  stopDetection() {
    if (!this.initialized) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, arguments.callee.name, 'Validation Error: V-Gesture not initialized')
    }
    this.sessionState = -1
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.camera!.close();
    this.gestureManager.disposeAll();
    this._cleanStartedElems();
    this.initialized = false;
  }

  register(plugin: AbstractGesturePlugin) {
    const gestureName = plugin.gesture.name;
    const gestureManager = this.gestureManager;
    console.log(gestureManager)
    if (gestureManager.has(gestureName)) {
      warn(`${gestureName} is already registered`);
      return;
    }
    plugin.register(this);
    gestureManager.register(plugin)
  }

  unregister(gestureName: string) {
    this.gestureManager.dispose(gestureName)
  }

  private async task(key: Symbol) {
    if (key !== $$driverKey) {
      throw new VGestureError(ERROR_TYPE.NOT_ALLOWED, arguments.callee.name, 'executing task directly is not allowed');
    }

    const detector = this.detector!;
    const camera = this.camera!;
    const gestureManager = this.gestureManager

    // for smooth vanishing
    camera.clearCtx();
    camera.drawHitPoint();

    // predict result
    const hands = await detector.predict(camera);

    if (!hands) {
      return;
    }

    // update hand vertex
    for (const hand of hands) {
      const direction = hand.handedness === 'Right' ? Handedness.LEFT : Handedness.RIGHT;
      gestureManager.updateHandVertex(direction as Handedness, hand);
      gestureManager.handsVertex.get(direction)?.forEach((vertex) => {
        camera.drawTips(vertex)
      })
      camera.drawHitPoint();
    }

    // get requested operation from gestureManager.
    // if requestedOperation is staled (controled by version), refresh 
    gestureManager.version = (gestureManager.version + 1) % 8;
    gestureManager.gestures.forEach((gesture) => {
      let requestedOperations: Record<OperationKey, OperationRecord> | undefined;

      if (gesture.operationsRequest && gesture.operationsRequest.length > 0) {
        requestedOperations = {};
        for (const key of gesture.operationsRequest) {
          let value: any;
          const record = gestureManager.sharedOperations.get(key)

          if (record) {
            if (record.version !== gestureManager.version) {
              record.value = record.operation();
              record.version++;
              gestureManager.sharedOperations.set(key, record)
              value = record.value;
            } else {
              value = record.value
            }
            requestedOperations[key] = value;
          }
        }
      }

      const det = gesture.determinant(hands, requestedOperations)
      if (det) {
        this.camera?.createHitPoint(det, gesture.triggerPointColor || '#000000');
      }
    })

  }

  private async _generateGestureTargetCollection() {
    const PREFIX = 'g-clickable-element'
    const elemBoundaries: ElementBoundary[] = []
    let id = 0;

    await fastdom.mutate(() => {
      // traverse from  Dom tree, rooting from body node, find all elems with gClickable specified elements
      // create kdtree to handle event target domain
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
      const gestureTargetCollection = new KDTree(elemBoundaries);
      this.gestureTargetCollection = new Proxy(gestureTargetCollection, { set: () => false })
    })
  }

  private _createStarterElems() {
    // create video , canvas element to detect & draw scene
    const wrapper = document.createElement('div');
    const video = document.createElement('video')
    const canvas = document.createElement('canvas');
    const leftHandContainer = document.createElement('div');
    const rightHandContainer = document.createElement('div');
    leftHandContainer.id = LEFT_HAND_CONTAINER_ELEMENT_ID
    rightHandContainer.id = RIGHT_HAND_CONTAINER_ELEMENT_ID
    video.id = VIDEO_ELEMENT_ID
    canvas.id = CANVAS_ELEMENT_ID
    wrapper.id = WRAPPER_ELEMENT_ID
    leftHandContainer.style.float = 'left'
    rightHandContainer.style.float = 'left'
    leftHandContainer.style.position = 'relative'
    rightHandContainer.style.position = 'relative'
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0px';
    wrapper.style.left = '0px';
    wrapper.style.zIndex = '99999';
    video.playsInline = true;
    video.style.visibility = 'hidden';
    video.style.position = 'absolute';
    video.style.transform = 'scaleX(-1)'
    canvas.style.zIndex = '99999';
    canvas.style.position = 'absolute';

    wrapper.appendChild(leftHandContainer);
    wrapper.appendChild(rightHandContainer)
    wrapper.appendChild(video);
    wrapper.appendChild(canvas);
    document.body.appendChild(wrapper)
  }

  private _cleanStartedElems() {
    const wrapper = document.getElementById(WRAPPER_ELEMENT_ID);
    if (wrapper) {
      wrapper.remove()
    }
  }
}