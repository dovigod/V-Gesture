
import { HandDetector } from './models/HandDetector';
import { Camera } from './models/Camera';
import { DataDomain } from './models/DataDomain';
import { GestureManager } from './models/GestureManager';
import { AbstractGesturePlugin } from './plugins/Plugin';
import { VGestureError } from './error';
import { error, warn } from './utils/console'
import { CANVAS_ELEMENT_ID, LEFT_HAND_CONTAINER_ELEMENT_ID, RIGHT_HAND_CONTAINER_ELEMENT_ID, VIDEO_ELEMENT_ID, WRAPPER_ELEMENT_ID } from './constant'
import { ERROR_TYPE, SESSION_STATE, Handedness } from './types'
import type { OperationKey } from './Gestures/Gesture';
import type { OperationRecord, Helper, VGestureOption } from './types';
import { Stage } from './models/Stage';
import { register } from './utils/prebuilt';
import { isValidPlugin } from './utils/validation/plugin';
import { compatiblizeParam } from './utils/polyfill/plugin';
import { traverse } from './utils/dom';
import { debounce } from './utils/debounce';


// strictly prevents direct call for private method
const $$driverKey = Symbol('driverKey');



export class VGesture {

  /**@ignore */
  public gestureManager: GestureManager
  /**@ignore */
  public gestureTargetCollection!: DataDomain
  private initialized: boolean = false;
  private detector: HandDetector | null = null;
  private camera: Camera | null = null;
  private stage: Stage | null = null;
  private domObserver: MutationObserver;
  private cssomObserver: ResizeObserver;

  private sessionState: SESSION_STATE;
  private frameId: number | null = null;
  //VGestureConfig
  /** @ignore */
  public dataDimension!: 2; // currently only 2 is allowed.
  /** @ignore */
  public helper: Helper | null;


  constructor(options_: VGestureOption = {}) {

    const options = compatiblizeParam(options_);
    // populating configs
    const dataDimension = options?.dataDimension || 2;
    const helper = options?.enableHelper ? {
      colors: options?.helper?.colors || {},
      sizes: options?.helper?.sizes || {},
      hitpoint: options?.helper?.hitpoint || {}
    } : null;

    /**@ignore */
    this.helper = helper as Helper | null;
    /**@ignore */
    this.dataDimension = dataDimension;
    /**@ignore */
    this.gestureManager = new GestureManager()
    /**@ignore */
    this.sessionState = SESSION_STATE.IDLE;
    /**@ignore */
    this.domObserver = new MutationObserver(() => {
      this.flush()
    })
    // to check reflows
    // can't detect transform
    /**@ignore */
    this.cssomObserver = new ResizeObserver(() => {
      debounce(this.flush.bind(this), 200)
    })


  }

  /**
   * 
   * setup required DOM elements & media stream for camera & hand detector
   *  
   */
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

    // check any dom is added or removed, updated.
    this.domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: ['style', 'vgesturable']
    })

    traverse(document.body, (node: Node | ParentNode | HTMLElement) => {
      this.cssomObserver.observe(node as Element);
      // for psuedo events like :hover ... but cant detect when transition attribute isnt presented.
      node.addEventListener('transitionend', this.flush.bind(this))
    })

    this.initialized = true;
    this.sessionState = SESSION_STATE.READY;
  }

  /**
   * 
   * Imperativly update `DataDomain`. recalculate all `vgesturable` position and dimension manually.
   * 
   * 
   * 
   * **NOTE)ts highly recommended to not to change vgesturable element's position after initialize.**
   * But in case need of recalculating elements position, use this function to refresh positions.
   * e.g) language change for global website, responsive website etc..
   */
  async flush() {
    this.gestureTargetCollection.update();
  }


  /**
   * Start Detecting handpose and check whether it matches registered gestures.
   * 
   */
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


  /**
   * Ends detection and clean up session & memory
   * 
   * In order to re-start detection, you must re-instantiate.
   */
  endDetection() {
    if (this.sessionState === SESSION_STATE.FINISHED) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'VGesture.stopDetection', 'Validation Error: Staled session')
    }
    this.sessionState = SESSION_STATE.FINISHED
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.camera!.close();
    this.stage!.disconnect()
    this.gestureManager.disposeAll();
    this._cleanStartedElems();
    this.domObserver.disconnect();
    this.cssomObserver.disconnect();
    this.initialized = false;
  }


  /**
   * Register GesturePlugin to `VGesture`
   */
  register(plugin: AbstractGesturePlugin) {
    const gestureName = plugin.gesture.name;
    const gestureManager = this.gestureManager;
    if (gestureManager.has(gestureName)) {
      warn(`${gestureName} is already registered`);
      return;
    }

    let handlerFunc: ((e: unknown) => void) | undefined;

    const isValid = isValidPlugin(plugin)
    if (!isValid) {
      throw new VGestureError(ERROR_TYPE.VALIDATION, 'VGesture.register', "Validation Error: plugin doesn't match valid interface")
    }

    if (plugin.register) {
      plugin.register(this);
    } else {
      const handlerFunc_ = register(this, plugin)!
      if (handlerFunc_ instanceof Array) {
        handlerFunc = handlerFunc_[0]
      }
    }
    gestureManager.register(plugin, handlerFunc)
  }

  /**
   * 
   * Discard gesture from `VGesture` and clean up related stuff(e.g event listeners) as well.
   */
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
      const direction = hand.handedness === 'Left' ? Handedness.LEFT : Handedness.RIGHT;
      gestureManager.updateHandVertex(direction as Handedness, hand);
      gestureManager.handsVertex.get(direction)?.forEach((vertex) => {
        stage.drawTips(vertex)
      })
      stage.drawHitPoint();
    }

    // get requested operation from gestureManager.
    // if operations is staled (controled by version), refresh 
    gestureManager.version = (gestureManager.version + 1) % 8;
    gestureManager.gestures.forEach((gesture) => {
      let requestedOperations: Record<OperationKey, OperationRecord> | undefined;

      if (gesture.operations && gesture.operations.length > 0) {
        requestedOperations = {};
        for (const key of gesture.operations) {
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
        if ('x' in det && 'y' in det)
          stage.createHitPoint(det);
      }
    })

  }

  private async _generateGestureTargetCollection() {

    this.gestureTargetCollection = new DataDomain([]);
    this.gestureTargetCollection.update()
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
    canvas.style.pointerEvents = 'none'

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
