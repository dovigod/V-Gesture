import Fastdom from 'fastdom';
import fastdomPromiseExtension from 'fastdom/extensions/fastdom-promised'
import { HandDetector } from './models/HandDetector';
import { Camera } from './models/Camera';
import { DataDomain } from './models/DataDomain';
import { GestureManager } from './models/GestureManager';
import { AbstractGesturePlugin } from './plugins/Plugin';
import { VGestureError } from './error';
import { traverse } from './utils/dom/traverse';
import { error, warn } from './utils/console'
import { CANVAS_ELEMENT_ID, LEFT_HAND_CONTAINER_ELEMENT_ID, RIGHT_HAND_CONTAINER_ELEMENT_ID, VIDEO_ELEMENT_ID, WRAPPER_ELEMENT_ID } from './constant'
import { ERROR_TYPE, SESSION_STATE, Handedness } from './types'
import type { OperationKey } from './Gestures/Gesture';
import type { Boundary2D, ElementBoundary, OperationRecord, Helper, VGestureOption } from './types';
import { Stage } from './models/Stage';


const fastdom = Fastdom.extend(fastdomPromiseExtension);
const $$driverKey = Symbol('driverKey');



export class VGesture {
  public gestureManager: GestureManager
  public gestureTargetCollection!: DataDomain
  private initialized: boolean = false;
  private detector: HandDetector | null = null;
  private camera: Camera | null = null;
  private stage: Stage | null = null;

  private sessionState: SESSION_STATE;
  private frameId: number | null = null;
  //VGestureConfig
  public dataDimension!: 2; // currently only 2 is allowed.
  public helper: Helper | null;

  constructor(options?: VGestureOption) {
    // populating configs
    const dataDimension = options?.dataDimension || 2;
    const helper = options?.disableHelper ? null : {
      colors: options?.helper?.colors || {},
      sizes: options?.helper?.sizes || {},
      hitpoint: options?.helper?.hitpoint || {}
    };

    this.helper = helper as Helper | null;
    this.dataDimension = dataDimension;
    this.gestureManager = new GestureManager()
    this.sessionState = SESSION_STATE.IDLE;
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
    this.camera = await Camera.setupCamera({ targetFPS: 60 }) as Camera;
    this.stage = new Stage(this.helper);


    await this.detector.initialize();

    this.initialized = true;
    this.sessionState = SESSION_STATE.READY;
  }

  async startDetection() {
    if (!this.initialized || !this.detector) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'VGesture.startDetection', 'Validation Error: V-Gesture not initialized')
    }
    if (this.sessionState === SESSION_STATE.FINISHED) {
      throw new VGestureError(ERROR_TYPE.NOT_ALLOWED, 'VGesture.startDetection', 'Cannot reuse VGesture session. Please re-instantiate')
    }
    this.sessionState = SESSION_STATE.RUNNING;
    const self = this;
    async function _() {
      await self.task($$driverKey)
      self.frameId = requestAnimationFrame(_);
    }
    _();

  }

  endDetection() {
    if (!this.initialized) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'VGesture.stopDetection', 'Validation Error: V-Gesture not initialized')
    }
    this.sessionState = SESSION_STATE.FINISHED
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.camera!.close();
    this.stage!.disconnect()
    this.gestureManager.disposeAll();
    this._cleanStartedElems();
    this.initialized = false;
  }

  register(plugin: AbstractGesturePlugin) {
    const gestureName = plugin.gesture.name;
    const gestureManager = this.gestureManager;
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
      throw new VGestureError(ERROR_TYPE.NOT_ALLOWED, 'VGesture.task', 'executing task directly is not allowed');
    }

    const detector = this.detector!;
    const camera = this.camera!;
    const stage = this.stage!;
    const gestureManager = this.gestureManager;

    if (!camera.ready) {
      return;
    }

    // for smooth vanishing
    stage.clearCtx();
    // stage.drawVideo(camera.video)
    stage.drawHitPoint();

    // predict result
    let hands;

    try {
      hands = await detector.predict(camera)
    } catch (error: unknown) {
      if (error instanceof VGestureError && error.type === ERROR_TYPE.PREDICTION) {
        this.endDetection();
      }
      throw error
    }

    if (!hands) {
      return;
    }

    // update hand vertex
    for (const hand of hands) {
      const direction = hand.handedness === 'Right' ? Handedness.LEFT : Handedness.RIGHT;
      gestureManager.updateHandVertex(direction as Handedness, hand);
      gestureManager.handsVertex.get(direction)?.forEach((vertex) => {
        stage.drawTips(vertex)
      })
      stage.drawHitPoint();
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
        stage.createHitPoint(det);
      }
    })

  }

  private async _generateGestureTargetCollection() {
    const PREFIX = 'vgesturable'
    const elemBoundaries: ElementBoundary[] = []
    let id = 0;

    await fastdom.mutate(() => {
      // traverse from  Dom tree, rooting from body node, find all elems with gClickable specified elements
      // create kdtree to handle event target domain
      traverse(document.body, (elem) => {
        if ((elem as HTMLElement).hasAttribute('vgesturable')) {
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
      this.gestureTargetCollection = new DataDomain(elemBoundaries);
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
    video.muted = true;
    video.style.visibility = 'hidden';
    video.style.position = 'absolute';
    video.style.transform = 'scaleX(-1)'
    canvas.style.zIndex = '99999';
    canvas.style.position = 'fixed';
    canvas.style.display = 'block'

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