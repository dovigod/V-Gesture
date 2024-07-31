export class SampleGestureEvent extends Event {
  constructor(type, gestureInfo, eventInitDict) {
    super(type, eventInitDict);
    this.indexTip = gestureInfo.indexTip;

    if (gestureInfo?.indexTip) {
      this.indexTip = {
        x: gestureInfo.indexTip.x * 2,
        y: gestureInfo.indexTip.y * 2,
      };
    }
  }
}
