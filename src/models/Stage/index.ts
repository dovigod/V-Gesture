import { Helper, Tip } from '../../types';
import { CANVAS_ELEMENT_ID, DEFAULT_HIT_POINT_COLOR, DEFAULT_HIT_POINT_SIZE, DEFAULT_TIP_VERTEX_COLOR, DEFAULT_TIP_VERTEX_SIZE, DEFAULT_VERTEX_COLOR, DEFAULT_VERTEX_SIZE, LEFT_HAND_CONTAINER_ELEMENT_ID, RIGHT_HAND_CONTAINER_ELEMENT_ID, VIDEO_ELEMENT_ID } from '../../constant';
import { HitPoint } from './Hitpoint';

let resizeFunc: () => void;

export class Stage {
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  helper: Helper | null;
  hitpoints: any;
  initialized: boolean = false;


  constructor(helper: Helper | null) {
    this.canvas = document.getElementById(CANVAS_ELEMENT_ID) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.helper = helper;
    this.hitpoints = [];
    this._resize();
    this.initialized = true;
    resizeFunc = this._resize.bind(this)
    this.connect();
  }

  connect() {
    if (resizeFunc) {
      window.addEventListener('resize', resizeFunc);
    }
  }
  disconnect() {
    if (resizeFunc) {
      window.removeEventListener('resize', resizeFunc);
    }
  }

  private _resize() {

    this.clearCtx()
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.canvas.width = window.innerWidth * 2;
    this.canvas.height = window.innerHeight * 2;
    //flip
    this.ctx.translate(window.innerWidth * 2, 0);
    this.ctx.scale(-2, 2)
  }

  createHitPoint(point: { x: number, y: number }) {
    const color = this.helper?.hitpoint.color || DEFAULT_HIT_POINT_COLOR;
    const size = this.helper?.hitpoint.size || DEFAULT_HIT_POINT_SIZE;
    const hitpoint = new HitPoint(this.ctx, point, color, size);
    this.hitpoints.push(hitpoint)
  }

  drawHitPoint() {
    if (!this.helper) {
      return;
    }
    this.hitpoints.forEach((hitpoint: any) => {
      hitpoint.update();
      hitpoint.draw();
      if (hitpoint.lifespan < 0) {
        this.hitpoints.shift();
      }
    })
  }

  drawTips(tip: Tip) {
    if (!tip) {
      return;
    }
    if (!this.helper) {
      return;
    }
    let color = DEFAULT_VERTEX_COLOR;
    let size = DEFAULT_VERTEX_SIZE;

    switch (tip.name) {
      case 'thumbTip': {
        color = this.helper?.colors['thumbTip'] || DEFAULT_TIP_VERTEX_COLOR[0]
        size = this.helper?.sizes['thumbTip'] || DEFAULT_TIP_VERTEX_SIZE
        break;
      }
      case 'indexTip': {
        color = this.helper?.colors['indexTip'] || DEFAULT_TIP_VERTEX_COLOR[1]
        size = this.helper?.sizes['indexTip'] || DEFAULT_TIP_VERTEX_SIZE
        break;
      }
      case 'middleTip': {
        color = this.helper?.colors['middleTip'] || DEFAULT_TIP_VERTEX_COLOR[2]
        size = this.helper?.sizes['middleTip'] || DEFAULT_TIP_VERTEX_SIZE
        break;
      }
      case 'ringTip': {
        color = this.helper?.colors['ringTip'] || DEFAULT_TIP_VERTEX_COLOR[3]
        size = this.helper?.sizes['ringTip'] || DEFAULT_TIP_VERTEX_SIZE
        break;
      }
      case 'pinkyTip': {
        color = this.helper?.colors['pinkyTip'] || DEFAULT_TIP_VERTEX_COLOR[4]
        size = this.helper?.sizes['pinkyTip'] || DEFAULT_TIP_VERTEX_SIZE
        break;
      }
    }
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    if (typeof tip.x === 'number' && typeof tip.y === 'number') {
      this.drawPoint(tip.x, tip.y, size);
    }
    this.ctx.closePath()

  }

  clearCtx() {
    this.ctx.clearRect(0, 0, document.body.clientWidth * 2, document.body.clientHeight * 2);
  }

  drawPoint(x: number, y: number, r: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  drawVideo(video: any) {
    this.ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
  }
}