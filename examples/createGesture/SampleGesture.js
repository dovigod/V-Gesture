import { SampleGestureEvent } from "./SampleEvent";

export class PointGesture {
  constructor() {
    this.name = "sampleGesture";
    this.eventName = "sampleGesture";
    this.dispatchInterval = 0;
  }

  handler(event, dataDomain) {
    console.log("event occured!!");
  }

  determinant(hands) {
    let leftHand = hands.find((hand) => {
      if (hand.handedness === "Left") {
        return hand;
      }
    });
    let indexTip = leftHand?.keypoints.find(
      (keypoint) => keypoint.name === "index_finger_tip"
    );
    if (indexTip) {
      dispatchEvent(new SampleGestureEvent(this.eventName, { indexTip }));
      return true;
    }

    return false;
  }
}
