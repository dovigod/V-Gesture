export class ClickGestureEvent extends Event {

  indexTip: any;
  thumbTip: any;
  triggerPoint: {
    x: number,
    y: number
  }

  constructor(type: string, gestureInfo: any, eventInitDict?: EventInit) {
    super(type, eventInitDict);
    this.indexTip = gestureInfo.indexTip;
    this.thumbTip = gestureInfo.thumbTip;

    console.log(gestureInfo)

    this.triggerPoint = {
      x: window.innerWidth - (this.indexTip.x + this.thumbTip.x) / 2,
      y: (this.indexTip.y + this.thumbTip.y) / 2,
    }
  }
}