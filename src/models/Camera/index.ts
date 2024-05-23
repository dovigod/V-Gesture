import { ERROR_TYPE } from '../../types';
import { VIDEO_ELEMENT_ID } from '../../constant';
import { VGestureError } from '../../error';


let resizeTimer: number | null = null


let mediaUpdateFunc: () => void;
export class Camera {
  video!: HTMLVideoElement;
  targetFPS: number;
  ready: boolean = false;
  stream: MediaStream

  constructor(stream: MediaStream, config: any) {
    this.video = document.getElementById(VIDEO_ELEMENT_ID)! as HTMLVideoElement;
    this.targetFPS = config.targetFPS
    this.stream = stream;
    mediaUpdateFunc = this.updateMedia.bind(this);
    window.addEventListener('resize', mediaUpdateFunc);
    this.ready = true;
  }

  /**
   * Initiate a Camera instance and wait for the camera stream to be ready.
   */
  static async setupCamera(cameraParam: any) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new VGestureError(
        ERROR_TYPE.UNSUPPORT,
        'Camera.setupCamera',
        'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const { targetFPS } = cameraParam;
    const videoConfig = {
      'audio': false,
      'video': {
        facingMode: 'user',
        width: window.innerWidth,
        height: window.innerHeight,
        frameRate: {
          ideal: targetFPS,
        }
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
    const camera = new Camera(stream, { targetFPS });

    camera.video.srcObject = stream
    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(camera.video);
      };
    });
    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;
    return camera;
  }


  close() {
    const tracks = (this.video.srcObject as MediaStream).getVideoTracks();
    tracks[0].stop();
    this.ready = false;
  }
  private async updateMedia() {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    resizeTimer = setTimeout(async () => {
      this.close();
      this.video.pause();
      const videoConfig = {
        'audio': false,
        'video': {
          facingMode: 'user',
          width: window.innerWidth,
          height: window.innerHeight,
          frameRate: {
            ideal: this.targetFPS,
          }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
      this.video.srcObject = stream;
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          resolve(this.video);
        };
      });
      this.video.width = this.video.videoWidth;
      this.video.height = this.video.videoHeight;
      this.video.play();
      resizeTimer = null;
      this.ready = true

    }, 500)
  }
}
