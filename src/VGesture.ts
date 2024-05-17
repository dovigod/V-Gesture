import { KDTree } from './KDTree';
import { Boundary2D, ElementBoundary, Handedness, Color } from './types';
import { traverse } from './utils/dom/traverse';
import Fastdom from 'fastdom';
import fastdomPromiseExtension from 'fastdom/extensions/fastdom-promised'
import { error, warn } from './utils/console'
import { HandDetector } from './HandDetector';
import { AbstractGesturePlugin } from './Plugins/Plugin';
import { GestureManager } from './GestureManager';


const DEFAULT_TIPS_COLOR: Color[] = ['#EAC435', '#345995', '#03CEA4', '#FB4D3D', '#CA1551'];
const fastdom = Fastdom.extend(fastdomPromiseExtension);

interface HelperConfig {
  indexTipColor?: Color;
  thumbTipColor?: Color;
  middleTipColor?: Color;
  ringTipColor?: Color;
  pinkyTipColor?: Color;
}
interface VGestureOption {
  handedness?: Handedness;
  dimension?: 2;
  helper?: HelperConfig;
}

export class VGesture {

  gestureManager: GestureManager
  gestureTargetCollection!: KDTree
  private initialized: boolean = false;
  private detector: HandDetector | null = null;

  //VGestureConfig
  handedness!: Handedness;
  dimension!: 2; // currently only 2 is allowed.
  helper!: HelperConfig;

  constructor(options?: VGestureOption) {
    // populating configs
    const handedness = options?.handedness || Handedness.LEFT;
    const dimension = options?.dimension || 2;
    const helper = {
      indexTipColor: options?.helper?.indexTipColor || DEFAULT_TIPS_COLOR[0],
      thumbTipColor: options?.helper?.thumbTipColor || DEFAULT_TIPS_COLOR[1],
      middleTipColor: options?.helper?.middleTipColor || DEFAULT_TIPS_COLOR[2],
      ringTipColor: options?.helper?.ringTipColor || DEFAULT_TIPS_COLOR[3],
      pinkyTipColor: options?.helper?.pinkyTipColor || DEFAULT_TIPS_COLOR[4],
    };

    this.helper = helper;
    this.handedness = handedness;
    this.dimension = dimension;
    this.gestureManager = new GestureManager()


  }

  async initialize() {
    if (this.initialized) {
      error('Duplicate V-Gesture initialization not allowed')
      return;

    }

    // aggregate and prepare gClickable collection
    await this._generateGestureTargetCollection();

    // setup prepare camera and detector model
    this.detector = new HandDetector(this.gestureManager);
    await this.detector.initialize();

    this.initialized = true;
  }

  start() {
    if (!this.initialized || !this.detector) {
      throw new Error('Validation Error: V-Gesture not initialized')
    }

    const detector: HandDetector = this.detector

    detector.startPrediction()
  }

  pause() {
    if (!this.initialized) {
      throw new Error('Validation Error: V-Gesture not initialized')
    }
    this.detector?.pausePrediction()
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

  private async _generateGestureTargetCollection() {
    const PREFIX = 'g-clickable-element'
    const elemBoundaries: ElementBoundary[] = []
    let id = 0;

    await fastdom.mutate(() => {
      // traverse sub Dom tree root of body node, and find all elems with gClickable specified elements
      // then create kdtree to handle event target domain
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
}